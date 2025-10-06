import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/dto/user.dto';
import { SalesService } from './sales.service';
import { SalesRemindersService } from './sales-reminders.service';
import {
  CreateSalesReminderDto,
  UpdateSalesReminderDto,
  SalesReminderFilterDto,
} from './sales-reminders.dto';
import type {
  CreateSalesClientDto,
  UpdateSalesClientDto,
  CreateSalesJobDto,
  UpdateSalesJobDto,
  CreateSalesRevenueDto,
  UpdateSalesRevenueDto,
  UpdateSalesProfileDto,
  CreateSalesProfileDto,
} from './sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesRemindersService: SalesRemindersService,
  ) {}

  // Profile Endpoints
  @Get('profile')
  @Roles(UserRole.SALES)
  async getProfile(@Req() req: any) {
    try {
      return await this.salesService.getProfile(req.user.sub);
    } catch (error) {
      if (error.message === 'Profile not found') {
        throw new NotFoundException('Profile not found');
      }
      throw error;
    }
  }

  @Post('profile')
  @Roles(UserRole.SALES)
  async createProfile(@Req() req: any, @Body() profileData: CreateSalesProfileDto) {
    return this.salesService.createProfile(req.user.sub, profileData);
  }

  @Put('profile')
  @Roles(UserRole.SALES)
  async updateProfile(@Req() req: any, @Body() profileData: UpdateSalesProfileDto) {
    return this.salesService.updateProfile(req.user.sub, profileData);
  }

  // Sales Clients Endpoints
  @Get('clients')
  @Public()
  async getClients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('industry') industry?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.salesService.getAllClients({
      skip,
      take: limit,
      search,
      status,
      industry,
    });
  }

  @Get('clients/:id')
  @Public()
  async getClient(@Param('id') id: string) {
    return this.salesService.getClientById(id);
  }

  @Post('clients')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async createClient(@Body() createClientDto: CreateSalesClientDto) {
    return this.salesService.createClient(createClientDto);
  }

  @Put('clients/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateSalesClientDto,
  ) {
    return this.salesService.updateClient(id, updateClientDto);
  }

  @Delete('clients/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async deleteClient(@Param('id') id: string) {
    return this.salesService.deleteClient(id);
  }

  // Sales Jobs Endpoints
  @Get('jobs')
  @Public()
  async getJobs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('type') type?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.salesService.getAllJobs({
      skip,
      take: limit,
      search,
      status,
      clientId,
      type,
    });
  }

  @Get('jobs/:id')
  @Public()
  async getJob(@Param('id') id: string) {
    return this.salesService.getJobById(id);
  }

  @Post('jobs')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async createJob(@Body() createJobDto: CreateSalesJobDto) {
    return this.salesService.createJob(createJobDto);
  }

  @Put('jobs/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateSalesJobDto,
  ) {
    return this.salesService.updateJob(id, updateJobDto);
  }

  @Delete('jobs/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async deleteJob(@Param('id') id: string) {
    return this.salesService.deleteJob(id);
  }

  // Sales Revenue Endpoints
  @Get('revenues')
  @Public()
  async getRevenues(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.salesService.getAllRevenues({
      skip,
      take: limit,
      clientId,
      status,
      type,
      startDate,
      endDate,
    });
  }

  @Get('revenues/:id')
  @Public()
  async getRevenue(@Param('id') id: string) {
    return this.salesService.getRevenueById(id);
  }

  @Post('revenues')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async createRevenue(@Body() createRevenueDto: CreateSalesRevenueDto) {
    return this.salesService.createRevenue(createRevenueDto);
  }

  @Put('revenues/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateRevenue(
    @Param('id') id: string,
    @Body() updateRevenueDto: UpdateSalesRevenueDto,
  ) {
    return this.salesService.updateRevenue(id, updateRevenueDto);
  }

  @Delete('revenues/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async deleteRevenue(@Param('id') id: string) {
    return this.salesService.deleteRevenue(id);
  }

  // Dashboard and Statistics
  @Get('dashboard/stats')
  @Public()
  async getDashboardStats() {
    return this.salesService.getDashboardStats();
  }

  @Get('dashboard/monthly-revenue')
  @Public()
  async getMonthlyRevenue(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : new Date().getFullYear();
    return this.salesService.getMonthlyRevenue(yearNumber);
  }

  // Sales Targets Endpoints
  @Get('targets')
  @Public()
  async getTargets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.salesService.getAllTargets({
      skip,
      take: limit,
      type,
      status,
      assignedTo,
    });
  }

  @Get('targets/:id')
  @Public()
  async getTarget(@Param('id') id: string) {
    return this.salesService.getTargetById(id);
  }

  @Post('targets')
  @Public()
  async createTarget(@Body() createTargetDto: any) {
    return this.salesService.createTarget(createTargetDto);
  }

  @Put('targets/:id')
  @Public()
  async updateTarget(@Param('id') id: string, @Body() updateTargetDto: any) {
    return this.salesService.updateTarget(id, updateTargetDto);
  }

  @Delete('targets/:id')
  @Public()
  async deleteTarget(@Param('id') id: string) {
    return this.salesService.deleteTarget(id);
  }

  // Sales Contracts Endpoints
  @Get('contracts')
  @Public()
  async getContracts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('clientId') clientId?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.salesService.getAllContracts({
      skip,
      take: limit,
      search,
      status,
      type,
      clientId,
    });
  }

  @Get('contracts/:id')
  @Public()
  async getContract(@Param('id') id: string) {
    return this.salesService.getContractById(id);
  }

  @Post('contracts')
  @Public()
  async createContract(@Body() createContractDto: any) {
    return this.salesService.createContract(createContractDto);
  }

  @Put('contracts/:id')
  @Public()
  async updateContract(
    @Param('id') id: string,
    @Body() updateContractDto: any,
  ) {
    return this.salesService.updateContract(id, updateContractDto);
  }

  @Delete('contracts/:id')
  @Public()
  async deleteContract(@Param('id') id: string) {
    return this.salesService.deleteContract(id);
  }

  // Contract Milestones
  @Post('contracts/:id/milestones')
  @Public()
  async addMilestone(
    @Param('id') contractId: string,
    @Body() milestoneDto: any,
  ) {
    return this.salesService.addMilestone(contractId, milestoneDto);
  }

  @Put('contracts/:contractId/milestones/:milestoneId')
  @Public()
  async updateMilestone(
    @Param('contractId') contractId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() updateMilestoneDto: any,
  ) {
    return this.salesService.updateMilestone(milestoneId, updateMilestoneDto);
  }

  // Contract Documents
  @Post('contracts/:id/documents')
  @Public()
  async addDocument(@Param('id') contractId: string, @Body() documentDto: any) {
    return this.salesService.addDocument(contractId, documentDto);
  }

  // Sales Achievements
  @Get('achievements')
  @Public()
  async getAchievements() {
    return this.salesService.getAchievements();
  }

  // Quarterly Performance
  @Get('quarterly-performance')
  @Public()
  async getQuarterlyPerformance(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : new Date().getFullYear();
    return this.salesService.getQuarterlyPerformance(yearNumber);
  }

  // Sales Reminders Endpoints
  @Get('reminders')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async getReminders(
    @Query() filters: SalesReminderFilterDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.findAll(filters, userId);
  }

  @Get('reminders/upcoming')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async getUpcomingReminders(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.getUpcomingReminders(userId, days);
  }

  @Get('reminders/overdue')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async getOverdueReminders(@Req() req: any) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.getOverdueReminders(userId);
  }

  @Get('reminders/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async getReminder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.findOne(id, userId);
  }

  @Post('reminders')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async createReminder(
    @Body() createReminderDto: CreateSalesReminderDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.create(createReminderDto, userId);
  }

  @Put('reminders/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateReminder(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateSalesReminderDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.update(id, updateReminderDto, userId);
  }

  @Put('reminders/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async markReminderAsCompleted(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'default-user-id';
    return this.salesRemindersService.markAsCompleted(id, userId);
  }

  @Delete('reminders/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async deleteReminder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'default-user-id';
    await this.salesRemindersService.remove(id, userId);
    return { message: 'Reminder deleted successfully' };
  }
}
