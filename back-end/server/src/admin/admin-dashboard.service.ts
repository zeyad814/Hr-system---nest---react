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
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Generate array of last N months
      const monthsData = [];
      for (let i = months - 1; i >= 0; i--) {
        let targetMonth = currentMonth - i;
        let targetYear = currentYear;

        if (targetMonth <= 0) {
          targetMonth += 12;
          targetYear -= 1;
        }

        monthsData.push({
          month: targetMonth,
          year: targetYear,
        });
      }

      // Fetch revenue data
      const revenues = await this.prisma.revenue.groupBy({
        by: ['periodMonth', 'periodYear'],
        _sum: {
          amount: true,
        },
        where: {
          OR: monthsData.map((m) => ({
            periodMonth: m.month,
            periodYear: m.year,
          })),
        },
      });

      // Map revenue data to months
      const revenueMap = new Map();
      revenues.forEach((rev) => {
        const key = `${rev.periodYear}-${rev.periodMonth}`;
        revenueMap.set(key, Number(rev._sum.amount) || 0);
      });

      // Return data for all months (including months with 0 revenue)
      return monthsData.map((m) => {
        const key = `${m.year}-${m.month}`;
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        return {
          month: `${monthNames[m.month - 1]} ${m.year}`,
          revenue: revenueMap.get(key) || 0,
        };
      });
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

  async getRevenueStatsWithTargets(months: number = 6, period: string = 'last') {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      let startMonth, startYear;
      
      if (period === 'first') {
        // First N months of the current year
        startMonth = 1;
        startYear = currentYear;
      } else {
        // Last N months (default behavior)
        startMonth = currentMonth - months + 1;
        startYear = currentYear;
        
        if (startMonth <= 0) {
          startMonth += 12;
          startYear -= 1;
        }
      }

      // Get revenue data
      const revenues = await this.prisma.revenue.groupBy({
        by: ['periodMonth', 'periodYear'],
        _sum: {
          amount: true,
        },
        where: {
          OR: [
            { periodYear: currentYear },
            { periodYear: startYear },
          ],
        },
        orderBy: [{ periodYear: 'asc' }, { periodMonth: 'asc' }],
      });

      // Get all monthly targets for the relevant period
      const targets = await this.prisma.monthlyTarget.findMany({
        where: {
          OR: [
            { year: currentYear },
            { year: startYear },
          ],
        },
      });

      // Create a map for quick target lookup
      const targetMap = new Map(
        targets.map((t) => [`${t.year}-${t.month}`, Number(t.targetAmount)]),
      );

      // Generate data for the last N months
      const data = [];
      for (let i = 0; i < months; i++) {
        let month = startMonth + i;
        let year = startYear;

        if (month > 12) {
          month -= 12;
          year += 1;
        }

        const key = `${year}-${month}`;
        const revenueData = revenues.find(
          (r) => r.periodMonth === month && r.periodYear === year,
        );
        const target = targetMap.get(key) || 0;

        data.push({
          month: month,
          monthNumber: month,
          year: year,
          revenue: revenueData ? Number(revenueData._sum.amount) || 0 : 0,
          target: target,
        });
      }

      return { data };
    } catch (error) {
      console.error('Error fetching revenue stats with targets:', error);
      throw error;
    }
  }

  async getJobStats() {
    try {
      const [openJobs, closedJobs, hiredJobs] = await Promise.all([
        this.prisma.job.count({ where: { status: 'OPEN' } }),
        this.prisma.job.count({ where: { status: 'CLOSED' } }),
        this.prisma.job.count({ where: { status: 'HIRED' } }),
      ]);

      const total = openJobs + closedJobs + hiredJobs;

      return {
        total,
        openJobs,
        closedJobs,
        hiredJobs
      };
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }
}
