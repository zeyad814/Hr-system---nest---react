import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateJobDto {
  title: string;                    // Job Title * (مطلوب)
  company: string;                  // Company * (مطلوب)
  location: string;                 // Location * (مطلوب)
  locationLink?: string;            // Location link (اختياري)
  jobType: string;                  // Job Type * (مطلوب)
  department?: string;              // Department
  experienceLevel?: string;         // Experience Level
  remoteWorkAvailable?: boolean;    // Remote work available
  description: string;              // Job Description * (مطلوب)
  requirements: string;             // Requirements * (مطلوب)
  requiredSkills?: string;          // Required Skills
  salaryRange: string;              // Salary Range * (مطلوب)
  applicationDeadline: Date;        // Application Deadline * (مطلوب)
  clientId: string;
}

export interface UpdateJobDto {
  title?: string;
  company?: string;
  location?: string;
  locationLink?: string;
  jobType?: string;
  department?: string;
  experienceLevel?: string;
  remoteWorkAvailable?: boolean;
  description?: string;
  requirements?: string;
  requiredSkills?: string;
  salaryRange?: string;
  applicationDeadline?: Date;
}

export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'REJECTED' | 'HIRED';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        locationLink: data.locationLink,
        jobType: data.jobType,
        department: data.department,
        experienceLevel: data.experienceLevel,
        remoteWorkAvailable: data.remoteWorkAvailable || false,
        description: data.description,
        requirements: data.requirements,
        requiredSkills: data.requiredSkills,
        salaryRange: data.salaryRange,
        applicationDeadline: data.applicationDeadline,
        clientId: data.clientId,
      },
    });
  }

  findAll(clientId?: string) {
    return this.prisma.job.findMany({
      where: clientId ? { clientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });
  }

  findAvailableJobs() {
    return this.prisma.job.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { 
        client: true,
        applications: {
          include: {
            applicant: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { applications: true }
        }
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, data: UpdateJobDto) {
    await this.findOne(id);
    return this.prisma.job.update({ where: { id }, data });
  }

  async changeStatus(id: string, status: 'OPEN' | 'CLOSED' | 'HIRED') {
    await this.findOne(id);
    return this.prisma.job.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.job.delete({ where: { id } });
  }

  listApplications(jobId: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyToJob(jobId: string, applicantId: string) {
    await this.findOne(jobId);
    return this.prisma.jobApplication.create({
      data: { jobId, applicantId, status: 'PENDING' },
    });
  }

  async changeApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  // Active Jobs APIs
  async getActiveJobs(clientId?: string) {
    return this.prisma.job.findMany({
      where: {
        status: 'OPEN',
        ...(clientId && { clientId }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }

  async getJobsWithTopCandidates(clientId?: string, limit: number = 5) {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: 'OPEN',
        ...(clientId && { clientId }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
        applications: {
          where: {
            status: { in: ['PENDING', 'INTERVIEW'] },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          include: {
            applicant: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return jobs.map(job => ({
      ...job,
      topCandidates: job.applications,
      applications: undefined, // Remove applications from response
    }));
  }

  async getJobStatistics(jobId: string) {
    const job = await this.findOne(jobId);
    
    const stats = await this.prisma.jobApplication.groupBy({
      by: ['status'],
      where: { jobId },
      _count: {
        status: true,
      },
    });

    const totalApplications = await this.prisma.jobApplication.count({
      where: { jobId },
    });

    return {
      job,
      totalApplications,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
