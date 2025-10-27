import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, ContractStatus, ClientStatus } from '@prisma/client';

export interface CreateClientDto {
  name: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  description?: string;
  logo?: string;
  establishedYear?: number;
  employees?: string;
  revenue?: string;
  userId?: string;
}

export interface UpdateClientDto {
  name?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  description?: string;
  logo?: string;
  establishedYear?: number;
  employees?: string;
  revenue?: string;
}

export interface CreateClientProfileDto {
  name: string;
  companyName: string;
  industry: string;
  companySize?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  description?: string;
  logo?: string;
  establishedYear?: number;
  employees?: string;
  revenue?: string;
}

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  // Helper method to get client by ID
  async getClientById(clientId: string) {
    return this.prisma.client.findUnique({
      where: { id: clientId }
    });
  }

  // Helper method to create client
  async createClient(clientData: any) {
    return this.prisma.client.create({
      data: {
        name: clientData.name || 'عميل جديد',
        ...clientData
      }
    });
  }

  // Basic CRUD operations
  create(data: CreateClientDto) {
    return this.prisma.client.create({
      data,
    });
  }

  findAll() {
    return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, data: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }

  // Client Profile Management

  async createOrUpdateProfile(userId: string, data: CreateClientProfileDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (existingClient) {
      return this.prisma.client.update({
        where: { userId },
        data,
        include: { user: true }
      });
    }

    return this.prisma.client.create({
      data: { ...data, userId },
      include: { user: true }
    });
  }

  async getMyProfile(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: {
        user: true,
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        contracts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reminders: {
          where: { done: false },
          orderBy: { remindAt: 'asc' }
        }
      }
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    return client;
  }



  // Enhanced findAll with user relationships
  findAllWithUsers() {
    return this.prisma.client.findMany({
      include: {
        user: true,
        jobs: true,
        contracts: true,
        _count: {
          select: {
            jobs: true,
            contracts: true,
            notes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Enhanced findOne with user relationships
  async findOneWithUser(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        jobs: {
          orderBy: { createdAt: 'desc' }
        },
        contracts: {
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        reminders: {
          orderBy: { remindAt: 'asc' }
        },
        revenues: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  // Nested create/list helpers
  listNotes(clientId: string) {
    return this.prisma.note.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listReminders(clientId: string) {
    return this.prisma.reminder.findMany({
      where: { clientId },
      orderBy: { remindAt: 'asc' },
    });
  }

  listContracts(clientId: string) {
    return this.prisma.contract.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listRevenues(clientId: string) {
    return this.prisma.revenue.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Helper method to get or create client for user
  async getOrCreateClientForUser(userId: string) {
    // First try to find existing client by userId
    const existingClient = await this.prisma.client.findUnique({
      where: {
        userId: userId
      }
    });
    
    if (existingClient) {
      return existingClient;
    }
    
    // Get user details to create client
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new client if not found
    return this.prisma.client.create({
      data: {
        userId: userId,
        name: user.name || 'عميل جديد',
        email: user.email,
        status: 'NEW'
      }
    });
  }

  // Dashboard Methods
  async getDashboardStats(clientId: string, dateRange?: { startDate?: string; endDate?: string }) {
    const dateFilter = dateRange && (dateRange.startDate || dateRange.endDate) ? {
      createdAt: {
        ...(dateRange.startDate && { gte: new Date(dateRange.startDate) }),
        ...(dateRange.endDate && { lte: new Date(dateRange.endDate) })
      }
    } : {};

    const [totalJobs, activeJobs, totalApplicants, hiredCandidates, totalRevenue, activeContracts] = await Promise.all([
      this.prisma.job.count({ where: { clientId, ...dateFilter } }),
      this.prisma.job.count({ where: { clientId, status: JobStatus.OPEN, ...dateFilter } }),
      this.prisma.jobApplication.count({
        where: { job: { clientId }, ...dateFilter }
      }),
      this.prisma.jobApplication.count({
        where: { job: { clientId }, status: 'HIRED', ...dateFilter }
      }),
      this.prisma.revenue.aggregate({
        where: { clientId, ...dateFilter },
        _sum: { amount: true }
      }),
      this.prisma.contract.count({
        where: { clientId, status: ContractStatus.ACTIVE, ...dateFilter }
      })
    ]);

    return {
      stats: [
        { title: 'إجمالي الوظائف', value: totalJobs, icon: 'briefcase' },
        { title: 'الوظائف النشطة', value: activeJobs, icon: 'clock' },
        { title: 'إجمالي المتقدمين', value: totalApplicants, icon: 'users' },
        { title: 'المرشحين المختارين', value: hiredCandidates, icon: 'star' },
      ],
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      activeContracts
    };
  }

  async getActiveJobs(clientId: string) {
    return this.prisma.job.findMany({
      where: { clientId, status: JobStatus.OPEN },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  }

  async getTopCandidates(clientId: string) {
    const applications = await this.prisma.jobApplication.findMany({
      where: {
        job: { clientId },
        status: { in: ['INTERVIEW', 'OFFER', 'HIRED'] }
      },
      include: {
        applicant: true,
        job: true
      },
      orderBy: {
        applicant: {
          rating: 'desc'
        }
      },
      take: 5
    });

    return applications.map(app => ({
      id: app.applicant.id,
      name: `مرشح ${app.applicant.id.slice(-4)}`,
      position: app.job.title,
      rating: app.applicant.rating || 0,
      status: app.status
    }));
  }

  async getRecentApplications(clientId: string) {
    return this.prisma.jobApplication.findMany({
      where: { job: { clientId } },
      include: {
        applicant: true,
        job: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }

  async getRecentActivities(clientId: string) {
    const recentApplications = await this.getRecentApplications(clientId);
    const recentContracts = await this.prisma.contract.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const activities = [
      ...recentApplications.map(app => ({
        id: app.id,
        type: 'application',
        title: `تقديم جديد على وظيفة ${app.job.title}`,
        description: `مرشح جديد تقدم للوظيفة`,
        date: app.createdAt,
        status: app.status
      })),
      ...recentContracts.map(contract => ({
        id: contract.id,
        type: 'contract',
        title: `عقد جديد: ${contract.title}`,
        description: contract.description || 'لا يوجد وصف',
        date: contract.createdAt,
        status: contract.status
      }))
    ];

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }

  // Job Management Methods
  async getJobs(clientId: string, pagination?: { page?: number; limit?: number }) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { clientId },
        include: {
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.job.count({ where: { clientId } })
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createJob(clientId: string, jobData: any) {
    // Remove fields that don't exist in the Job model
    const { experienceLevel, ...validJobData } = jobData;
    
    return this.prisma.job.create({
      data: {
        ...validJobData,
        clientId,
        applicationDeadline: new Date(jobData.applicationDeadline)
      }
    });
  }

  async updateJobStatus(jobId: string, status: JobStatus) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status }
    });
  }

  async getJobById(clientId: string, jobId: string) {
    return this.prisma.job.findFirst({
      where: { 
        id: jobId,
        clientId: clientId
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
  }

  async updateJob(clientId: string, jobId: string, jobData: any) {
    // Remove fields that don't exist in the Job model
    const { experienceLevel, ...validJobData } = jobData;
    
    return this.prisma.job.update({
      where: { 
        id: jobId,
        clientId: clientId
      },
      data: {
        ...validJobData,
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : undefined
      }
    });
  }

  async deleteJob(clientId: string, jobId: string) {
    return this.prisma.job.delete({
      where: { 
        id: jobId,
        clientId: clientId
      }
    });
  }

  async getJob(jobId: string) {
    return this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  async getJobApplications(jobId: string, pagination?: { page?: number; limit?: number }) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where: { jobId },
        include: {
          applicant: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.jobApplication.count({ where: { jobId } })
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Profile Management Methods
  async getProfile(clientId: string) {
    return this.prisma.client.findUnique({
      where: { id: clientId }
    });
  }

  async updateProfile(clientId: string, profileData: any) {
    return this.prisma.client.update({
      where: { id: clientId },
      data: profileData
    });
  }



  // Notes Management Methods
  async getNotes(clientId: string) {
    return this.prisma.note.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addNote(clientId: string, noteData: any) {
    return this.prisma.note.create({
      data: {
        clientId,
        content: noteData.content
      }
    });
  }

  async deleteNote(noteId: string) {
    return this.prisma.note.delete({
      where: { id: noteId }
    });
  }

  // Reminders Management Methods
  async getReminders(clientId: string) {
    return this.prisma.reminder.findMany({
      where: { clientId },
      orderBy: { remindAt: 'asc' }
    });
  }

  async addReminder(clientId: string, reminderData: any) {
    return this.prisma.reminder.create({
      data: {
        clientId,
        title: reminderData.title,
        remindAt: new Date(reminderData.remindAt)
      }
    });
  }

  async updateReminder(reminderId: string, reminderData: any) {
    const updateData: any = {};
    if (reminderData.title) updateData.title = reminderData.title;
    if (reminderData.remindAt) updateData.remindAt = new Date(reminderData.remindAt);
    if (reminderData.done !== undefined) updateData.done = reminderData.done;

    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: updateData
    });
  }

  async deleteReminder(reminderId: string) {
    return this.prisma.reminder.delete({
      where: { id: reminderId }
    });
  }

  // Contract Management Methods
  async getContracts(clientId: string) {
    return this.prisma.contract.findMany({
      where: { clientId },
      include: {
        client: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addContract(clientId: string, contractData: any) {
    const data: any = {
      clientId,
      title: contractData.title,
      description: contractData.description,
      type: contractData.type,
      value: contractData.value,
      currency: contractData.currency || 'SAR',
      commission: contractData.commission,
      commissionType: contractData.commissionType,
      assignedTo: contractData.assignedTo,
      jobTitle: contractData.jobTitle
    };

    if (contractData.startDate) data.startDate = new Date(contractData.startDate);
    if (contractData.endDate) data.endDate = new Date(contractData.endDate);
    if (contractData.signedAt) data.signedAt = new Date(contractData.signedAt);

    return this.prisma.contract.create({ data });
  }

  async updateContractStatus(contractId: string, status: ContractStatus) {
    return this.prisma.contract.update({
      where: { id: contractId },
      data: { status }
    });
  }

  async getContract(contractId: string) {
    return this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: true
      }
    });
  }

  async renewContract(contractId: string, renewData: any) {
    return this.prisma.contract.update({
      where: { id: contractId },
      data: {
        endDate: new Date(renewData.endDate),
        status: ContractStatus.ACTIVE,
        ...(renewData.value && { value: renewData.value })
      }
    });
  }

  async getContractDownloadInfo(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: true
      }
    });

    if (!contract) {
      throw new Error('العقد غير موجود');
    }

    return {
      id: contract.id,
      title: contract.title,
      type: contract.type,
      status: contract.status,
      value: contract.value,
      currency: contract.currency,
      startDate: contract.startDate?.toISOString().split('T')[0],
      endDate: contract.endDate?.toISOString().split('T')[0],
      createdAt: contract.createdAt.toISOString().split('T')[0],
      clientName: contract.client.name || 'غير محدد',
      clientEmail: contract.client.email || 'غير محدد'
    };
  }

  async getContractStats(clientId: string) {
    const [activeContracts, pendingContracts, totalValue, expiringContracts] = await Promise.all([
      this.prisma.contract.count({
        where: { clientId, status: ContractStatus.ACTIVE }
      }),
      this.prisma.contract.count({
        where: { clientId, status: ContractStatus.PENDING }
      }),
      this.prisma.contract.aggregate({
        where: { clientId },
        _sum: { value: true }
      }),
      this.prisma.contract.count({
        where: {
          clientId,
          status: ContractStatus.ACTIVE,
          endDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        }
      })
    ]);

    return {
      active: activeContracts,
      pending: pendingContracts,
      totalValue: Number(totalValue._sum.value) || 0,
      expiring: expiringContracts
    };
  }

  // Revenue Management Methods
  async getRevenues(clientId: string) {
    return this.prisma.revenue.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addRevenue(clientId: string, revenueData: any) {
    return this.prisma.revenue.create({
      data: {
        clientId,
        amount: revenueData.amount,
        periodMonth: revenueData.periodMonth,
        periodYear: revenueData.periodYear
      }
    });
  }

  async getRevenueStats(clientId: string) {
    const [totalRevenue, monthlyRevenue, yearlyRevenue] = await Promise.all([
      this.prisma.revenue.aggregate({
        where: { clientId },
        _sum: { amount: true }
      }),
      this.prisma.revenue.aggregate({
        where: {
          clientId,
          periodMonth: new Date().getMonth() + 1,
          periodYear: new Date().getFullYear()
        },
        _sum: { amount: true }
      }),
      this.prisma.revenue.aggregate({
        where: {
          clientId,
          periodYear: new Date().getFullYear()
        },
        _sum: { amount: true }
      })
    ]);

    return {
      total: Number(totalRevenue._sum.amount) || 0,
      monthly: Number(monthlyRevenue._sum.amount) || 0,
      yearly: Number(yearlyRevenue._sum.amount) || 0
    };
  }

  async getJobRequestStats(clientId: string) {
    const [totalRequests, activeRequests, completedRequests] = await Promise.all([
      this.prisma.job.count({ where: { clientId } }),
      this.prisma.job.count({ where: { clientId, status: JobStatus.OPEN } }),
      this.prisma.job.count({ where: { clientId, status: JobStatus.HIRED } })
    ]);

    return {
      total: totalRequests,
      active: activeRequests,
      completed: completedRequests
    };
  }

  // Helper method to get contract status text
   private getContractStatusText(status: ContractStatus): string {
     const statusMap: { [key: string]: string } = {
       'DRAFT': 'مسودة',
       'PENDING': 'في الانتظار',
       'SIGNED': 'موقع',
       'ACTIVE': 'نشط',
       'COMPLETED': 'مكتمل',
       'CANCELLED': 'ملغي',
       'EXPIRED': 'منتهي الصلاحية'
     };
     return statusMap[status] || status;
   }
}