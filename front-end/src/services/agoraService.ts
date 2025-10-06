import { apiService } from './apiService';

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
}

export interface InterviewAgoraDetails {
  id: string;
  agoraChannelName: string;
  agoraAppId: string;
  agoraToken?: string;
  isRecording: boolean;
  recordingId?: string;
  recordingUrl?: string;
}

export class AgoraService {
  /**
   * Generate Agora token for interview participant
   */
  static async generateToken(
    interviewId: string,
    role: 'interviewer' | 'candidate'
  ): Promise<AgoraTokenResponse> {
    try {
      const response = await apiService.post(
        `/interviews/agora/${interviewId}/token`,
        { role }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate Agora token:', error);
      throw new Error('فشل في إنشاء رمز الاتصال');
    }
  }

  /**
   * Get interview details with Agora information
   */
  static async getInterviewDetails(
    interviewId: string
  ): Promise<InterviewAgoraDetails> {
    try {
      const response = await apiService.get(
        `/interviews/agora/${interviewId}/details`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get interview details:', error);
      throw new Error('فشل في جلب تفاصيل المقابلة');
    }
  }

  /**
   * Start recording for an interview
   */
  static async startRecording(interviewId: string): Promise<{ recordingId: string }> {
    try {
      const response = await apiService.post(
        `/interviews/agora/${interviewId}/recording/start`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('فشل في بدء التسجيل');
    }
  }

  /**
   * Stop recording for an interview
   */
  static async stopRecording(interviewId: string): Promise<{ recordingUrl: string }> {
    try {
      const response = await apiService.post(
        `/interviews/agora/${interviewId}/recording/stop`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error('فشل في إيقاف التسجيل');
    }
  }

  /**
   * Validate Agora configuration
   */
  static validateAgoraConfig(appId: string, token: string, channelName: string): boolean {
    if (!appId || appId.trim() === '') {
      console.error('Agora App ID is required');
      return false;
    }

    if (!token || token.trim() === '') {
      console.error('Agora token is required');
      return false;
    }

    if (!channelName || channelName.trim() === '') {
      console.error('Agora channel name is required');
      return false;
    }

    return true;
  }

  /**
   * Generate a unique UID for the user
   */
  static generateUID(userId: string): number {
    // Convert userId string to a number
    // This is a simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Ensure positive number and within Agora's UID range
    return Math.abs(hash) % 2147483647;
  }

  /**
   * Check if browser supports required features
   */
  static checkBrowserSupport(): { supported: boolean; missing: string[] } {
    const missing: string[] = [];

    // Check for WebRTC support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      missing.push('WebRTC/getUserMedia');
    }

    // Check for WebRTC RTCPeerConnection
    if (!window.RTCPeerConnection) {
      missing.push('RTCPeerConnection');
    }

    // Check for screen sharing support
    if (!navigator.mediaDevices.getDisplayMedia) {
      missing.push('Screen Sharing');
    }

    return {
      supported: missing.length === 0,
      missing
    };
  }

  /**
   * Request camera and microphone permissions
   */
  static async requestPermissions(): Promise<{ audio: boolean; video: boolean }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      // Stop the stream immediately as we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      return { audio: true, video: true };
    } catch (error) {
      console.error('Permission request failed:', error);
      
      // Try to get individual permissions
      const permissions = { audio: false, video: false };
      
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(track => track.stop());
        permissions.audio = true;
      } catch (e) {
        console.warn('Audio permission denied');
      }
      
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.getTracks().forEach(track => track.stop());
        permissions.video = true;
      } catch (e) {
        console.warn('Video permission denied');
      }
      
      return permissions;
    }
  }
}

export default AgoraService;