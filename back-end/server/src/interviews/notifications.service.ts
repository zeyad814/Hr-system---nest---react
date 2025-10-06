import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InterviewsService } from './interviews.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private interviewsService: InterviewsService,
  ) {}

  // Send email reminder
  async sendEmailReminder(interview: any) {
    try {
      // In a real application, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP

      const emailContent = {
        to: interview.application.applicant.user.email,
        subject: `Interview Reminder: ${interview.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Reminder</h2>
            <p>Dear ${interview.application.applicant.user.name},</p>
            <p>This is a reminder about your upcoming interview:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">${interview.title}</h3>
              <p><strong>Position:</strong> ${interview.application.job.title}</p>
              <p><strong>Date & Time:</strong> ${new Date(interview.scheduledAt).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${interview.duration} minutes</p>
              <p><strong>Type:</strong> ${interview.type}</p>
              ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
              ${interview.description ? `<p><strong>Description:</strong> ${interview.description}</p>` : ''}
            </div>
            
            ${
              interview.notes
                ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #92400e;">Additional Notes:</h4>
                <p>${interview.notes}</p>
              </div>
            `
                : ''
            }
            
            <p>Please make sure to:</p>
            <ul>
              <li>Be available 5-10 minutes before the scheduled time</li>
              <li>Have your resume and any required documents ready</li>
              <li>Test your internet connection if it's a video interview</li>
              <li>Prepare questions about the role and company</li>
            </ul>
            
            <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
            
            <p>Best regards,<br>
            HR Team</p>
          </div>
        `,
      };

      // Mock email sending - replace with actual email service
      this.logger.log(
        `Email reminder sent to ${emailContent.to} for interview ${interview.id}`,
      );

      // In production, you would call your email service here:
      // await this.emailService.send(emailContent);

      return { success: true, message: 'Email reminder sent successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to send email reminder for interview ${interview.id}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  // Send WhatsApp reminder
  async sendWhatsAppReminder(interview: any) {
    try {
      // In a real application, you would integrate with WhatsApp Business API:
      // - Twilio WhatsApp API
      // - Meta WhatsApp Business API
      // - Other WhatsApp service providers

      const phoneNumber =
        interview.application.applicant.user.phone ||
        interview.application.applicant.phone;

      if (!phoneNumber) {
        return {
          success: false,
          error: 'No phone number available for candidate',
        };
      }

      const message = `
🔔 *Interview Reminder*

Hi ${interview.application.applicant.user.name},

You have an upcoming interview:

📋 *${interview.title}*
💼 Position: ${interview.application.job.title}
📅 Date: ${new Date(interview.scheduledAt).toLocaleDateString()}
⏰ Time: ${new Date(interview.scheduledAt).toLocaleTimeString()}
⏱️ Duration: ${interview.duration} minutes
📍 Type: ${interview.type}
${interview.location ? `🏢 Location: ${interview.location}\n` : ''}

${interview.notes ? `📝 Notes: ${interview.notes}\n\n` : ''}
Please be ready 5-10 minutes before the scheduled time.

Good luck! 🍀

*HR Team*
      `.trim();

      // Mock WhatsApp sending - replace with actual WhatsApp service
      this.logger.log(
        `WhatsApp reminder sent to ${phoneNumber} for interview ${interview.id}`,
      );

      // In production, you would call your WhatsApp service here:
      // await this.whatsappService.sendMessage(phoneNumber, message);

      return { success: true, message: 'WhatsApp reminder sent successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp reminder for interview ${interview.id}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  // Send reminders for upcoming interviews
  async sendUpcomingInterviewReminders(hoursAhead: number = 24) {
    try {
      const upcomingInterviews =
        await this.interviewsService.getUpcomingInterviews(hoursAhead);

      const results = {
        total: upcomingInterviews.length,
        emailsSent: 0,
        whatsappSent: 0,
        errors: [] as string[],
      };

      for (const interview of upcomingInterviews) {
        // Send email reminder
        const emailResult = await this.sendEmailReminder(interview);
        if (emailResult.success) {
          results.emailsSent++;
        } else {
          results.errors.push(
            `Email failed for interview ${interview.id}: ${emailResult.error}`,
          );
        }

        // Send WhatsApp reminder if phone number is available
        const phoneNumber =
          interview.application.applicant.user.phone ||
          interview.application.applicant.phone;
        if (phoneNumber) {
          const whatsappResult = await this.sendWhatsAppReminder(interview);
          if (whatsappResult.success) {
            results.whatsappSent++;
          } else {
            results.errors.push(
              `WhatsApp failed for interview ${interview.id}: ${whatsappResult.error}`,
            );
          }
        }

        // Mark reminder as sent
        await this.interviewsService.markReminderSent(interview.id);
      }

      this.logger.log(
        `Reminder batch completed: ${results.emailsSent} emails, ${results.whatsappSent} WhatsApp messages sent`,
      );

      return results;
    } catch (error) {
      this.logger.error('Failed to send upcoming interview reminders:', error);
      throw error;
    }
  }

  // Send interview confirmation to interviewer(s)
  async sendInterviewerNotification(interview: any) {
    try {
      // Get interviewer details
      const interviewers = await this.prisma.user.findMany({
        where: {
          id: {
            in: interview.interviewerIds,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const notifications = [];

      for (const interviewer of interviewers) {
        const emailContent = {
          to: interviewer.email,
          subject: `Interview Scheduled: ${interview.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Interview Scheduled</h2>
              <p>Dear ${interviewer.name},</p>
              <p>You have been assigned as an interviewer for the following interview:</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">${interview.title}</h3>
                <p><strong>Candidate:</strong> ${interview.application.applicant.user.name}</p>
                <p><strong>Position:</strong> ${interview.application.job.title}</p>
                <p><strong>Date & Time:</strong> ${new Date(interview.scheduledAt).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${interview.duration} minutes</p>
                <p><strong>Type:</strong> ${interview.type}</p>
                ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
              </div>
              
              ${
                interview.description
                  ? `
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #065f46;">Interview Description:</h4>
                  <p>${interview.description}</p>
                </div>
              `
                  : ''
              }
              
              ${
                interview.notes
                  ? `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #92400e;">Notes:</h4>
                  <p>${interview.notes}</p>
                </div>
              `
                  : ''
              }
              
              <p>Please make sure to review the candidate's application and prepare relevant questions.</p>
              
              <p>Best regards,<br>
              HR Team</p>
            </div>
          `,
        };

        // Mock email sending
        this.logger.log(
          `Interviewer notification sent to ${emailContent.to} for interview ${interview.id}`,
        );
        notifications.push({ interviewer: interviewer.name, status: 'sent' });
      }

      return { success: true, notifications };
    } catch (error) {
      this.logger.error(
        `Failed to send interviewer notifications for interview ${interview.id}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }
}
