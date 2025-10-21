import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);
  private calendar: any;

  constructor(private configService: ConfigService) {
    this.initializeGoogleCalendar();
  }

  private initializeGoogleCalendar() {
    try {
      const credentialsPath = this.configService.get<string>('GOOGLE_CREDENTIALS_PATH');
      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');

      if (!credentialsPath || !calendarId) {
        this.logger.warn('Google Meet credentials not configured (GOOGLE_CREDENTIALS_PATH or GOOGLE_CALENDAR_ID missing)');
        return;
      }

      // Check if credentials file exists
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.resolve(process.cwd(), credentialsPath);

      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Google credentials file not found at: ${fullPath}`);
        return;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: fullPath,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.logger.log('✅ Google Calendar API initialized successfully');
      this.logger.log(`📅 Using Calendar ID: ${calendarId}`);
    } catch (error) {
      this.logger.error('Failed to initialize Google Calendar API:', error);
    }
  }

  async createMeetingLink(interviewData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendeeEmails: string[];
  }): Promise<{
    meetingLink: string;
    meetingId: string;
    calendarEventId: string;
  }> {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';

      const event = {
        summary: interviewData.title,
        description: interviewData.description || 'Interview Meeting',
        start: {
          dateTime: interviewData.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: interviewData.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: interviewData.attendeeEmails.map(email => ({
          email,
          responseStatus: 'needsAction',
        })),
        conferenceData: {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        conferenceDataVersion: 1,
      });

      const meetingLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
      const meetingId = response.data.conferenceData?.conferenceId;
      const calendarEventId = response.data.id;

      if (!meetingLink) {
        throw new Error('Failed to generate Google Meet link');
      }

      this.logger.log(`Google Meet link created: ${meetingLink}`);

      return {
        meetingLink,
        meetingId,
        calendarEventId,
      };
    } catch (error) {
      this.logger.error('Failed to create Google Meet link:', error);
      throw new Error(`Failed to create Google Meet link: ${error.message}`);
    }
  }

  async updateMeeting(calendarEventId: string, updatedData: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    attendeeEmails?: string[];
  }): Promise<void> {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';

      const event = {
        summary: updatedData.title,
        description: updatedData.description,
        start: updatedData.startTime ? {
          dateTime: updatedData.startTime.toISOString(),
          timeZone: 'UTC',
        } : undefined,
        end: updatedData.endTime ? {
          dateTime: updatedData.endTime.toISOString(),
          timeZone: 'UTC',
        } : undefined,
        attendees: updatedData.attendeeEmails?.map(email => ({
          email,
          responseStatus: 'needsAction',
        })),
      };

      // Remove undefined fields
      Object.keys(event).forEach(key => {
        if ((event as any)[key] === undefined) {
          delete (event as any)[key];
        }
      });

      await this.calendar.events.update({
        calendarId,
        eventId: calendarEventId,
        resource: event,
      });

      this.logger.log(`Google Meet event updated: ${calendarEventId}`);
    } catch (error) {
      this.logger.error('Failed to update Google Meet event:', error);
      throw new Error(`Failed to update Google Meet event: ${error.message}`);
    }
  }

  async cancelMeeting(calendarEventId: string): Promise<void> {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';

      await this.calendar.events.delete({
        calendarId,
        eventId: calendarEventId,
      });

      this.logger.log(`Google Meet event cancelled: ${calendarEventId}`);
    } catch (error) {
      this.logger.error('Failed to cancel Google Meet event:', error);
      throw new Error(`Failed to cancel Google Meet event: ${error.message}`);
    }
  }

  async getMeetingDetails(calendarEventId: string): Promise<{
    meetingLink: string;
    meetingId: string;
    status: string;
  }> {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API not initialized');
      }

      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';

      const response = await this.calendar.events.get({
        calendarId,
        eventId: calendarEventId,
      });

      const meetingLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
      const meetingId = response.data.conferenceData?.conferenceId;
      const status = response.data.status;

      return {
        meetingLink,
        meetingId,
        status,
      };
    } catch (error) {
      this.logger.error('Failed to get Google Meet details:', error);
      throw new Error(`Failed to get Google Meet details: ${error.message}`);
    }
  }
}
