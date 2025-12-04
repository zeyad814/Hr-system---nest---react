import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InterviewSchedulerService } from './interview-scheduler.service';
import { CreateInterviewScheduleDto, UpdateInterviewScheduleDto } from './dto/interview-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { GoogleMeetService } from './google-meet.service';
import { ZoomService } from './zoom.service';
import { Public } from '../auth/public.decorator';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewSchedulerController {
  constructor(
    private readonly interviewSchedulerService: InterviewSchedulerService,
    // private readonly googleMeetService: GoogleMeetService,
    private readonly zoomService: ZoomService,
  ) {}

  @Post('schedule')
  async createInterviewSchedule(@Body() createDto: CreateInterviewScheduleDto) {
    return this.interviewSchedulerService.createInterviewSchedule(createDto);
  }

  @Get('schedule')
  async getAllInterviewSchedules(
    @Query('status') status?: string,
    @Query('meetingType') meetingType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    
    if (status) filters.status = status;
    if (meetingType) filters.meetingType = meetingType;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.interviewSchedulerService.getAllInterviewSchedules(filters);
  }

  @Get('schedule/upcoming')
  async getUpcomingInterviews(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.interviewSchedulerService.getUpcomingInterviews(limitNumber);
  }

  @Get('schedule/:id')
  async getInterviewSchedule(@Param('id') id: string) {
    return this.interviewSchedulerService.getInterviewSchedule(id);
  }

  @Put('schedule/:id')
  async updateInterviewSchedule(
    @Param('id') id: string,
    @Body() updateDto: UpdateInterviewScheduleDto,
  ) {
    return this.interviewSchedulerService.updateInterviewSchedule(id, updateDto);
  }

  @Delete('schedule/:id')
  async cancelInterviewSchedule(@Param('id') id: string) {
    return this.interviewSchedulerService.cancelInterviewSchedule(id);
  }

  // Google Meet is disabled
  // @Get('test-google-meet')
  // @Public()
  // async testGoogleMeet() {
  //   try {
  //     const testData = {
  //       title: 'Test Google Meet',
  //       description: 'Test meeting for Google Meet integration',
  //       startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  //       endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
  //       attendeeEmails: ['omarhashem20051310@gmail.com'],
  //     };

  //     const result = await this.googleMeetService.createMeetingLink(testData);

  //     return {
  //       success: true,
  //       message: 'Google Meet integration is working!',
  //       meetingData: result,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Google Meet integration failed',
  //       error: error.message,
  //     };
  //   }
  // }

  @Get('test-zoom')
  @Public()
  async testZoom() {
    try {
      const isConfigured = this.zoomService.isConfigured();
      
      if (!isConfigured) {
        return {
          success: false,
          message: 'Zoom API is not configured',
          configured: false,
          details: {
            accountId: !!this.zoomService['configService']?.get('ZOOM_ACCOUNT_ID'),
            clientId: !!this.zoomService['configService']?.get('ZOOM_CLIENT_ID'),
            clientSecret: !!this.zoomService['configService']?.get('ZOOM_CLIENT_SECRET'),
          },
        };
      }

      const testData = {
        title: 'Test Zoom Meeting',
        description: 'Test meeting for Zoom integration',
        startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        duration: 30,
        timezone: 'UTC',
        attendeeEmails: ['test@example.com'],
      };

      const result = await this.zoomService.createMeeting(testData);
      
      return {
        success: true,
        message: 'Zoom API integration is working!',
        configured: true,
        meetingData: result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Zoom API integration failed',
        configured: this.zoomService.isConfigured(),
        error: error.message,
        details: error.response?.data || error.stack,
      };
    }
  }
}
