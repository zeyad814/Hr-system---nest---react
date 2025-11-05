import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateJobDto {
  title: string;                    // Job Title * (مطلوب)
  company: string;                  // Company * (مطلوب)
  location: string;                 // Location * (مطلوب)
  locationLink?: string;            // Location link (اختياري)
  jobType: string;                  // Job Type * (مطلوب)
  department?: string;              // Department
  description?: string;             // Job Description (اختياري)
  remoteWorkAvailable?: boolean;    // Remote work available
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
  description?: string;
  remoteWorkAvailable?: boolean;
  requirements?: string;
  requiredSkills?: string;
  salaryRange?: string;
  applicationDeadline?: Date;
  clientId?: string;
}

export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

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
        description: data.description,
        remoteWorkAvailable: data.remoteWorkAvailable || false,
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

    // Remove fields that don't exist in the Job model
    const { experienceLevel, ...validData } = data as any;

    return this.prisma.job.update({ where: { id }, data: validData });
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

  async applyToJob(jobId: string, userId: string) {
    await this.findOne(jobId);
    // Map the authenticated user to the Applicant record
    const applicant = await this.prisma.applicant.findUnique({ where: { userId } });
    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    // Optional: avoid duplicate applications
    const existing = await this.prisma.jobApplication.findFirst({
      where: { jobId, applicantId: applicant.id },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.jobApplication.create({
      data: { jobId, applicantId: applicant.id, status: 'PENDING' },
    });
  }

  async changeApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    console.log('=== UPDATE APPLICATION STATUS ===');
    console.log('Application ID:', applicationId);
    console.log('New Status (raw):', status);
    console.log('Status type:', typeof status);
    
    // Validate and normalize status
    const validStatuses: ApplicationStatus[] = ['PENDING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];
    const normalizedStatus = status.toUpperCase() as ApplicationStatus;
    
    if (!validStatuses.includes(normalizedStatus)) {
      console.error('❌ Invalid status:', status);
      throw new BadRequestException(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
    }
    
    console.log('Normalized Status:', normalizedStatus);
    
    try {
      // First, verify the application exists
      const existingApplication = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        select: { id: true, status: true, jobId: true, applicantId: true },
      });
      
      if (!existingApplication) {
        console.error('❌ Application not found:', applicationId);
        throw new NotFoundException(`Application with ID ${applicationId} not found`);
      }
      
      console.log('Current Status:', existingApplication.status);
      console.log('Updating to:', normalizedStatus);
      
      // Update the status
      const updated = await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: normalizedStatus },
      });
      
      console.log('✅ Status updated successfully');
      console.log('Updated Status:', updated.status);
      
      // Verify the update immediately with a fresh query
      // Use a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const verify = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        select: { 
          id: true, 
          status: true,
          updatedAt: true,
        },
      });
      
      if (verify?.status === normalizedStatus) {
        console.log('✅✅✅ Verified: Status saved correctly in database');
        console.log('Final Status:', verify.status);
        console.log('Updated At:', verify.updatedAt);
      } else {
        console.error('❌❌❌ Error: Status not saved correctly!');
        console.error('Expected:', normalizedStatus);
        console.error('Actual:', verify?.status);
        console.error('This might indicate a database transaction issue or caching problem');
      }
      
      // Return the updated application with all fields to ensure frontend receives correct data
      const finalApplication = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            select: { id: true, title: true, company: true },
          },
          applicant: {
            select: { 
              id: true,
              userId: true,
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
      
      console.log('📤 Returning updated application to frontend:', {
        id: finalApplication?.id,
        status: finalApplication?.status,
      });
      
      return finalApplication || updated;
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update application status: ${error.message}`);
    }
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
