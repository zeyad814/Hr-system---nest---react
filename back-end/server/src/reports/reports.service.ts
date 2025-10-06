import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  newClientsCount: number;
  openJobsCount: number;
  closedJobsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  salesRepTargetAchievement: number;
}

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  contractsCount: number;
}

export interface SalesRepPerformance {
  repId: string;
  repName: string;
  newClientsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  targetAchievement: number;
  target: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  newClients: number;
  signedContracts: number;
  revenue: number;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * الحصول على إحصائيات لوحة التحكم الرئيسية
   */
  async getDashboardStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<DashboardStats> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // عدد العملاء الجدد
    const newClientsCount = await this.prisma.client.count({
      where: {
        createdAt: dateFilter,
      },
    });

    // عدد الوظائف المفتوحة
    const openJobsCount = await this.prisma.job.count({
      where: {
        status: 'OPEN',
        createdAt: dateFilter,
      },
    });

    // عدد الوظائف المغلقة
    const closedJobsCount = await this.prisma.job.count({
      where: {
        status: { in: ['CLOSED', 'HIRED'] },
        createdAt: dateFilter,
      },
    });

    // عدد العقود الموقعة
    const signedContractsCount = await this.prisma.contract.count({
      where: {
        signedAt: { not: null },
        createdAt: dateFilter,
      },
    });

    // إجمالي الإيرادات
    const revenueResult = await this.prisma.revenue.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: dateFilter,
      },
    });

    const totalRevenue = Number(revenueResult._sum.amount || 0);

    // نسبة تحقيق التارجت (افتراضي 100000 كهدف شهري)
    const monthlyTarget = 100000;
    const salesRepTargetAchievement =
      monthlyTarget > 0 ? (totalRevenue / monthlyTarget) * 100 : 0;

    return {
      newClientsCount,
      openJobsCount,
      closedJobsCount,
      signedContractsCount,
      totalRevenue,
      salesRepTargetAchievement:
        Math.round(salesRepTargetAchievement * 100) / 100,
    };
  }

  /**
   * الحصول على الإيرادات حسب العميل
   */
  async getRevenueByClient(
    startDate?: Date,
    endDate?: Date,
  ): Promise<RevenueByClient[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const revenueByClient = await this.prisma.revenue.groupBy({
      by: ['clientId'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        createdAt: dateFilter,
      },
    });

    const result: RevenueByClient[] = [];

    for (const revenue of revenueByClient) {
      const client = await this.prisma.client.findUnique({
        where: { id: revenue.clientId },
        select: { name: true },
      });

      result.push({
        clientId: revenue.clientId,
        clientName: client?.name || 'Unknown Client',
        totalRevenue: Number(revenue._sum.amount || 0),
        contractsCount: revenue._count.id,
      });
    }

    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * الحصول على أداء مندوبي المبيعات
   */
  async getSalesRepPerformance(
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesRepPerformance[]> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // الحصول على جميع مندوبي المبيعات
    const salesReps = await this.prisma.user.findMany({
      where: {
        role: 'SALES',
      },
      select: {
        id: true,
        name: true,
      },
    });

    const result: SalesRepPerformance[] = [];

    for (const rep of salesReps) {
      // عدد العملاء الجدد (افتراضياً نربطهم بمندوب المبيعات عبر createdBy أو نظام آخر)
      const newClientsCount = await this.prisma.client.count({
        where: {
          createdAt: dateFilter,
          // يمكن إضافة حقل createdBy في المستقبل
        },
      });

      // عدد العقود الموقعة
      const signedContractsCount = await this.prisma.contract.count({
        where: {
          signedAt: { not: null },
          createdAt: dateFilter,
        },
      });

      // إجمالي الإيرادات
      const revenueResult = await this.prisma.revenue.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          createdAt: dateFilter,
        },
      });

      const totalRevenue = Number(revenueResult._sum.amount || 0);
      const target = 100000; // هدف شهري افتراضي
      const targetAchievement = target > 0 ? (totalRevenue / target) * 100 : 0;

      result.push({
        repId: rep.id,
        repName: rep.name,
        newClientsCount,
        signedContractsCount,
        totalRevenue,
        target,
        targetAchievement: Math.round(targetAchievement * 100) / 100,
      });
    }

    return result.sort((a, b) => b.targetAchievement - a.targetAchievement);
  }

  /**
   * الحصول على الإحصائيات الشهرية
   */
  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    const result: MonthlyStats[] = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const newClients = await this.prisma.client.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const signedContracts = await this.prisma.contract.count({
        where: {
          signedAt: {
            not: null,
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const revenueResult = await this.prisma.revenue.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const revenue = Number(revenueResult._sum.amount || 0);

      result.push({
        month,
        year,
        newClients,
        signedContracts,
        revenue,
      });
    }

    return result;
  }

  /**
   * الحصول على إحصائيات التوظيف
   */
  async getHiringStats(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const totalApplications = await this.prisma.jobApplication.count({
      where: {
        createdAt: dateFilter,
      },
    });

    const hiredCount = await this.prisma.jobApplication.count({
      where: {
        status: 'HIRED',
        createdAt: dateFilter,
      },
    });

    const rejectedCount = await this.prisma.jobApplication.count({
      where: {
        status: 'REJECTED',
        createdAt: dateFilter,
      },
    });

    const interviewCount = await this.prisma.jobApplication.count({
      where: {
        status: 'INTERVIEW',
        createdAt: dateFilter,
      },
    });

    const pendingCount = await this.prisma.jobApplication.count({
      where: {
        status: 'PENDING',
        createdAt: dateFilter,
      },
    });

    const hiringSuccessRate =
      totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;

    return {
      totalApplications,
      hiredCount,
      rejectedCount,
      interviewCount,
      pendingCount,
      hiringSuccessRate: Math.round(hiringSuccessRate * 100) / 100,
    };
  }

  /**
   * الحصول على إحصائيات المقابلات
   */
  async getInterviewStats(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate, 'scheduledAt');

    const totalInterviews = await this.prisma.interview.count({
      where: {
        scheduledAt: dateFilter,
      },
    });

    const attendedInterviews = await this.prisma.interview.count({
      where: {
        status: 'ATTENDED',
        scheduledAt: dateFilter,
      },
    });

    const noShowInterviews = await this.prisma.interview.count({
      where: {
        status: 'NO_SHOW',
        scheduledAt: dateFilter,
      },
    });

    const cancelledInterviews = await this.prisma.interview.count({
      where: {
        status: 'CANCELLED',
        scheduledAt: dateFilter,
      },
    });

    const attendanceRate =
      totalInterviews > 0 ? (attendedInterviews / totalInterviews) * 100 : 0;

    return {
      totalInterviews,
      attendedInterviews,
      noShowInterviews,
      cancelledInterviews,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  /**
   * بناء فلتر التاريخ
   */
  private buildDateFilter(
    startDate?: Date,
    endDate?: Date,
    field: string = 'createdAt',
  ) {
    if (!startDate && !endDate) {
      return undefined;
    }

    const filter: any = {};

    if (startDate && endDate) {
      filter[field] = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      filter[field] = {
        gte: startDate,
      };
    } else if (endDate) {
      filter[field] = {
        lte: endDate,
      };
    }

    return filter;
  }
}
