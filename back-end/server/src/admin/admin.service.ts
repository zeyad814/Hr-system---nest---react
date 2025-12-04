import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [newClientsCount, closedContractsCount, revenues] = await Promise.all(
      [
        this.prisma.client.count({ where: { createdAt: { gte: since } } }),
        this.prisma.contract.count({ where: { signedAt: { not: null } } }),
        this.prisma.revenue.aggregate({ _sum: { amount: true } }),
      ],
    );

    return {
      newClients: newClientsCount,
      closedContracts: closedContractsCount,
      totalRevenue: revenues._sum.amount ?? 0,
      since: since.toISOString(),
    };
  }

  async getRevenueTimeseries() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `select to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
              coalesce(sum("amount"::numeric), 0) as amount
       from "Revenue"
       where "createdAt" >= $1
       group by 1
       order by 1 asc`,
      since,
    );
    return rows.map((r) => ({ date: r.date, amount: Number(r.amount) }));
  }

  async getClientsTimeseries() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `select to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
              count(*)::int as count
       from "Client"
       where "createdAt" >= $1
       group by 1
       order by 1 asc`,
      since,
    );
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getAdminProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  async createAdminProfile(userId: string, createProfileDto: any) {
    const profile = await this.prisma.profile.create({
      data: {
        userId,
        ...createProfileDto,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  async updateAdminProfile(userId: string, updateProfileDto: any) {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  // System Settings Management
  async getSystemSettings() {
    let settings = await this.prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await this.prisma.systemSettings.create({
        data: {
          showTotalUsers: true,
          showTotalClients: true,
          showTotalJobs: true,
          showTotalContracts: true,
          showTotalApplicants: true,
          showMonthlyRevenue: true,
        },
      });
    }

    return settings;
  }

  async updateSystemSettings(updateDto: UpdateSystemSettingsDto) {
    let settings = await this.prisma.systemSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await this.prisma.systemSettings.create({
        data: {
          ...updateDto,
          showTotalUsers: updateDto.showTotalUsers ?? true,
          showTotalClients: updateDto.showTotalClients ?? true,
          showTotalJobs: updateDto.showTotalJobs ?? true,
          showTotalContracts: updateDto.showTotalContracts ?? true,
          showTotalApplicants: updateDto.showTotalApplicants ?? true,
          showMonthlyRevenue: updateDto.showMonthlyRevenue ?? true,
        },
      });
    } else {
      // Update existing
      settings = await this.prisma.systemSettings.update({
        where: { id: settings.id },
        data: updateDto,
      });
    }

    return settings;
  }

  async uploadCompanyLogo(logoBase64: string) {
    let settings = await this.prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: {
          companyLogo: logoBase64,
          showTotalUsers: true,
          showTotalClients: true,
          showTotalJobs: true,
          showTotalContracts: true,
          showTotalApplicants: true,
          showMonthlyRevenue: true,
        },
      });
    } else {
      settings = await this.prisma.systemSettings.update({
        where: { id: settings.id },
        data: { companyLogo: logoBase64 },
      });
    }

    return settings;
  }
}
