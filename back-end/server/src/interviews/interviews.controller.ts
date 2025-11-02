import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InterviewsService } from './interviews.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  InterviewFiltersDto,
  ApplicantInterviewResponseDto,
  HRInterviewReviewDto,
} from './dto/interview.dto';

@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  // Schedule a new interview (HR and Clients can schedule)
  @Post()
  @Roles('HR', 'ADMIN', 'CLIENT')
  async scheduleInterview(
    @Request() req: any,
    @Body() createInterviewDto: CreateInterviewDto,
  ) {
    return this.interviewsService.scheduleInterview(
      req.user.id,
      createInterviewDto,
    );
  }

  // Get all interviews with optional filters
  @Get()
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getInterviews(@Query() filters: InterviewFiltersDto) {
    return this.interviewsService.getInterviews(filters);
  }

  // Get upcoming interviews for reminders
  @Get('upcoming')
  @Roles('HR', 'ADMIN')
  async getUpcomingInterviews(@Query('hours') hours?: string) {
    const hoursAhead = hours ? parseInt(hours) : 24;
    return this.interviewsService.getUpcomingInterviews(hoursAhead);
  }

  // Get interviews for current user (if applicant)
  @Get('my-interviews')
  @Roles('APPLICANT')
  async getMyInterviews(@Request() req: any) {
    return this.interviewsService.getMyInterviews(req.user.id);
  }

  // Applicant response to interview (accept/reject)
  @Post('applicant-response/:id')
  @Roles('APPLICANT')
  async applicantRespondToInterview(
    @Param('id') id: string,
    @Request() req: any,
    @Body() responseDto: ApplicantInterviewResponseDto,
  ) {
    return this.interviewsService.applicantRespondToInterview(
      id,
      req.user.id,
      responseDto,
    );
  }

  // Get interview requests pending HR approval
  @Get('requests/pending')
  @Roles('HR', 'ADMIN')
  async getPendingInterviewRequests() {
    return this.interviewsService.getPendingInterviewRequests();
  }

  // Join video interview (generate token and channel info)
  @Post(':id/join')
  @Roles('HR', 'ADMIN', 'CLIENT', 'APPLICANT')
  async joinVideoInterview(
    @Param('id') id: string,
    @Request() req: any,
    @Body('role') role?: 'interviewer' | 'candidate'
  ) {
    return this.interviewsService.joinVideoInterview(id, req.user.id, role);
  }

  // Leave video interview
  @Post(':id/leave')
  @Roles('HR', 'ADMIN', 'CLIENT', 'APPLICANT')
  async leaveVideoInterview(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.interviewsService.leaveVideoInterview(id, req.user.id);
  }

  // Get specific interview by ID
  @Get(':id')
  @Roles('HR', 'ADMIN', 'CLIENT', 'APPLICANT')
  async getInterviewById(@Param('id') id: string, @Request() req: any) {
    const interview = await this.interviewsService.getInterviewById(id);

    // If applicant, check if they own this interview
    if (req.user.role === 'APPLICANT') {
      const applicant = await this.interviewsService[
        'prisma'
      ].applicant.findUnique({
        where: { userId: req.user.id },
      });

      if (!applicant || interview.candidateId !== applicant.id) {
        throw new Error('Not authorized to view this interview');
      }
    }

    return interview;
  }

  // Update interview details
  @Put(':id')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async updateInterview(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return this.interviewsService.updateInterview(
      id,
      req.user.id,
      updateInterviewDto,
    );
  }

  // Update interview status (attendance, etc.)
  @Put(':id/status')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async updateInterviewStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateStatusDto: UpdateInterviewStatusDto,
  ) {
    return this.interviewsService.updateInterviewStatus(
      id,
      req.user.id,
      updateStatusDto,
    );
  }

  // Mark reminder as sent
  @Put(':id/reminder-sent')
  @Roles('HR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async markReminderSent(@Param('id') id: string) {
    return this.interviewsService.markReminderSent(id);
  }

  // Send interview reminder
  @Post(':id/send-reminder')
  @Roles('HR', 'ADMIN')
  async sendReminder(@Param('id') id: string) {
    return this.interviewsService.sendInterviewReminder(id);
  }

  // Refresh Agora token
  @Post(':id/refresh-token')
  @Roles('HR', 'ADMIN', 'CLIENT', 'APPLICANT')
  async refreshAgoraToken(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.interviewsService.refreshAgoraToken(id, req.user.id);
  }

  // Get candidate interviews (for HR/Admin)
  @Get('candidate/:candidateId')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getCandidateInterviews(@Param('candidateId') candidateId: string) {
    return this.interviewsService.getCandidateInterviews(candidateId);
  }

  // Delete interview
  @Delete(':id')
  @Roles('HR', 'ADMIN', 'CLIENT')
  @HttpCode(HttpStatus.OK)
  async deleteInterview(@Param('id') id: string, @Request() req: any) {
    return this.interviewsService.deleteInterview(id, req.user.id);
  }


  // HR review applicant's interview rejection request
  @Post(':id/hr-review')
  @Roles('HR', 'ADMIN')
  async hrReviewInterviewRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() reviewDto: HRInterviewReviewDto,
  ) {
    return this.interviewsService.hrReviewInterviewRequest(
      id,
      req.user.id,
      reviewDto,
    );
  }
}
