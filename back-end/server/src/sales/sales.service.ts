import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalesClient, SalesJob, SalesRevenue, Prisma } from '@prisma/client';
import {
  CreateSalesTargetDto,
  UpdateSalesTargetDto,
} from './dto/sales-targets.dto';
import {
  CreateSalesContractDto,
  UpdateSalesContractDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateDocumentDto,
} from './dto/sales-contracts.dto';

export interface CreateSalesClientDto {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  contactPerson?: string;
  description?: string;
}

export interface UpdateSalesClientDto {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  status?: 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  contactPerson?: string;
  description?: string;
}

export interface CreateSalesJobDto {
  title: string;
  clientId: string;
  department?: string;
  location?: string;
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  salary?: string;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  commission?: number;
}

export interface UpdateSalesJobDto {
  title?: string;
  department?: string;
  location?: string;
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  status?: 'OPEN' | 'IN_PROGRESS' | 'FILLED' | 'CANCELLED' | 'ON_HOLD';
  salary?: string;
  candidates?: number;
  applications?: number;
  hired?: number;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  commission?: number;
}

export interface CreateSalesRevenueDto {
  source: string;
  clientId: string;
  contract?: string;
  amount: number;
  currency?: string;
  commission?: number;
  type?: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER';
  date?: string;
  dueDate?: string;
}

export interface UpdateSalesRevenueDto {
  source?: string;
  contract?: string;
  amount?: number;
  currency?: string;
  commission?: number;
  type?: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER';
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  date?: string;
  dueDate?: string;
  paidDate?: string;
}

export interface UpdateSalesProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  department?: string;
  position?: string;
  salary?: number;
  commissionRate?: number;
  targets?: any;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  notes?: string;
}

export interface CreateSalesProfileDto {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  department?: string;
  position?: string;
  salary?: number;
  commissionRate?: number;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  notes?: string;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // Profile Methods
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.profile) {
      throw new Error('Profile not found');
    }

    return user.profile;
  }

  async createProfile(userId: string, profileData: CreateSalesProfileDto | UpdateSalesProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.profile) {
      throw new Error('Profile already exists');
    }

    // Convert arrays to proper format if needed
    const processedData: any = {
      ...profileData,
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
      dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      hireDate: profileData.hireDate ? new Date(profileData.hireDate) : undefined,
    };

    // Remove fields that don't exist in Profile model
    delete processedData.salary;
    delete processedData.commissionRate;
    delete processedData.targets;

    return this.prisma.profile.create({
      data: {
        userId,
        ...processedData,
      },
    });
  }

  async updateProfile(userId: string, profileData: UpdateSalesProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.profile) {
      // Create profile if it doesn't exist
      return this.createProfile(userId, profileData);
    }

    // Convert arrays to proper format if needed
    const processedData: any = {
      ...profileData,
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
      dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      hireDate: profileData.hireDate ? new Date(profileData.hireDate) : undefined,
    };

    // Remove fields that don't exist in Profile model
    delete processedData.salary;
    delete processedData.commissionRate;
    delete processedData.targets;

    return this.prisma.profile.update({
      where: { userId },
      data: processedData,
    });
  }

  // Sales Clients
  async getAllClients(params?: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    industry?: string;
  }) {
    const { skip = 0, take = 10, search, status, industry } = params || {};

    const where: Prisma.SalesClientWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    const [clients, total] = await Promise.all([
      this.prisma.salesClient.findMany({
        where,
        skip,
        take,
        include: {
          jobs: true,
          revenues: true,
        },
        orderBy: { lastActivity: 'desc' },
      }),
      this.prisma.salesClient.count({ where }),
    ]);

    return {
      clients,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async getClientById(id: string) {
    return this.prisma.salesClient.findUnique({
      where: { id },
      include: {
        jobs: true,
        revenues: true,
      },
    });
  }

  async createClient(data: CreateSalesClientDto) {
    return this.prisma.salesClient.create({
      data,
      include: {
        jobs: true,
        revenues: true,
      },
    });
  }

  async updateClient(id: string, data: UpdateSalesClientDto) {
    return this.prisma.salesClient.update({
      where: { id },
      data: {
        ...data,
        lastActivity: new Date(),
      },
      include: {
        jobs: true,
        revenues: true,
      },
    });
  }

  async deleteClient(id: string) {
    return this.prisma.salesClient.delete({
      where: { id },
    });
  }

  // Sales Jobs
  async getAllJobs(params?: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    clientId?: string;
    type?: string;
  }) {
    const {
      skip = 0,
      take = 10,
      search,
      status,
      clientId,
      type,
    } = params || {};

    const where: Prisma.SalesJobWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (type) {
      where.type = type as any;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.salesJob.findMany({
        where,
        skip,
        take,
        include: {
          client: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesJob.count({ where }),
    ]);

    return {
      jobs,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async getJobById(id: string) {
    return this.prisma.salesJob.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  }

  async createJob(data: CreateSalesJobDto) {
    const jobData: any = {
      ...data,
      commission: data.commission
        ? new Prisma.Decimal(data.commission)
        : undefined,
    };

    if (data.deadline) {
      jobData.deadline = new Date(data.deadline);
    }

    return this.prisma.salesJob.create({
      data: jobData,
      include: {
        client: true,
      },
    });
  }

  async updateJob(id: string, data: UpdateSalesJobDto) {
    const jobData: any = {
      ...data,
      commission: data.commission
        ? new Prisma.Decimal(data.commission)
        : undefined,
    };

    if (data.deadline) {
      jobData.deadline = new Date(data.deadline);
    }

    return this.prisma.salesJob.update({
      where: { id },
      data: jobData,
      include: {
        client: true,
      },
    });
  }

  async deleteJob(id: string) {
    return this.prisma.salesJob.delete({
      where: { id },
    });
  }

  // Sales Revenue
  async getAllRevenues(params?: {
    skip?: number;
    take?: number;
    clientId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      skip = 0,
      take = 10,
      clientId,
      status,
      type,
      startDate,
      endDate,
    } = params || {};

    const where: Prisma.SalesRevenueWhereInput = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status as any;
    }

    if (type) {
      where.type = type as any;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [revenues, total] = await Promise.all([
      this.prisma.salesRevenue.findMany({
        where,
        skip,
        take,
        include: {
          client: true,
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.salesRevenue.count({ where }),
    ]);

    return {
      revenues,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async getRevenueById(id: string) {
    return this.prisma.salesRevenue.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  }

  async createRevenue(data: CreateSalesRevenueDto) {
    const revenueData: any = {
      ...data,
      amount: new Prisma.Decimal(data.amount),
      commission: data.commission
        ? new Prisma.Decimal(data.commission)
        : undefined,
    };

    if (data.date) {
      revenueData.date = new Date(data.date);
    }

    if (data.dueDate) {
      revenueData.dueDate = new Date(data.dueDate);
    }

    return this.prisma.salesRevenue.create({
      data: revenueData,
      include: {
        client: true,
      },
    });
  }

  async updateRevenue(id: string, data: UpdateSalesRevenueDto) {
    const revenueData: any = {
      ...data,
      amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
      commission: data.commission
        ? new Prisma.Decimal(data.commission)
        : undefined,
    };

    if (data.date) {
      revenueData.date = new Date(data.date);
    }

    if (data.dueDate) {
      revenueData.dueDate = new Date(data.dueDate);
    }

    if (data.paidDate) {
      revenueData.paidDate = new Date(data.paidDate);
    }

    return this.prisma.salesRevenue.update({
      where: { id },
      data: revenueData,
      include: {
        client: true,
      },
    });
  }

  async deleteRevenue(id: string) {
    return this.prisma.salesRevenue.delete({
      where: { id },
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalClients,
      activeClients,
      totalJobs,
      openJobs,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.salesClient.count(),
      this.prisma.salesClient.count({ where: { status: 'ACTIVE' } }),
      this.prisma.salesJob.count(),
      this.prisma.salesJob.count({ where: { status: 'OPEN' } }),
      this.prisma.salesRevenue.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      this.prisma.salesRevenue.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      totalJobs,
      openJobs,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
  }

  // Monthly Revenue Data
  async getMonthlyRevenue(year: number = new Date().getFullYear()) {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const result = await this.prisma.salesRevenue.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAID',
        },
      });

      monthlyData.push({
        month,
        revenue: Number(result._sum.amount || 0),
      });
    }

    return monthlyData;
  }

  // Sales Targets Methods
  async getAllTargets(options: {
    skip?: number;
    take?: number;
    type?: string;
    status?: string;
    assignedTo?: string;
  }) {
    const { skip = 0, take = 10, type, status, assignedTo } = options;

    const where: Prisma.SalesTargetWhereInput = {};
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    if (assignedTo) where.assignedTo = assignedTo;

    const [targets, total] = await Promise.all([
      this.prisma.salesTarget.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesTarget.count({ where }),
    ]);

    const targetsWithCalculations = targets.map((target) => {
      const percentage =
        Number(target.target) > 0
          ? (Number(target.achieved) / Number(target.target)) * 100
          : 0;
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(target.endDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      return {
        ...target,
        target: Number(target.target),
        achieved: Number(target.achieved),
        percentage: Math.round(percentage * 100) / 100,
        daysLeft,
      };
    });

    return {
      targets: targetsWithCalculations,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async getTargetById(id: string) {
    const target = await this.prisma.salesTarget.findUnique({
      where: { id },
    });

    if (!target) {
      throw new Error('Target not found');
    }

    const percentage =
      Number(target.target) > 0
        ? (Number(target.achieved) / Number(target.target)) * 100
        : 0;
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (new Date(target.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    return {
      ...target,
      target: Number(target.target),
      achieved: Number(target.achieved),
      percentage: Math.round(percentage),
      daysLeft,
    };
  }

  async createTarget(data: CreateSalesTargetDto) {
    return this.prisma.salesTarget.create({
      data: {
        ...data,
        target: Number(data.target),
        achieved: 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        period: data.period,
      },
    });
  }

  async updateTarget(id: string, data: UpdateSalesTargetDto) {
    const updateData: any = { ...data };
    if (data.target) updateData.target = Number(data.target);
    if (data.achieved !== undefined)
      updateData.achieved = Number(data.achieved);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return this.prisma.salesTarget.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteTarget(id: string) {
    return this.prisma.salesTarget.delete({
      where: { id },
    });
  }

  // Sales Contracts Methods
  async getAllContracts(options: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    type?: string;
    clientId?: string;
  }) {
    const { skip = 0, take = 10, search, status, type, clientId } = options;

    const where: Prisma.SalesContractWhereInput = {};
    if (status) where.status = status as any;
    if (type) where.type = type as any;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      this.prisma.salesContract.findMany({
        where,
        skip,
        take,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
          milestones: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesContract.count({ where }),
    ]);

    const contractsWithCalculations = contracts.map((contract) => ({
      ...contract,
      value: {
        amount: Number(contract.value),
        currency: contract.currency,
      },
      commission: Number(contract.commission),
    }));

    return {
      contracts: contractsWithCalculations,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async getContractById(id: string) {
    const contract = await this.prisma.salesContract.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        milestones: true,
        documents: true,
      },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    return {
      ...contract,
      value: {
        amount: Number(contract.value),
        currency: contract.currency,
      },
      commission: Number(contract.commission),
    };
  }

  async createContract(data: CreateSalesContractDto) {
    return this.prisma.salesContract.create({
      data: {
        ...data,
        value: Number(data.value),
        commission: Number(data.commission || 0),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        milestones: true,
        documents: true,
      },
    });
  }

  async updateContract(id: string, data: UpdateSalesContractDto) {
    const updateData: any = { ...data };
    if (data.value) updateData.value = Number(data.value);
    if (data.commission !== undefined)
      updateData.commission = Number(data.commission);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.signedDate) updateData.signedDate = new Date(data.signedDate);

    return this.prisma.salesContract.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        milestones: true,
        documents: true,
      },
    });
  }

  async deleteContract(id: string) {
    return this.prisma.salesContract.delete({
      where: { id },
    });
  }

  async addMilestone(contractId: string, data: CreateMilestoneDto) {
    return this.prisma.salesContractMilestone.create({
      data: {
        ...data,
        contractId,
        amount: Number(data.amount),
        dueDate: new Date(data.dueDate),
      },
    });
  }

  async updateMilestone(id: string, data: UpdateMilestoneDto) {
    const updateData: any = { ...data };
    if (data.amount) updateData.amount = Number(data.amount);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.completedAt) updateData.completedAt = new Date(data.completedAt);

    return this.prisma.salesContractMilestone.update({
      where: { id },
      data: updateData,
    });
  }

  async addDocument(contractId: string, data: CreateDocumentDto) {
    return this.prisma.salesContractDocument.create({
      data: {
        ...data,
        contractId,
      },
    });
  }

  // Sales Achievements
  async getAchievements() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get highest revenue month
    const monthlyRevenues = await this.getMonthlyRevenue(currentYear);
    const highestRevenueMonth = monthlyRevenues.reduce((max, current) =>
      current.revenue > max.revenue ? current : max,
    );

    // Get best performing targets
    const completedTargets = await this.prisma.salesTarget.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
      take: 3,
    });

    // Calculate percentage for each target and sort
    const targetsWithPercentage = completedTargets
      .map((target) => {
        const percentage =
          Number(target.target) > 0
            ? (Number(target.achieved) / Number(target.target)) * 100
            : 0;
        return { ...target, percentage: Math.round(percentage) };
      })
      .sort((a, b) => b.percentage - a.percentage);

    // Get total contracts signed this year
    const contractsCount = await this.prisma.salesContract.count({
      where: {
        status: 'COMPLETED',
        signedDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
    });

    const achievements = [
      {
        title: 'أفضل شهر في الإيرادات',
        description: `حققت أعلى إيرادات في ${this.getMonthName(highestRevenueMonth.month)} ${currentYear}`,
        value: `${highestRevenueMonth.revenue.toLocaleString()} ريال`,
        date: `${this.getMonthName(highestRevenueMonth.month)} ${currentYear}`,
        icon: 'TrendingUp',
        color: 'text-green-600',
      },
      {
        title: 'إجمالي العقود المكتملة',
        description: `تم إنجاز ${contractsCount} عقد بنجاح هذا العام`,
        value: `${contractsCount} عقد`,
        date: `${currentYear}`,
        icon: 'FileCheck',
        color: 'text-blue-600',
      },
      {
        title: 'أفضل هدف محقق',
        description:
          targetsWithPercentage.length > 0
            ? `تحقيق ${targetsWithPercentage[0].percentage}% من الهدف`
            : 'لا توجد أهداف مكتملة',
        value:
          targetsWithPercentage.length > 0
            ? `${targetsWithPercentage[0].percentage}%`
            : '0%',
        date:
          targetsWithPercentage.length > 0
            ? new Date(targetsWithPercentage[0].endDate).toLocaleDateString(
                'ar-SA',
              )
            : '',
        icon: 'Target',
        color: 'text-purple-600',
      },
    ];

    return achievements;
  }

  // Quarterly Performance
  async getQuarterlyPerformance(year: number = new Date().getFullYear()) {
    const quarters = [
      { quarter: 'Q1', months: [1, 2, 3], name: 'الربع الأول' },
      { quarter: 'Q2', months: [4, 5, 6], name: 'الربع الثاني' },
      { quarter: 'Q3', months: [7, 8, 9], name: 'الربع الثالث' },
      { quarter: 'Q4', months: [10, 11, 12], name: 'الربع الرابع' },
    ];

    const quarterlyData = [];

    for (const q of quarters) {
      // Get quarterly targets
      const quarterlyTargets = await this.prisma.salesTarget.findMany({
        where: {
          period: {
            contains: q.quarter,
          },
          startDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
      });

      // Calculate quarterly revenue
      let quarterlyRevenue = 0;
      for (const month of q.months) {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const result = await this.prisma.salesRevenue.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: 'PAID',
          },
        });

        quarterlyRevenue += Number(result._sum.amount || 0);
      }

      // Calculate target and percentage
      const totalTarget = quarterlyTargets.reduce(
        (sum, target) => sum + Number(target.target),
        0,
      );
      const percentage =
        totalTarget > 0
          ? Math.round((quarterlyRevenue / totalTarget) * 100)
          : 0;

      let status = 'لم يبدأ';
      if (percentage >= 90) status = 'في المسار';
      else if (percentage >= 50) status = 'تحتاج دفعة';
      else if (percentage > 0) status = 'بطيء';

      quarterlyData.push({
        quarter: `${q.quarter} ${year}`,
        name: q.name,
        target: `${totalTarget.toLocaleString()} ريال`,
        achieved: `${quarterlyRevenue.toLocaleString()} ريال`,
        percentage,
        status,
      });
    }

    return quarterlyData;
  }

  private getMonthName(month: number): string {
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    return months[month - 1] || '';
  }
}
