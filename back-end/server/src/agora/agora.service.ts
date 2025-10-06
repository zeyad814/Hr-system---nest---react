import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { v4 as uuidv4 } from 'uuid';

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
}

export interface AgoraChannelInfo {
  channelName: string;
  appId: string;
  appCertificate: string;
}

@Injectable()
export class AgoraService {
  private readonly logger = new Logger(AgoraService.name);
  private readonly appId: string | undefined;
  private readonly appCertificate: string | undefined;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('AGORA_APP_ID');
    this.appCertificate = this.configService.get<string>('AGORA_APP_CERTIFICATE');
    
    if (!this.appId || !this.appCertificate) {
      this.logger.warn('Agora credentials not configured. Video interviews will not be available.');
    }
  }

  /**
   * Generate a unique channel name for an interview
   */
  generateChannelName(interviewId: string): string {
    return `interview_${interviewId}_${Date.now()}`;
  }

  /**
   * Generate Agora RTC token for video call
   */
  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher',
    expirationTimeInSeconds: number = 3600 // 1 hour default
  ): string {
    if (!this.appId || !this.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    try {
      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        agoraRole,
        privilegeExpiredTs,
        privilegeExpiredTs
      );

      this.logger.log(`Generated RTC token for channel: ${channelName}, uid: ${uid}`);
      return token;
    } catch (error) {
      this.logger.error(`Failed to generate RTC token: ${error.message}`);
      throw new Error('Failed to generate video call token');
    }
  }

  /**
   * Generate token response for interview participants
   */
  generateInterviewToken(
    interviewId: string,
    userId: string,
    role: 'interviewer' | 'candidate' = 'interviewer'
  ): AgoraTokenResponse {
    const channelName = this.generateChannelName(interviewId);
    const uid = this.generateUid(userId);
    const tokenRole = role === 'interviewer' ? 'publisher' : 'publisher'; // Both can publish
    
    const token = this.generateRtcToken(channelName, uid, tokenRole);

    return {
      token,
      channelName,
      uid,
      appId: this.appId!
    };
  }

  /**
   * Generate a numeric UID from user ID string
   */
  private generateUid(userId: string): number {
    // Convert string to a consistent numeric value
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
   * Validate if Agora is properly configured
   */
  isConfigured(): boolean {
    return !!(this.appId && this.appCertificate);
  }

  /**
   * Get Agora configuration info
   */
  getAgoraConfig(): AgoraChannelInfo {
    if (!this.isConfigured()) {
      throw new Error('Agora not configured');
    }

    return {
      channelName: '',
      appId: this.appId!,
      appCertificate: this.appCertificate!
    };
  }

  /**
   * Start cloud recording for an interview
   */
  async startRecording(channelName: string, uid: number): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Agora not configured for recording');
    }

    try {
      // This would integrate with Agora Cloud Recording API
      // For production, you would call the actual Agora Cloud Recording REST API
      // Example: POST https://api.agora.io/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start
      
      const recordingId = `rec_${channelName}_${Date.now()}`;
      
      this.logger.log(`Started recording for channel: ${channelName}, recordingId: ${recordingId}`);
      
      // In production, you would:
      // 1. Acquire a resource ID
      // 2. Start the recording with the resource ID
      // 3. Return the actual recording resource ID
      
      return recordingId;
    } catch (error) {
      this.logger.error(`Failed to start recording for channel ${channelName}:`, error);
      throw new Error('Failed to start recording');
    }
  }

  /**
   * Stop cloud recording for an interview
   */
  async stopRecording(recordingId: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Agora not configured for recording');
    }

    try {
      // This would integrate with Agora Cloud Recording API
      // For production, you would call the actual Agora Cloud Recording REST API
      // Example: POST https://api.agora.io/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/stop
      
      const recordingUrl = `https://recordings.agora.io/${recordingId}.mp4`;
      
      this.logger.log(`Stopped recording: ${recordingId}, URL: ${recordingUrl}`);
      
      // In production, you would:
      // 1. Stop the recording using the resource ID and SID
      // 2. Get the actual recording file URLs from the response
      // 3. Return the actual recording URL(s)
      
      return recordingUrl;
    } catch (error) {
      this.logger.error(`Failed to stop recording ${recordingId}:`, error);
      throw new Error('Failed to stop recording');
    }
  }

  /**
   * Refresh token if it's about to expire
   */
  refreshToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher'
  ): string {
    return this.generateRtcToken(channelName, uid, role);
  }
}