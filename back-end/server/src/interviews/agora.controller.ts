import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { InterviewsService } from './interviews.service';

@Controller('interviews/agora')
@UseGuards(JwtAuthGuard)
export class AgoraController {
  constructor(private readonly interviewsService: InterviewsService) {}

  /**
   * Generate Agora token for interview participant
   */
  @Post(':id/token')
  async generateToken(
    @Param('id') interviewId: string,
    @Body('role') role: 'interviewer' | 'candidate',
    @Request() req: any
  ) {
    return this.interviewsService.generateAgoraToken(
      interviewId,
      req.user.userId,
      role
    );
  }

  /**
   * Start recording for an interview
   */
  @Post(':id/recording/start')
  async startRecording(
    @Param('id') interviewId: string,
    @Request() req: any
  ) {
    return this.interviewsService.startRecording(
      interviewId,
      req.user.userId
    );
  }

  /**
   * Stop recording for an interview
   */
  @Post(':id/recording/stop')
  async stopRecording(
    @Param('id') interviewId: string,
    @Request() req: any
  ) {
    return this.interviewsService.stopRecording(
      interviewId,
      req.user.userId
    );
  }

  /**
   * Get interview details with Agora information
   */
  @Get(':id/details')
  async getInterviewDetails(
    @Param('id') interviewId: string,
    @Request() req: any
  ) {
    return this.interviewsService.getInterviewWithAgoraDetails(
      interviewId,
      req.user.userId
    );
  }

  @Get('recording/:recordingId/status')
  async getRecordingStatus(@Param('recordingId') recordingId: string, @Request() req: any) {
    // This would check the recording status from Agora Cloud Recording API
    // For now, return mock status
    return {
      recordingId,
      status: 'completed',
      url: `https://recordings.agora.io/${recordingId}.mp4`,
      duration: 1800, // 30 minutes in seconds
      fileSize: 125000000, // 125MB in bytes
      createdAt: new Date().toISOString()
    };
  }
}