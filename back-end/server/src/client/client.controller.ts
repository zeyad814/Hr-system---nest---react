import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Put,
  Request,
  Query,
  HttpException,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ClientService } from './client.service';
import { JobStatus, ContractStatus } from '@prisma/client';
import {
  CreateJobDto,
  UpdateJobStatusDto,
  CreateContractDto,
  UpdateContractStatusDto,
  RenewContractDto,
  UpdateClientProfileDto,
  CreateNoteDto,
  CreateReminderDto,
  UpdateReminderDto,
  CreateRevenueDto,
  DateRangeDto,
  PaginationDto
} from './client.dto';

@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(private clientService: ClientService) {}

  // Admin and Sales endpoints for client management
  @Get('list')
  @Roles('ADMIN', 'SALES', 'HR')
  async listClients() {
    return this.clientService.findAll();
  }

  @Get('admin/:id')
  @Roles('ADMIN', 'SALES')
  async getClientById(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Post('admin')
  @Roles('ADMIN', 'SALES')
  async createClient(@Body() body: any) {
    return this.clientService.create(body);
  }

  @Put('admin/:id')
  @Roles('ADMIN', 'SALES')
  async updateClient(@Param('id') id: string, @Body() body: any) {
    return this.clientService.update(id, body);
  }

  @Delete('admin/:id')
  @Roles('ADMIN', 'SALES')
  async removeClient(@Param('id') id: string) {
    return this.clientService.remove(id);
  }

  // Enhanced endpoints with user relationships
  @Get('with-users')
  @Roles('ADMIN', 'SALES')
  async listWithUsers() {
    return this.clientService.findAllWithUsers();
  }

  @Get(':id/with-user')
  @Roles('ADMIN', 'SALES')
  async getWithUser(@Param('id') id: string) {
    return this.clientService.findOneWithUser(id);
  }
  // Dashboard endpoints
  @Get('dashboard/stats')
  @Roles('CLIENT')
  async getDashboardStats(@Request() req: any, @Query() dateRange: DateRangeDto) {
    try {
      const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
      const stats = await this.clientService.getDashboardStats(client.id, dateRange);
      const activeJobs = await this.clientService.getActiveJobs(client.id);
      const topCandidates = await this.clientService.getTopCandidates(client.id);
      
      return {
        ...stats,
        activeJobs,
        topCandidates
      };
    } catch (error) {
      throw new HttpException('فشل في جلب إحصائيات لوحة التحكم', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('jobs')
  @Roles('CLIENT')
  async getJobs(@Request() req: any, @Query() query: PaginationDto) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return this.clientService.getJobs(client.id, query);
  }

  @Post('jobs')
  @Roles('CLIENT')
  async createJob(@Request() req: any, @Body() createJobDto: CreateJobDto) {
    try {
      const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
      const job = await this.clientService.createJob(client.id, createJobDto);
      return {
        success: true,
        message: 'تم إنشاء الوظيفة بنجاح',
        job
      };
    } catch (error) {
      throw new HttpException('فشل في إنشاء الوظيفة', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('jobs/:id')
  @Roles('CLIENT')
  async getJob(@Param('id') jobId: string) {
    return this.clientService.getJob(jobId);
  }

  @Patch('jobs/:id/status')
  @Roles('CLIENT')
  async updateJobStatus(
    @Param('id') jobId: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto
  ) {
    return this.clientService.updateJobStatus(jobId, updateJobStatusDto.status);
  }

  @Get('jobs/:id/applications')
  @Roles('CLIENT')
  async getJobApplications(@Param('id') jobId: string, @Query() query: PaginationDto) {
    return this.clientService.getJobApplications(jobId, query);
  }

  @Get('candidates')
  @Roles('CLIENT')
  async getCandidates(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const topCandidates = await this.clientService.getTopCandidates(client.id);
    return { candidates: topCandidates };
  }

  // Recent activities endpoint
  @Get('activities/recent')
  @Roles('CLIENT')
  async getRecentActivities(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getRecentActivities(client.id);
  }

  // Job requests endpoints
  @Get('job-requests')
  @Roles('CLIENT')
  async getJobRequests(@Request() req: any) {
    // Get clientId from userId
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const jobsResult = await this.clientService.getJobs(client.id);
    return jobsResult.jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      department: job.department || 'غير محدد',
      description: job.description,
      requirements: job.requirements ? job.requirements.split(',').map((r: string) => r.trim()) : [],
      salary: job.salaryRange,
      location: job.location,
      type: job.jobType,
      status: job.status === 'OPEN' ? 'نشط' : job.status === 'CLOSED' ? 'مغلق' : 'مكتمل',
      postedDate: job.createdAt.toISOString().split('T')[0],
      applicants: job._count?.applications || 0,
      views: 0, // TODO: Add views tracking
      submittedDate: job.createdAt.toISOString().split('T')[0],
      experience: 'غير محدد'
    }));
  }

  @Post('job-requests')
  @Roles('CLIENT')
  async createJobRequest(@Request() req: any, @Body() jobData: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const job = await this.clientService.createJob(client.id, {
      title: jobData.title,
      company: jobData.company || 'شركة العميل',
      location: jobData.location,
      jobType: jobData.type,
      department: jobData.department,
      experienceLevel: jobData.experience,
      description: jobData.description,
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements.join(', ') : jobData.requirements,
      salaryRange: jobData.salaryMin && jobData.salaryMax ? `${jobData.salaryMin} - ${jobData.salaryMax} ريال` : jobData.salary,
      applicationDeadline: jobData.deadline ? new Date(jobData.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    return { job };
  }

  @Get('job-requests/:id')
  @Roles('CLIENT')
  async getJobRequest(@Request() req: any, @Param('id') jobId: string) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const job = await this.clientService.getJobById(client.id, jobId);
    
    if (!job) {
      throw new Error('Job request not found');
    }
    
    return {
      id: job.id,
      title: job.title,
      department: job.department || 'غير محدد',
      description: job.description,
      requirements: job.requirements ? job.requirements.split(',').map((r: string) => r.trim()) : [],
      salary: job.salaryRange,
      location: job.location,
      type: job.jobType,
      status: job.status === 'OPEN' ? 'نشط' : job.status === 'CLOSED' ? 'مغلق' : 'مكتمل',
      postedDate: job.createdAt.toISOString().split('T')[0],
      applicants: job._count?.applications || 0,
      views: 0,
      submittedDate: job.createdAt.toISOString().split('T')[0],
      experience: 'غير محدد'
    };
  }

  @Put('job-requests/:id')
  @Roles('CLIENT')
  async updateJobRequest(@Request() req: any, @Param('id') jobId: string, @Body() jobData: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const job = await this.clientService.updateJob(client.id, jobId, {
      title: jobData.title,
      company: jobData.company || 'شركة العميل',
      location: jobData.location,
      jobType: jobData.type,
      department: jobData.department,
      experienceLevel: jobData.experience,
      description: jobData.description,
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements.join(', ') : jobData.requirements,
      salaryRange: jobData.salaryMin && jobData.salaryMax ? `${jobData.salaryMin} - ${jobData.salaryMax} ريال` : jobData.salary,
      applicationDeadline: jobData.deadline ? new Date(jobData.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    return { job };
  }

  @Delete('job-requests/:id')
  @Roles('CLIENT')
  async deleteJobRequest(@Request() req: any, @Param('id') jobId: string) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    
    // Check if job exists before deleting
    const job = await this.clientService.getJobById(client.id, jobId);
    if (!job) {
      throw new Error('Job request not found');
    }
    
    await this.clientService.deleteJob(client.id, jobId);
    return { message: 'تم حذف طلب الوظيفة بنجاح' };
  }

  @Get('job-requests/stats')
  @Roles('CLIENT')
  async getJobRequestStats(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const stats = await this.clientService.getJobRequestStats(client.id);
    return {
      totalRequests: stats.total,
      activeRequests: stats.active,
      completedRequests: stats.completed,
      pendingRequests: 0,
      closedRequests: 0,
      totalApplicants: 0,
      averageApplicantsPerJob: 0,
      totalViews: 0,
      publishedJobs: stats.active,
      averageApprovalTime: '2-3 ',
      approvalRate: '85%'
    };
  }

  // Contracts endpoints
  @Get('contracts')
  @Roles('CLIENT')
  async getContracts(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const contracts = await this.clientService.getContracts(client.id);
    return contracts;
  }

  @Post('contracts')
  @Roles('CLIENT')
  async addContract(@Request() req: any, @Body() createContractDto: CreateContractDto) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const contract = await this.clientService.addContract(client.id, createContractDto);
    return { contract };
  }

  @Get('contracts/stats')
  @Roles('CLIENT')
  async getContractStats(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getContractStats(client.id);
  }

  @Get('contracts/:id')
  @Roles('CLIENT')
  async getContract(@Param('id') id: string) {
    const contract = await this.clientService.getContract(id);
    return contract;
  }

  @Patch('contracts/:id/status')
  @Roles('CLIENT')
  async updateContractStatus(
    @Param('id') id: string,
    @Body() updateContractStatusDto: UpdateContractStatusDto
  ) {
    const contract = await this.clientService.updateContractStatus(id, updateContractStatusDto.status);
    return {
      contract,
      message: 'تم تحديث حالة العقد بنجاح',
    };
  }

  @Post('contracts/:id/renew')
  @Roles('CLIENT')
  async renewContract(@Param('id') id: string, @Body() renewContractDto: RenewContractDto) {
    const contract = await this.clientService.renewContract(id, renewContractDto);
    return {
      success: true,
      message: 'تم تجديد العقد بنجاح',
      contract
    };
  }

  @Get('contracts/:id/download')
  @Roles('CLIENT')
  async downloadContract(@Param('id') id: string) {
    const downloadInfo = await this.clientService.getContractDownloadInfo(id);
    return downloadInfo;
  }

  // Profile endpoints
  @Get('profile')
  @Roles('CLIENT')
  async getProfile(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getProfile(client.id);
  }

  @Put('profile')
  @Roles('CLIENT')
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateClientProfileDto) {
    try {
      const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
      const profile = await this.clientService.updateProfile(client.id, updateProfileDto);
      return {
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        profile
      };
    } catch (error) {
      throw new HttpException('فشل في تحديث الملف الشخصي', HttpStatus.BAD_REQUEST);
    }
  }
  // Create client profile
  @Post('profile')
  @Roles('CLIENT')
    async createProfile(@Request() req: any, @Body() updateProfileDto: UpdateClientProfileDto) {
    try {
      const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
      const profile = await this.clientService.updateProfile(client.id, updateProfileDto);
      return {
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        profile
      };
    } catch (error) {
      throw new HttpException('فشل في تحديث الملف الشخصي', HttpStatus.BAD_REQUEST);
    }
  }


  // Notes endpoints
  @Get('notes')
  @Roles('CLIENT')
  async getNotes(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getNotes(client.id);
  }

  @Post('notes')
  @Roles('CLIENT')
  async addNote(@Request() req: any, @Body() createNoteDto: CreateNoteDto) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const note = await this.clientService.addNote(client.id, createNoteDto);
    return {
      message: 'تم إضافة الملاحظة بنجاح',
      note,
    };
  }

  @Delete('notes/:id')
  @Roles('CLIENT')
  async deleteNote(@Param('id') id: string) {
    await this.clientService.deleteNote(id);
    return {
      message: 'تم حذف الملاحظة بنجاح',
      id,
    };
  }

  // Reminders endpoints
  @Get('reminders')
  @Roles('CLIENT')
  async getReminders(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getReminders(client.id);
  }

  @Post('reminders')
  @Roles('CLIENT')
  async addReminder(@Request() req: any, @Body() createReminderDto: CreateReminderDto) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const reminder = await this.clientService.addReminder(client.id, createReminderDto);
    return {
      message: 'تم إضافة التذكير بنجاح',
      reminder,
    };
  }

  @Patch('reminders/:id')
  @Roles('CLIENT')
  async updateReminder(@Param('id') id: string, @Body() updateReminderDto: UpdateReminderDto) {
    const reminder = await this.clientService.updateReminder(id, updateReminderDto);
    return {
      message: 'تم تحديث التذكير بنجاح',
      reminder,
    };
  }

  @Delete('reminders/:id')
  @Roles('CLIENT')
  async deleteReminder(@Param('id') id: string) {
    await this.clientService.deleteReminder(id);
    return {
      message: 'تم حذف التذكير بنجاح',
      id,
    };
  }

  // Revenues endpoints
  @Get('revenues')
  @Roles('CLIENT')
  async getRevenues(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getRevenues(client.id);
  }

  @Post('revenues')
  @Roles('CLIENT')
  async addRevenue(@Request() req: any, @Body() createRevenueDto: CreateRevenueDto) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    const revenue = await this.clientService.addRevenue(client.id, createRevenueDto);
    return {
      message: 'تم إضافة الإيراد بنجاح',
      revenue,
    };
  }

  @Get('revenues/stats')
  @Roles('CLIENT')
  async getRevenueStats(@Request() req: any) {
    const client = await this.clientService.getOrCreateClientForUser(req.user.sub);
    return await this.clientService.getRevenueStats(client.id);
  }
}