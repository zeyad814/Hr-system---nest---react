import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
import {
  DateRangeDto,
  MonthlyStatsDto,
  SalesRepFilterDto,
  RevenueFilterDto,
  HiringStatsFilterDto,
  InterviewStatsFilterDto,
  DashboardStatsResponseDto,
  RevenueByClientResponseDto,
  SalesRepPerformanceResponseDto,
  MonthlyStatsResponseDto,
  HiringStatsResponseDto,
  InterviewStatsResponseDto,
} from './dto/reports.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * الحصول على إحصائيات لوحة التحكم الرئيسية
   * GET /api/reports/dashboard
   */
  @Get('dashboard')
  @Roles('ADMIN', 'SALES', 'HR')
  async getDashboardStats(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<DashboardStatsResponseDto> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.reportsService.getDashboardStats(startDate, endDate);
  }

  /**
   * الحصول على عدد العملاء الجدد
   * GET /api/reports/new-clients
   */
  @Get('new-clients')
  @Roles('ADMIN', 'SALES', 'HR')
  async getNewClientsCount(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<{ count: number }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const stats = await this.reportsService.getDashboardStats(
      startDate,
      endDate,
    );
    return { count: stats.newClientsCount };
  }

  /**
   * الحصول على عدد الوظائف المفتوحة والمغلقة
   * GET /api/reports/jobs-status
   */
  @Get('jobs-status')
  @Roles('ADMIN', 'SALES', 'HR')
  async getJobsStatus(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<{ openJobs: number; closedJobs: number }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const stats = await this.reportsService.getDashboardStats(
      startDate,
      endDate,
    );
    return {
      openJobs: stats.openJobsCount,
      closedJobs: stats.closedJobsCount,
    };
  }

  /**
   * الحصول على عدد العقود الموقعة
   * GET /api/reports/signed-contracts
   */
  @Get('signed-contracts')
  @Roles('ADMIN', 'SALES', 'HR')
  async getSignedContractsCount(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<{ count: number }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const stats = await this.reportsService.getDashboardStats(
      startDate,
      endDate,
    );
    return { count: stats.signedContractsCount };
  }

  /**
   * الحصول على الإيرادات حسب العميل
   * GET /api/reports/revenue-by-client
   */
  @Get('revenue-by-client')
  @Roles('ADMIN', 'SALES', 'HR')
  async getRevenueByClient(
    @Query(ValidationPipe) query: RevenueFilterDto,
  ): Promise<RevenueByClientResponseDto[]> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.reportsService.getRevenueByClient(startDate, endDate);
  }

  /**
   * الحصول على نسبة تحقيق التارجت لمندوبي المبيعات
   * GET /api/reports/sales-rep-performance
   */
  @Get('sales-rep-performance')
  @Roles('ADMIN', 'SALES')
  async getSalesRepPerformance(
    @Query(ValidationPipe) query: SalesRepFilterDto,
  ): Promise<SalesRepPerformanceResponseDto[]> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.reportsService.getSalesRepPerformance(startDate, endDate);
  }

  /**
   * الحصول على نسبة تحقيق التارجت العامة
   * GET /api/reports/target-achievement
   */
  @Get('target-achievement')
  @Roles('ADMIN', 'SALES', 'HR')
  async getTargetAchievement(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<{
    targetAchievement: number;
    totalRevenue: number;
    target: number;
  }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const stats = await this.reportsService.getDashboardStats(
      startDate,
      endDate,
    );
    const target = 100000; // هدف افتراضي

    return {
      targetAchievement: stats.salesRepTargetAchievement,
      totalRevenue: stats.totalRevenue,
      target,
    };
  }

  /**
   * الحصول على الإحصائيات الشهرية
   * GET /api/reports/monthly-stats
   */
  @Get('monthly-stats')
  @Roles('ADMIN', 'SALES', 'HR')
  async getMonthlyStats(
    @Query(ValidationPipe) query: MonthlyStatsDto,
  ): Promise<MonthlyStatsResponseDto[]> {
    return this.reportsService.getMonthlyStats(query.year);
  }

  /**
   * الحصول على إحصائيات التوظيف
   * GET /api/reports/hiring-stats
   */
  @Get('hiring-stats')
  @Roles('ADMIN', 'HR')
  async getHiringStats(
    @Query(ValidationPipe) query: HiringStatsFilterDto,
  ): Promise<HiringStatsResponseDto> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.reportsService.getHiringStats(startDate, endDate);
  }

  /**
   * الحصول على إحصائيات المقابلات
   * GET /api/reports/interview-stats
   */
  @Get('interview-stats')
  @Roles('ADMIN', 'HR')
  async getInterviewStats(
    @Query(ValidationPipe) query: InterviewStatsFilterDto,
  ): Promise<InterviewStatsResponseDto> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.reportsService.getInterviewStats(startDate, endDate);
  }

  /**
   * الحصول على إجمالي الإيرادات
   * GET /api/reports/total-revenue
   */
  @Get('total-revenue')
  @Roles('ADMIN', 'SALES', 'HR')
  async getTotalRevenue(
    @Query(ValidationPipe) query: DateRangeDto,
  ): Promise<{ totalRevenue: number }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const stats = await this.reportsService.getDashboardStats(
      startDate,
      endDate,
    );
    return { totalRevenue: stats.totalRevenue };
  }

  /**
   * الحصول على تقرير شامل للمبيعات
   * GET /api/reports/sales-summary
   */
  @Get('sales-summary')
  @Roles('ADMIN', 'SALES')
  async getSalesSummary(@Query(ValidationPipe) query: DateRangeDto): Promise<{
    dashboardStats: DashboardStatsResponseDto;
    revenueByClient: RevenueByClientResponseDto[];
    salesRepPerformance: SalesRepPerformanceResponseDto[];
  }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const [dashboardStats, revenueByClient, salesRepPerformance] =
      await Promise.all([
        this.reportsService.getDashboardStats(startDate, endDate),
        this.reportsService.getRevenueByClient(startDate, endDate),
        this.reportsService.getSalesRepPerformance(startDate, endDate),
      ]);

    return {
      dashboardStats,
      revenueByClient,
      salesRepPerformance,
    };
  }

  /**
   * الحصول على تقرير شامل للموارد البشرية
   * GET /api/reports/hr-summary
   */
  @Get('hr-summary')
  @Roles('ADMIN', 'HR')
  async getHrSummary(@Query(ValidationPipe) query: DateRangeDto): Promise<{
    hiringStats: HiringStatsResponseDto;
    interviewStats: InterviewStatsResponseDto;
    jobsStatus: { openJobs: number; closedJobs: number };
  }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const [hiringStats, interviewStats, dashboardStats] = await Promise.all([
      this.reportsService.getHiringStats(startDate, endDate),
      this.reportsService.getInterviewStats(startDate, endDate),
      this.reportsService.getDashboardStats(startDate, endDate),
    ]);

    return {
      hiringStats,
      interviewStats,
      jobsStatus: {
        openJobs: dashboardStats.openJobsCount,
        closedJobs: dashboardStats.closedJobsCount,
      },
    };
  }
}
