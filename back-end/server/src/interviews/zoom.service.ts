import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);
  private zoomClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    this.initializeZoomClient();
  }

  private initializeZoomClient() {
    try {
      const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID');
      const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
      const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');

      if (!accountId || !clientId || !clientSecret) {
        this.logger.warn('Zoom credentials not configured (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, or ZOOM_CLIENT_SECRET missing)');
        return;
      }

      // Create base axios instance for Zoom API
      this.zoomClient = axios.create({
        baseURL: 'https://api.zoom.us/v2',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor to inject access token
      this.zoomClient.interceptors.request.use(async (config) => {
        await this.ensureAccessToken();
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      });

      this.logger.log('✅ Zoom API client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Zoom API client:', error);
    }
  }

  /**
   * Get OAuth access token using Server-to-Server OAuth
   */
  private async getAccessToken(): Promise<string> {
    try {
      const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID');
      const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
      const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');

      if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom credentials not configured');
      }

      // Use Server-to-Server OAuth (recommended for production)
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      // Zoom OAuth token endpoint with proper format
      const tokenUrl = 'https://zoom.us/oauth/token';
      
      // Send POST request with account_id in query string
      const response = await axios.post(
        `${tokenUrl}?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
        null, // No body
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in } = response.data;
      
      // Set expiration time (subtract 5 minutes for safety)
      this.tokenExpiresAt = Date.now() + (expires_in - 300) * 1000;
      
      this.logger.log('✅ Zoom access token obtained successfully');
      return access_token;
    } catch (error: any) {
      this.logger.error('❌ Failed to get Zoom access token');
      this.logger.error('Status:', error.response?.status);
      this.logger.error('Response:', JSON.stringify(error.response?.data, null, 2));
      this.logger.error('Error message:', error.message);
      
      // Provide more detailed error message
      const errorDetails = error.response?.data;
      let errorMessage = 'Failed to get Zoom access token';
      
      if (errorDetails) {
        if (errorDetails.error === 'invalid_client') {
          errorMessage = 'Invalid Client ID or Client Secret. Please check your Zoom credentials.';
        } else if (errorDetails.error === 'invalid_account') {
          errorMessage = 'Invalid Account ID. Please check your ZOOM_ACCOUNT_ID.';
        } else if (errorDetails.error_description) {
          errorMessage = errorDetails.error_description;
        } else if (errorDetails.error) {
          errorMessage = errorDetails.error;
        }
      }
      
      throw new Error(`${errorMessage} (Status: ${error.response?.status || 'N/A'})`);
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  private async ensureAccessToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      this.accessToken = await this.getAccessToken();
      this.logger.log('Zoom access token refreshed');
    }
  }

  /**
   * Create a Zoom meeting
   */
  async createMeeting(meetingData: {
    title: string;
    description?: string;
    startTime: Date;
    duration: number; // in minutes
    timezone?: string;
    attendeeEmails?: string[];
  }): Promise<{
    meetingLink: string;
    meetingId: string;
    password?: string;
  }> {
    try {
      if (!this.zoomClient) {
        throw new Error('Zoom API client not initialized');
      }

      await this.ensureAccessToken();

      // Calculate end time
      const startTime = meetingData.startTime;
      const endTime = new Date(startTime.getTime() + meetingData.duration * 60000);

      // Create meeting payload
      const meetingPayload = {
        topic: meetingData.title,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        duration: meetingData.duration,
        timezone: meetingData.timezone || 'UTC',
        agenda: meetingData.description || 'Interview Meeting',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: false,
          watermark: false,
          waiting_room: false,
          approval_type: 0, // Automatically approve
          audio: 'both', // Both telephony and VoIP
          auto_recording: 'none', // No automatic recording
          enforce_login: false,
        },
      };

      const userId = this.configService.get<string>('ZOOM_USER_ID') || 'me';

      const response = await this.zoomClient.post(`/users/${userId}/meetings`, meetingPayload);

      const meetingId = response.data.id.toString();
      const meetingLink = response.data.join_url;
      const password = response.data.password;

      this.logger.log(`Zoom meeting created: ${meetingLink}`);

      return {
        meetingLink,
        meetingId,
        password,
      };
    } catch (error: any) {
      this.logger.error('Failed to create Zoom meeting:', error.response?.data || error.message);
      throw new Error(`Failed to create Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Update a Zoom meeting
   */
  async updateMeeting(
    meetingId: string,
    updatedData: {
      title?: string;
      description?: string;
      startTime?: Date;
      duration?: number;
      attendeeEmails?: string[];
    }
  ): Promise<void> {
    try {
      if (!this.zoomClient) {
        throw new Error('Zoom API client not initialized');
      }

      await this.ensureAccessToken();

      const updatePayload: any = {};

      if (updatedData.title) {
        updatePayload.topic = updatedData.title;
      }

      if (updatedData.description) {
        updatePayload.agenda = updatedData.description;
      }

      if (updatedData.startTime) {
        updatePayload.start_time = updatedData.startTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
      }

      if (updatedData.duration) {
        updatePayload.duration = updatedData.duration;
      }

      await this.zoomClient.patch(`/meetings/${meetingId}`, updatePayload);

      this.logger.log(`Zoom meeting updated: ${meetingId}`);
    } catch (error: any) {
      this.logger.error('Failed to update Zoom meeting:', error.response?.data || error.message);
      throw new Error(`Failed to update Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Delete/Cancel a Zoom meeting
   */
  async cancelMeeting(meetingId: string): Promise<void> {
    try {
      if (!this.zoomClient) {
        throw new Error('Zoom API client not initialized');
      }

      await this.ensureAccessToken();

      await this.zoomClient.delete(`/meetings/${meetingId}`);

      this.logger.log(`Zoom meeting cancelled: ${meetingId}`);
    } catch (error: any) {
      this.logger.error('Failed to cancel Zoom meeting:', error.response?.data || error.message);
      throw new Error(`Failed to cancel Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Get meeting details
   */
  async getMeetingDetails(meetingId: string): Promise<{
    meetingLink: string;
    meetingId: string;
    status: string;
  }> {
    try {
      if (!this.zoomClient) {
        throw new Error('Zoom API client not initialized');
      }

      await this.ensureAccessToken();

      const response = await this.zoomClient.get(`/meetings/${meetingId}`);

      return {
        meetingLink: response.data.join_url,
        meetingId: response.data.id.toString(),
        status: response.data.status || 'active',
      };
    } catch (error: any) {
      this.logger.error('Failed to get Zoom meeting details:', error.response?.data || error.message);
      throw new Error(`Failed to get Zoom meeting details: ${error.message}`);
    }
  }

  /**
   * Check if Zoom is configured
   */
  isConfigured(): boolean {
    const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID');
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
    
    return !!(accountId && clientId && clientSecret && this.zoomClient);
  }
}

