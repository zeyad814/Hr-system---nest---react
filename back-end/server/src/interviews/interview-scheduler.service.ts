import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleMeetService } from './google-meet.service';
import { ZoomService } from './zoom.service';
import { CreateInterviewScheduleDto, UpdateInterviewScheduleDto } from './dto/interview-schedule.dto';

@Injectable()
export class InterviewSchedulerService {
  private readonly logger = new Logger(InterviewSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private googleMeetService: GoogleMeetService,
    private zoomService: ZoomService,
  ) {}

  async createInterviewSchedule(createDto: CreateInterviewScheduleDto) {
    try {
      // Calculate end time based on duration
      const startTime = new Date(createDto.scheduledDate);
      const endTime = new Date(startTime.getTime() + createDto.duration * 60000);

      let meetingLink: string | null = null;
      let meetingId: string | null = null;
      let calendarEventId: string | null = null;

      // Generate meeting link based on meeting type
      if (createDto.meetingType === 'GOOGLE_MEET') {
        try {
          const meetingData = await this.googleMeetService.createMeetingLink({
            title: createDto.title,
            description: createDto.description,
            startTime,
            endTime,
            attendeeEmails: [createDto.candidateEmail, createDto.interviewerEmail],
          });

          meetingLink = meetingData.meetingLink;
          meetingId = meetingData.meetingId;
          calendarEventId = meetingData.calendarEventId;
        } catch (error) {
          this.logger.warn('Failed to create Google Meet link, using Jitsi instead:', error.message);
          // Generate a working Jitsi Meet link (free and works immediately)
          const roomName = `interview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          meetingId = roomName;
          meetingLink = `https://meet.jit.si/${roomName}`;
          this.logger.log('Created Jitsi Meet link: ' + meetingLink);
        }
      } else if (createDto.meetingType === 'ZOOM') {
        try {
          if (this.zoomService.isConfigured()) {
            const meetingData = await this.zoomService.createMeeting({
              title: createDto.title,
              description: createDto.description,
              startTime,
              duration: createDto.duration,
              timezone: 'UTC',
              attendeeEmails: [createDto.candidateEmail, createDto.interviewerEmail],
            });

            meetingLink = meetingData.meetingLink;
            meetingId = meetingData.meetingId;
            this.logger.log('Created Zoom meeting: ' + meetingLink);
          } else {
            throw new Error('Zoom API not configured');
          }
        } catch (error: any) {
          this.logger.warn('Failed to create Zoom meeting, using Jitsi instead:', error.message);
          // Fallback to Jitsi Meet if Zoom API is not configured or fails
          const roomName = `interview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          meetingId = roomName;
          meetingLink = `https://meet.jit.si/${roomName}`;
          this.logger.log('Created Jitsi Meet link for Zoom meeting type: ' + meetingLink);
        }
      }

      // Create interview schedule in database
      const interviewSchedule = await this.prisma.interviewSchedule.create({
        data: {
          title: createDto.title,
          description: createDto.description,
          candidateName: createDto.candidateName,
          candidateEmail: createDto.candidateEmail,
          interviewerName: createDto.interviewerName,
          interviewerEmail: createDto.interviewerEmail,
          scheduledDate: startTime,
          duration: createDto.duration,
          meetingType: createDto.meetingType,
          meetingLink,
          meetingId,
          status: 'SCHEDULED',
          notes: createDto.notes,
        },
      });

      // Create meeting link record if meeting was created
      if (meetingLink && calendarEventId) {
        await this.prisma.meetingLink.create({
          data: {
            interviewId: interviewSchedule.id,
            meetingType: createDto.meetingType,
            meetingLink,
            meetingId,
          },
        });
      }

      this.logger.log(`Interview schedule created: ${interviewSchedule.id}`);

      // Check if we used Jitsi fallback for Zoom
      const isJitsiFallback = createDto.meetingType === 'ZOOM' && 
        meetingLink && 
        meetingLink.includes('meet.jit.si');

      const response: any = {
        ...interviewSchedule,
        calendarEventId,
      };

      if (isJitsiFallback) {
        response.fallbackUsed = true;
        response.fallbackReason = !this.zoomService.isConfigured()
          ? 'Zoom API not configured. Please add ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET to .env file.'
          : 'Failed to create Zoom meeting. Using Jitsi Meet instead.';
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to create interview schedule:', error);
      throw new Error(`Failed to create interview schedule: ${error.message}`);
    }
  }

  async updateInterviewSchedule(id: string, updateDto: UpdateInterviewScheduleDto) {
    try {
      const existingSchedule = await this.prisma.interviewSchedule.findUnique({
        where: { id },
      });

      if (!existingSchedule) {
        throw new Error('Interview schedule not found');
      }

      // Update meeting event if it exists
      if (existingSchedule.meetingId) {
        const startTime = updateDto.scheduledDate ? new Date(updateDto.scheduledDate) : new Date(existingSchedule.scheduledDate);
        const meetingType = updateDto.meetingType || existingSchedule.meetingType;

        if (meetingType === 'GOOGLE_MEET') {
          try {
            const endTime = new Date(startTime.getTime() + (updateDto.duration || existingSchedule.duration) * 60000);
            await this.googleMeetService.updateMeeting(existingSchedule.meetingId, {
              title: updateDto.title,
              description: updateDto.description,
              startTime,
              endTime,
              attendeeEmails: updateDto.candidateEmail || updateDto.interviewerEmail ? 
                [updateDto.candidateEmail || existingSchedule.candidateEmail, 
                 updateDto.interviewerEmail || existingSchedule.interviewerEmail] : undefined,
            });
          } catch (error) {
            this.logger.warn('Failed to update Google Meet event:', error.message);
          }
        } else if (meetingType === 'ZOOM' && this.zoomService.isConfigured()) {
          try {
            await this.zoomService.updateMeeting(existingSchedule.meetingId, {
              title: updateDto.title,
              description: updateDto.description,
              startTime,
              duration: updateDto.duration || existingSchedule.duration,
              attendeeEmails: updateDto.candidateEmail || updateDto.interviewerEmail ? 
                [updateDto.candidateEmail || existingSchedule.candidateEmail, 
                 updateDto.interviewerEmail || existingSchedule.interviewerEmail] : undefined,
            });
          } catch (error) {
            this.logger.warn('Failed to update Zoom meeting:', error.message);
          }
        }
      }

      // Update database record
      const updatedSchedule = await this.prisma.interviewSchedule.update({
        where: { id },
        data: {
          title: updateDto.title,
          description: updateDto.description,
          candidateName: updateDto.candidateName,
          candidateEmail: updateDto.candidateEmail,
          interviewerName: updateDto.interviewerName,
          interviewerEmail: updateDto.interviewerEmail,
          scheduledDate: updateDto.scheduledDate ? new Date(updateDto.scheduledDate) : undefined,
          duration: updateDto.duration,
          meetingType: updateDto.meetingType,
          status: updateDto.status as any,
          notes: updateDto.notes,
        },
      });

      this.logger.log(`Interview schedule updated: ${id}`);

      return updatedSchedule;
    } catch (error) {
      this.logger.error('Failed to update interview schedule:', error);
      throw new Error(`Failed to update interview schedule: ${error.message}`);
    }
  }

  async cancelInterviewSchedule(id: string) {
    try {
      const existingSchedule = await this.prisma.interviewSchedule.findUnique({
        where: { id },
      });

      if (!existingSchedule) {
        throw new Error('Interview schedule not found');
      }

      // Cancel meeting event if it exists
      if (existingSchedule.meetingId) {
        try {
          if (existingSchedule.meetingType === 'GOOGLE_MEET') {
            await this.googleMeetService.cancelMeeting(existingSchedule.meetingId);
          } else if (existingSchedule.meetingType === 'ZOOM' && this.zoomService.isConfigured()) {
            await this.zoomService.cancelMeeting(existingSchedule.meetingId);
          }
        } catch (error) {
          this.logger.warn(`Failed to cancel ${existingSchedule.meetingType} event:`, error.message);
        }
      }

      // Update database record
      const cancelledSchedule = await this.prisma.interviewSchedule.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });

      this.logger.log(`Interview schedule cancelled: ${id}`);

      return cancelledSchedule;
    } catch (error) {
      this.logger.error('Failed to cancel interview schedule:', error);
      throw new Error(`Failed to cancel interview schedule: ${error.message}`);
    }
  }

  async getInterviewSchedule(id: string) {
    try {
      const interviewSchedule = await this.prisma.interviewSchedule.findUnique({
        where: { id },
        // include: {
        //   meetingLinks: true,
        // },
      });

      if (!interviewSchedule) {
        throw new Error('Interview schedule not found');
      }

      return interviewSchedule;
    } catch (error) {
      this.logger.error('Failed to get interview schedule:', error);
      throw new Error(`Failed to get interview schedule: ${error.message}`);
    }
  }

  async getAllInterviewSchedules(filters?: {
    status?: string;
    meetingType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.meetingType) {
        where.meetingType = filters.meetingType;
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.scheduledDate = {};
        if (filters.dateFrom) {
          where.scheduledDate.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.scheduledDate.lte = filters.dateTo;
        }
      }

      const interviewSchedules = await this.prisma.interviewSchedule.findMany({
        where,
        // include: {
        //   meetingLinks: true,
        // },
        orderBy: {
          scheduledDate: 'asc',
        },
      });

      return interviewSchedules;
    } catch (error) {
      this.logger.error('Failed to get interview schedules:', error);
      throw new Error(`Failed to get interview schedules: ${error.message}`);
    }
  }

  async getUpcomingInterviews(limit: number = 10) {
    try {
      const now = new Date();
      
      const upcomingInterviews = await this.prisma.interviewSchedule.findMany({
        where: {
          scheduledDate: {
            gte: now,
          },
          status: 'SCHEDULED',
        },
        // include: {
        //   meetingLinks: true,
        // },
        orderBy: {
          scheduledDate: 'asc',
        },
        take: limit,
      });

      return upcomingInterviews;
    } catch (error) {
      this.logger.error('Failed to get upcoming interviews:', error);
      throw new Error(`Failed to get upcoming interviews: ${error.message}`);
    }
  }
}
