import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import type {
  CreateJobDto,
  UpdateJobDto,
  ApplicationStatus,
} from './jobs.service';
import { Roles } from '../auth/roles.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  @Roles('ADMIN', 'HR', 'CLIENT')
  create(@Body() body: CreateJobDto) {
    return this.jobs.create(body);
  }

  @Put(':id')
  @Roles('ADMIN', 'HR', 'CLIENT')
  update(@Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.jobs.update(id, body);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'HR', 'CLIENT')
  changeStatus(
    @Param('id') id: string,
    @Body() body: { status: 'OPEN' | 'CLOSED' | 'HIRED' },
  ) {
    return this.jobs.changeStatus(id, body.status);
  }

  @Delete(':id')
  @Roles('ADMIN', 'HR')
  delete(@Param('id') id: string) {
    return this.jobs.delete(id);
  }

  @Get()
  @Roles('ADMIN', 'HR', 'CLIENT')
  list(@Query('clientId') clientId?: string) {
    return this.jobs.findAll(clientId);
  }

  @Get('available')
  @Roles('APPLICANT')
  getAvailableJobs() {
    return this.jobs.findAvailableJobs();
  }

  @Get(':id')
  @Roles('ADMIN', 'HR', 'CLIENT', 'APPLICANT')
  get(@Param('id') id: string) {
    return this.jobs.findOne(id);
  }

  @Get(':id/applications')
  @Roles('ADMIN', 'HR', 'CLIENT')
  listApplications(@Param('id') id: string) {
    return this.jobs.listApplications(id);
  }

  @Post(':id/apply')
  @Roles('APPLICANT')
  apply(@Param('id') jobId: string, @Req() req: any) {
    const applicantId = req.user?.sub;
    return this.jobs.applyToJob(jobId, applicantId);
  }

  @Patch('applications/:applicationId/status')
  @Roles('ADMIN', 'HR', 'CLIENT')
  updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body() body: { status: ApplicationStatus },
  ) {
    console.log('=== CONTROLLER: UPDATE APPLICATION STATUS ===');
    console.log('Application ID:', applicationId);
    console.log('Status from body:', body.status);
    console.log('Full body:', JSON.stringify(body, null, 2));
    
    return this.jobs.changeApplicationStatus(applicationId, body.status);
  }

  // Active Jobs Endpoints
  @Get('active/list')
  @Roles('ADMIN', 'HR', 'CLIENT')
  getActiveJobs(@Query('clientId') clientId?: string) {
    return this.jobs.getActiveJobs(clientId);
  }

  @Get('active/with-candidates')
  @Roles('ADMIN', 'HR', 'CLIENT')
  getJobsWithTopCandidates(
    @Query('clientId') clientId?: string,
    @Query('limit') limit?: string,
  ) {
    const candidateLimit = limit ? parseInt(limit, 10) : 5;
    return this.jobs.getJobsWithTopCandidates(clientId, candidateLimit);
  }

  @Get(':id/statistics')
  @Roles('ADMIN', 'HR', 'CLIENT')
  getJobStatistics(@Param('id') jobId: string) {
    return this.jobs.getJobStatistics(jobId);
  }
}
