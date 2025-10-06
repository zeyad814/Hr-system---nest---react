import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationsService } from './notifications.service';
import { InterviewsService } from './interviews.service';

@Controller('interviews/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly interviewsService: InterviewsService,
  ) {}

  // Send email reminder for specific interview
  @Post(':id/email')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendEmailReminder(@Param('id') interviewId: string) {
    const interview =
      await this.interviewsService.getInterviewById(interviewId);
    return this.notificationsService.sendEmailReminder(interview);
  }

  // Send WhatsApp reminder for specific interview
  @Post(':id/whatsapp')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendWhatsAppReminder(@Param('id') interviewId: string) {
    const interview =
      await this.interviewsService.getInterviewById(interviewId);
    return this.notificationsService.sendWhatsAppReminder(interview);
  }

  // Send both email and WhatsApp reminders for specific interview
  @Post(':id/all')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendAllReminders(@Param('id') interviewId: string) {
    const interview =
      await this.interviewsService.getInterviewById(interviewId);

    const emailResult =
      await this.notificationsService.sendEmailReminder(interview);
    const whatsappResult =
      await this.notificationsService.sendWhatsAppReminder(interview);

    // Mark reminder as sent if at least one succeeded
    if (emailResult.success || whatsappResult.success) {
      await this.interviewsService.markReminderSent(interviewId);
    }

    return {
      email: emailResult,
      whatsapp: whatsappResult,
    };
  }

  // Send reminders for all upcoming interviews
  @Post('batch-reminders')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendBatchReminders(@Query('hours') hours?: string) {
    const hoursAhead = hours ? parseInt(hours) : 24;
    return this.notificationsService.sendUpcomingInterviewReminders(hoursAhead);
  }

  // Send interviewer notification for specific interview
  @Post(':id/interviewer-notification')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendInterviewerNotification(@Param('id') interviewId: string) {
    const interview =
      await this.interviewsService.getInterviewById(interviewId);
    return this.notificationsService.sendInterviewerNotification(interview);
  }

  // Get upcoming interviews that need reminders
  @Get('pending-reminders')
  @Roles('HR', 'ADMIN')
  async getPendingReminders(@Query('hours') hours?: string) {
    const hoursAhead = hours ? parseInt(hours) : 24;
    return this.interviewsService.getUpcomingInterviews(hoursAhead);
  }
}
