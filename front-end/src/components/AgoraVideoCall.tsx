import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';

interface AgoraVideoCallProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  onCallEnd: () => void;
  isInterviewer?: boolean;
}

interface CallState {
  isJoined: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  remoteUsers: IAgoraRTCRemoteUser[];
}

const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({
  appId,
  channelName,
  token,
  uid,
  onCallEnd,
  isInterviewer = false,
}) => {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isJoined: false,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    remoteUsers: [],
  });
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize and join channel
  useEffect(() => {
    const init = async () => {
      try {
        // Create local tracks
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        // Join channel
        await client.join(appId, channelName, token, uid);
        await client.publish([audioTrack, videoTrack]);

        setCallState(prev => ({ ...prev, isJoined: true }));

        // Handle remote users
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            const remoteVideoRef = remoteVideoRefs.current[user.uid.toString()];
            if (remoteVideoRef && user.videoTrack) {
              user.videoTrack.play(remoteVideoRef);
            }
          }
          
          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.play();
          }

          setCallState(prev => ({
            ...prev,
            remoteUsers: prev.remoteUsers.some(u => u.uid === user.uid)
              ? prev.remoteUsers.map(u => u.uid === user.uid ? user : u)
              : [...prev.remoteUsers, user]
          }));
        });

        client.on('user-unpublished', (user) => {
          setCallState(prev => ({
            ...prev,
            remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
          }));
        });

        client.on('user-left', (user) => {
          setCallState(prev => ({
            ...prev,
            remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
          }));
        });

      } catch (error) {
        console.error('Failed to initialize Agora:', error);
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [appId, channelName, token, uid, client]);

  const cleanup = async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (callState.isJoined) {
        await client.leave();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!callState.isAudioEnabled);
      setCallState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!callState.isVideoEnabled);
      setCallState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    }
  };

  const startScreenShare = async () => {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
        optimizationMode: "detail"
      });
      if (localVideoTrack) {
        await client.unpublish(localVideoTrack);
      }
      await client.publish(screenTrack);
      setCallState(prev => ({ ...prev, isScreenSharing: true }));
    } catch (error) {
      console.error('Screen sharing failed:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (localVideoTrack) {
        await client.publish(localVideoTrack);
      }
      setCallState(prev => ({ ...prev, isScreenSharing: false }));
    } catch (error) {
      console.error('Stop screen sharing failed:', error);
    }
  };

  const endCall = async () => {
    await cleanup();
    onCallEnd();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">
          مقابلة مرئية - {channelName}
        </h2>
        <div className="text-white text-sm">
          {isInterviewer ? 'المحاور' : 'المرشح'}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <Card className="relative overflow-hidden bg-gray-800">
          <CardHeader className="absolute top-2 left-2 z-10 p-2">
            <CardTitle className="text-white text-sm">
              {isInterviewer ? 'أنت (المحاور)' : 'أنت (المرشح)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <div 
              ref={localVideoRef} 
              className="w-full h-full min-h-[300px] bg-gray-700 rounded-lg"
            />
            {!callState.isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remote Videos */}
        {callState.remoteUsers.map((user) => (
          <Card key={user.uid} className="relative overflow-hidden bg-gray-800">
            <CardHeader className="absolute top-2 left-2 z-10 p-2">
              <CardTitle className="text-white text-sm">
                {isInterviewer ? 'المرشح' : 'المحاور'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div 
                ref={(el) => {
                  remoteVideoRefs.current[user.uid.toString()] = el;
                }}
                className="w-full h-full min-h-[300px] bg-gray-700 rounded-lg"
              />
            </CardContent>
          </Card>
        ))}

        {/* Waiting for participant */}
        {callState.remoteUsers.length === 0 && (
          <Card className="bg-gray-800 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="text-white text-lg mb-2">
                في انتظار {isInterviewer ? 'المرشح' : 'المحاور'}
              </div>
              <div className="text-gray-400 text-sm">
                سيتم الاتصال تلقائياً عند الانضمام
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4 rtl:space-x-reverse">
        <Button
          onClick={toggleAudio}
          variant={callState.isAudioEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12"
        >
          {callState.isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={callState.isVideoEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12"
        >
          {callState.isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>

        {isInterviewer && (
          <Button
            onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
            variant={callState.isScreenSharing ? "secondary" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Monitor />
          </Button>
        )}

        <Button
          onClick={endCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12"
        >
          <PhoneOff />
        </Button>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-700 px-4 py-2 text-center">
        <span className={`text-sm ${
          callState.isJoined ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {callState.isJoined ? 'متصل' : 'جاري الاتصال...'}
        </span>
      </div>
    </div>
  );
};

export default AgoraVideoCall;