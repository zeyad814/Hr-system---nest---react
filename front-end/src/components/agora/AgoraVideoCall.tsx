import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Monitor,
  MonitorOff,
  Users,
  Settings,
  MessageCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { AgoraService } from '@/services/agoraService';

interface AgoraVideoCallProps {
  interviewId: string;
  channelName: string;
  onLeave: () => void;
  userRole?: string;
}

export const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({
  interviewId,
  channelName,
  onLeave,
  userRole = "host",
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('DISCONNECTED');
  const [networkQuality, setNetworkQuality] = useState<{ uplink: number; downlink: number }>({ uplink: 0, downlink: 0 });
  const [audioLevels, setAudioLevels] = useState<{ [key: string]: number }>({});
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ uid: string; message: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const clientRef = useRef<any>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      // Check browser support
      if (!AgoraService.checkBrowserSupport()) {
        toast.error('المتصفح الحالي لا يدعم المكالمات المرئية');
        return;
      }

      // Request permissions
      const hasPermissions = await AgoraService.requestPermissions();
      if (!hasPermissions) {
        toast.error('يرجى السماح بالوصول للكاميرا والميكروفون');
        return;
      }

      // Create Agora client
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Set up event listeners
      clientRef.current.on('user-published', handleUserPublished);
      clientRef.current.on('user-unpublished', handleUserUnpublished);
      clientRef.current.on('user-joined', handleUserJoined);
      clientRef.current.on('user-left', handleUserLeft);
      clientRef.current.on('connection-state-changed', handleConnectionStateChanged);
      clientRef.current.on('network-quality', handleNetworkQuality);
      clientRef.current.enableAudioVolumeIndicator();

      await joinChannel();
    } catch (error) {
      console.error('Error initializing Agora:', error);
      toast.error('فشل في تهيئة المكالمة المرئية');
    }
  };

  const joinChannel = async () => {
    try {
      // Get Agora token
      const tokenData = await AgoraService.generateToken(interviewId, 'candidate');
      const { token, appId, uid } = tokenData;

      // Join channel
      await clientRef.current.join(appId, channelName, token, uid);
      setConnectionState('CONNECTED');

      // Create and publish local tracks
      await createAndPublishTracks();
      setIsJoined(true);
      toast.success('تم الانضمام للمقابلة المرئية بنجاح');
    } catch (error) {
      console.error('Error joining channel:', error);
      toast.error('فشل في الانضمام للمقابلة المرئية');
    }
  };

  const createAndPublishTracks = async () => {
    try {
      // Create audio and video tracks
      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();

      // Play local video
      if (localVideoRef.current && localVideoTrackRef.current) {
        localVideoTrackRef.current.play(localVideoRef.current);
      }

      // Publish tracks
      await clientRef.current.publish([
        localAudioTrackRef.current,
        localVideoTrackRef.current,
      ]);
    } catch (error) {
      console.error('Error creating tracks:', error);
      toast.error('فشل في تشغيل الكاميرا والميكروفون');
    }
  };

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    await clientRef.current.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      setRemoteUsers(prev => {
        const existingUser = prev.find(u => u.uid === user.uid);
        if (existingUser) {
          return prev.map(u => u.uid === user.uid ? user : u);
        }
        return [...prev, user];
      });
    }

    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (mediaType === 'video') {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    }
  };

  const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
    console.log('User joined:', user.uid);
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const handleConnectionStateChanged = (curState: string, revState: string) => {
    setConnectionState(curState);
    console.log('Connection state changed:', curState);
  };

  const handleNetworkQuality = (stats: any) => {
    setNetworkQuality({
      uplink: stats.uplinkNetworkQuality,
      downlink: stats.downlinkNetworkQuality
    });
  };

  const handleVolumeIndicator = (volumes: Array<{ uid: string; level: number }>) => {
    const newLevels: { [key: string]: number } = {};
    volumes.forEach(({ uid, level }) => {
      newLevels[uid.toString()] = level;
    });
    setAudioLevels(newLevels);
  };

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const startScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenTrackRef.current) {
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        
        // Resume camera
        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish(localVideoTrackRef.current);
          localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
          await clientRef.current.publish(localVideoTrackRef.current);
          if (localVideoRef.current) {
            localVideoTrackRef.current.play(localVideoRef.current);
          }
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
          optimizationMode: 'detail'
        });
        // Handle the case where createScreenVideoTrack returns an array
        screenTrackRef.current = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
        
        // Stop camera and publish screen
        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish(localVideoTrackRef.current);
          localVideoTrackRef.current.close();
        }
        
        await clientRef.current.publish(screenTrackRef.current);
        if (localVideoRef.current) {
          screenTrackRef.current.play(localVideoRef.current);
        }
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('فشل في مشاركة الشاشة');
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await AgoraService.stopRecording(interviewId);
        setIsRecording(false);
        toast.success('تم إيقاف التسجيل');
      } else {
        const result = await AgoraService.startRecording(interviewId);
        if (result.recordingId) {
          setIsRecording(true);
          toast.success('تم بدء التسجيل');
        } else {
          toast.error('فشل في بدء التسجيل');
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast.error('خطأ في التسجيل');
    }
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    // Apply speaker setting to all remote audio tracks
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(speakerEnabled ? 0 : 100);
      }
    });
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        uid: 'local',
        message: chatInput.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
      // In a real implementation, you would send this via Agora RTM or websocket
    }
  };

  const leaveChannel = async () => {
    try {
      await cleanup();
      onLeave();
      toast.success('تم مغادرة المقابلة');
    } catch (error) {
      console.error('Error leaving channel:', error);
      onLeave();
    }
  };

  const cleanup = async () => {
    try {
      // Stop recording if active
      if (isRecording) {
        await AgoraService.stopRecording(interviewId);
      }

      // Close local tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }

      // Leave channel
      if (clientRef.current && isJoined) {
        await clientRef.current.leave();
      }

      setIsJoined(false);
      setRemoteUsers([]);
      setConnectionState('DISCONNECTED');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  useEffect(() => {
    // Play remote videos when users change
    remoteUsers.forEach(user => {
      if (user.videoTrack && remoteVideoRefs.current[user.uid.toString()]) {
        user.videoTrack.play(remoteVideoRefs.current[user.uid.toString()]!);
      }
    });
  }, [remoteUsers]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>المشاركون: {remoteUsers.length + 1}</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            connectionState === 'CONNECTED' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {connectionState === 'CONNECTED' ? 'متصل' : 'غير متصل'}
          </div>
          {/* Network Quality Indicator */}
          <div className="flex items-center gap-1">
            {networkQuality.uplink > 3 ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : networkQuality.uplink > 1 ? (
              <Wifi className="h-4 w-4 text-yellow-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs">الشبكة</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              جاري التسجيل
            </div>
          )}
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid gap-4 h-full ${
          remoteUsers.length === 0 ? 'grid-cols-1' :
          remoteUsers.length === 1 ? 'grid-cols-2' :
          remoteUsers.length <= 4 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-3 grid-rows-2'
        }`}>
          {/* Local Video */}
          <Card className="relative overflow-hidden bg-gray-800">
            <CardContent className="p-0 h-full">
              <div 
                ref={localVideoRef}
                className="w-full h-full bg-gray-700 flex items-center justify-center"
              >
                {!isVideoEnabled && (
                  <div className="text-white text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>الكاميرا مغلقة</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                أنت {isScreenSharing && '(مشاركة الشاشة)'}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {!isAudioEnabled && (
                  <div className="bg-red-600 p-1 rounded">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
                {!isVideoEnabled && (
                  <div className="bg-red-600 p-1 rounded">
                    <VideoOff className="h-3 w-3 text-white" />
                  </div>
                )}
                {/* Audio Level Indicator */}
                {audioLevels['local'] > 0 && (
                  <div className="bg-green-600 p-1 rounded">
                    <Volume2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Videos */}
          {remoteUsers.map((user) => (
            <Card key={user.uid} className="relative overflow-hidden bg-gray-800">
              <CardContent className="p-0 h-full">
                <div 
                  ref={(el) => {
                    remoteVideoRefs.current[user.uid.toString()] = el;
                  }}
                  className="w-full h-full bg-gray-700 flex items-center justify-center"
                >
                  {!user.videoTrack && (
                    <div className="text-white text-center">
                      <VideoOff className="h-12 w-12 mx-auto mb-2" />
                      <p>المشارك {user.uid}</p>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  المشارك {user.uid}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {!user.audioTrack && (
                    <div className="bg-red-600 p-1 rounded">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {!user.videoTrack && (
                    <div className="bg-red-600 p-1 rounded">
                      <VideoOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {/* Audio Level Indicator */}
                  {audioLevels[user.uid.toString()] > 0 && (
                    <div className="bg-green-600 p-1 rounded">
                      <Volume2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          onClick={startScreenShare}
          variant={isScreenSharing ? "secondary" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>

        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <div className={`w-4 h-4 rounded ${isRecording ? 'bg-white' : 'bg-red-600'}`} />
        </Button>

        <Button
          onClick={toggleSpeaker}
          variant={speakerEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {speakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        <Button
          onClick={leaveChannel}
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0 ml-4"
        >
          <Phone className="h-5 w-5 rotate-[135deg]" />
        </Button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-600 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <h3 className="text-white font-semibold">المحادثة</h3>
            <Button
              onClick={() => setShowChat(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              ×
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`p-2 rounded max-w-xs ${
                msg.uid === 'local' 
                  ? 'bg-red-600  text-white ml-auto' 
                  : 'bg-gray-600 text-white'
              }`}>
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="اكتب رسالة..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <Button
                onClick={sendChatMessage}
                size="sm"
                className="px-4"
              >
                إرسال
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};