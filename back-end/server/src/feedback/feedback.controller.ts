import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import type { CreateFeedbackDto, UpdateFeedbackDto } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles('HR', 'ADMIN', 'CLIENT')
  async createFeedback(
    @Request() req: any,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(req.user.sub, createFeedbackDto);
  }

  @Get('application/:id')
  @Roles('HR', 'ADMIN', 'APPLICANT', 'CLIENT')
  async getFeedbackForApplication(
    @Request() req: any,
    @Param('id') applicationId: string,
  ) {
    return this.feedbackService.getFeedbackForApplication(
      applicationId,
      req.user.sub,
    );
  }

  @Put(':id')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async updateFeedback(
    @Request() req: any,
    @Param('id') feedbackId: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(
      req.user.sub,
      feedbackId,
      updateFeedbackDto,
    );
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async deleteFeedback(@Request() req: any, @Param('id') feedbackId: string) {
    return this.feedbackService.deleteFeedback(req.user.sub, feedbackId);
  }

  @Get('my-feedback')
  @Roles('HR', 'ADMIN', 'CLIENT')
  async getMyFeedback(@Request() req: any) {
    return this.feedbackService.getMyFeedback(req.user.sub);
  }

  @Get('stats')
  @Roles('HR', 'ADMIN')
  async getFeedbackStats() {
    return this.feedbackService.getFeedbackStats();
  }
}
