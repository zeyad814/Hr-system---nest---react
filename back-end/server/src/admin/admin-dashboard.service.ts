import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalClients,
        totalJobs,
        totalContracts,
        totalApplicants,
        monthlyRevenue,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.client.count(),
        this.prisma.job.count(),
        this.prisma.contract.count(),
        this.prisma.applicant.count(),
        this.getMonthlyRevenue(),
      ]);

      const previousMonthRevenue = await this.getPreviousMonthRevenue();
      const revenueGrowth =
        previousMonthRevenue > 0
          ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) *
            100
          : 0;

      return {
        totalUsers,
        totalClients,
        totalJobs,
        totalContracts,
        totalApplicants,
        monthlyRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getTopPerformers() {
    try {
      // أفضل العملاء حسب الإيرادات
      const topClients = await this.prisma.client.findMany({
        include: {
          revenues: true,
          contracts: true,
          jobs: true,
        },
        orderBy: {
          revenues: {
            _count: 'desc',
          },
        },
        take: 5,
      });

      // أفضل الوظائف حسب عدد المتقدمين
      const topJobs = await this.prisma.job.findMany({
        include: {
          applications: true,
          client: true,
        },
        orderBy: {
          applications: {
            _count: 'desc',
          },
        },
        take: 5,
      });

      return {
        topClients: topClients.map((client) => ({
          id: client.id,
          name: client.name,
          totalRevenue: client.revenues.reduce(
            (sum, rev) => sum + Number(rev.amount),
            0,
          ),
          totalJobs: client.jobs.length,
          totalContracts: client.contracts.length,
        })),
        topJobs: topJobs.map((job) => ({
          id: job.id,
          title: job.title,
          clientName: job.client.name,
          applicationsCount: job.applications.length,
          status: job.status,
        })),
      };
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10) {
    try {
      // الحصول على آخر الأنشطة من مختلف الجداول
      const [recentUsers, recentJobs, recentApplications, recentContracts] =
        await Promise.all([
          this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.ceil(limit / 4),
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              role: true,
            },
          }),
          this.prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.ceil(limit / 4),
            include: { client: { select: { name: true } } },
          }),
          this.prisma.jobApplication.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.ceil(limit / 4),
            include: {
              job: { select: { title: true } },
              applicant: { include: { user: { select: { name: true } } } },
            },
          }),
          this.prisma.contract.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.ceil(limit / 4),
            include: { client: { select: { name: true } } },
          }),
        ]);

      const activities = [
        ...recentUsers.map((user) => ({
          id: user.id,
          type: 'user_created',
          title: `مستخدم جديد: ${user.name}`,
          description: `تم إنشاء حساب جديد للمستخدم ${user.name} (${user.role})`,
          timestamp: user.createdAt,
          icon: 'user-plus',
        })),
        ...recentJobs.map((job) => ({
          id: job.id,
          type: 'job_created',
          title: `وظيفة جديدة: ${job.title}`,
          description: `تم إنشاء وظيفة جديدة لدى ${job.client.name}`,
          timestamp: job.createdAt,
          icon: 'briefcase',
        })),
        ...recentApplications.map((app) => ({
          id: app.id,
          type: 'application_submitted',
          title: `طلب توظيف جديد`,
          description: `تقدم ${app.applicant.user.name} لوظيفة ${app.job.title}`,
          timestamp: app.createdAt,
          icon: 'file-text',
        })),
        ...recentContracts.map((contract) => ({
          id: contract.id,
          type: 'contract_created',
          title: `عقد جديد: ${contract.title}`,
          description: `تم إنشاء عقد جديد مع ${contract.client.name}`,
          timestamp: contract.createdAt,
          icon: 'file-signature',
        })),
      ];

      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  async getMonthlyRevenue(): Promise<number> {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const revenues = await this.prisma.revenue.findMany({
        where: {
          periodMonth: currentMonth,
          periodYear: currentYear,
        },
      });

      return revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      return 0;
    }
  }

  async getPreviousMonthRevenue(): Promise<number> {
    try {
      const currentDate = new Date();
      const previousMonth =
        currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
      const previousYear =
        currentDate.getMonth() === 0
          ? currentDate.getFullYear() - 1
          : currentDate.getFullYear();

      const revenues = await this.prisma.revenue.findMany({
        where: {
          periodMonth: previousMonth,
          periodYear: previousYear,
        },
      });

      return revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    } catch (error) {
      console.error('Error fetching previous month revenue:', error);
      return 0;
    }
  }

  async getRevenueChart(months: number = 12) {
    try {
      const revenues = await this.prisma.revenue.groupBy({
        by: ['periodMonth', 'periodYear'],
        _sum: {
          amount: true,
        },
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        take: months,
      });

      return revenues
        .map((revenue) => ({
          month: revenue.periodMonth,
          year: revenue.periodYear,
          amount: Number(revenue._sum.amount) || 0,
        }))
        .reverse();
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      throw error;
    }
  }

  async getJobStatusChart() {
    try {
      const jobStats = await this.prisma.job.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      return jobStats.map((stat) => ({
        status: stat.status,
        count: stat._count.status,
      }));
    } catch (error) {
      console.error('Error fetching job status chart data:', error);
      throw error;
    }
  }
}
