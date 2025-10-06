import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TimelineService } from './timeline.service';
import type {
  CreateTimelineEntryDto,
  UpdateApplicationStatusDto,
} from './timeline.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('timeline')
@UseGuards(JwtAuthGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post('entry')
  @Roles('HR', 'ADMIN', 'APPLICANT')
  async createTimelineEntry(
    @Request() req: any,
    @Body() createTimelineEntryDto: CreateTimelineEntryDto,
  ) {
    return this.timelineService.createTimelineEntry(
      req.user.sub,
      createTimelineEntryDto,
    );
  }

  @Get('application/:id')
  @Roles('HR', 'ADMIN', 'APPLICANT', 'CLIENT')
  async getApplicationTimeline(
    @Request() req: any,
    @Param('id') applicationId: string,
  ) {
    return this.timelineService.getApplicationTimeline(
      applicationId,
      req.user.sub,
    );
  }

  @Patch('application/:id/status')
  @Roles('HR', 'ADMIN')
  async updateApplicationStatus(
    @Request() req: any,
    @Param('id') applicationId: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.timelineService.updateApplicationStatus(
      req.user.sub,
      applicationId,
      updateStatusDto,
    );
  }

  @Get('applications')
  @Roles('HR', 'ADMIN')
  async getApplicationsByStatus(@Query('status') status?: string) {
    return this.timelineService.getApplicationsByStatus(status);
  }

  @Get('my-timeline')
  @Roles('APPLICANT')
  async getMyTimeline(@Request() req: any) {
    return this.timelineService.getApplicantTimeline(req.user.sub);
  }
}
