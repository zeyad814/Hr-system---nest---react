import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  async getStats() {
    try {
      return await this.adminDashboardService.getDashboardStats();
    } catch (error) {
      console.error('Error in getStats:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        totalUsers: 0,
        totalClients: 0,
        totalJobs: 0,
        totalContracts: 0,
        totalApplicants: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
      };
    }
  }

  @Get('top-performers')
  async getTopPerformers() {
    try {
      return await this.adminDashboardService.getTopPerformers();
    } catch (error) {
      console.error('Error in getTopPerformers:', error);
      return {
        topClients: [],
        topJobs: [],
      };
    }
  }

  @Get('recent-activities')
  async getRecentActivities(@Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      return await this.adminDashboardService.getRecentActivities(limitNumber);
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  }

  @Get('revenue-chart')
  async getRevenueChart(@Query('months') months?: string) {
    try {
      const monthsNumber = months ? parseInt(months, 10) : 12;
      return await this.adminDashboardService.getRevenueChart(monthsNumber);
    } catch (error) {
      console.error('Error in getRevenueChart:', error);
      return [];
    }
  }

  @Get('job-status-chart')
  async getJobStatusChart() {
    try {
      return await this.adminDashboardService.getJobStatusChart();
    } catch (error) {
      console.error('Error in getJobStatusChart:', error);
      return [];
    }
  }

  @Get('monthly-revenue')
  async getMonthlyRevenue() {
    try {
      return {
        revenue: await this.adminDashboardService.getMonthlyRevenue(),
      };
    } catch (error) {
      console.error('Error in getMonthlyRevenue:', error);
      return { revenue: 0 };
    }
  }
}
