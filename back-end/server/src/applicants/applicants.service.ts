import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateApplicantDto {
  userId: string;
  phone?: string;
  address?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  portfolio?: string;
  avatar?: string;
  resumeUrl?: string;
  dateOfBirth?: Date;
  nationality?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  languages?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  coverLetter?: string;
  expectedSalary?: string;
  availableFrom?: Date;
  workType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
}

export interface UpdateApplicantDto {
  phone?: string;
  address?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  portfolio?: string;
  avatar?: string;
  resumeUrl?: string;
  dateOfBirth?: Date;
  nationality?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  languages?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  coverLetter?: string;
  expectedSalary?: string;
  availableFrom?: Date;
  workType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
}

export interface UpdateApplicantStatusDto {
  status: string;
  notes?: string;
}

export interface UpdateApplicantRatingDto {
  rating: number;
}

export interface ApplyToJobDto {
  jobId: string;
  resumeUrl?: string;
}

export interface CreateExperienceDto {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
  achievements?: string;
}

export interface UpdateExperienceDto {
  title?: string;
  company?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
  achievements?: string;
}

export interface CreateEducationDto {
  degree: string;
  institution: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  gpa?: string;
  description?: string;
}

export interface UpdateEducationDto {
  degree?: string;
  institution?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  gpa?: string;
  description?: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  technologies?: string[];
  url?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  technologies?: string[];
  url?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
}

export interface CreateQualificationDto {
  title: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
  description?: string;
}

export interface UpdateQualificationDto {
  title?: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
  description?: string;
}

@Injectable()
export class ApplicantsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: CreateApplicantDto) {
    // Check if applicant profile already exists
    const existing = await this.prisma.applicant.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      throw new BadRequestException('Applicant profile already exists');
    }

    return this.prisma.applicant.create({
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async getProfile(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
          user: { select: { id: true, email: true, name: true } },
          experiences: {
             orderBy: { startDate: 'desc' },
           },
           educations: {
             orderBy: { startDate: 'desc' },
           },
           projects: {
             orderBy: { startDate: 'desc' },
           },
           qualifications: {
             orderBy: { issueDate: 'desc' },
           },
          applications: {
          include: {
            job: {
              include: {
                client: { select: { id: true, name: true } },
              },
            },
            timeline: {
              orderBy: { createdAt: 'desc' },
              include: {
                createdByUser: { select: { name: true, role: true } },
              },
            },
            feedback: {
              orderBy: { createdAt: 'desc' },
              include: {
                createdByUser: { select: { name: true, role: true } },
              },
            },
          },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return applicant;
  }

  async getProfileById(applicantId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
          user: { select: { id: true, email: true, name: true } },
          experiences: {
             orderBy: { startDate: 'desc' },
           },
           educations: {
             orderBy: { startDate: 'desc' },
           },
           projects: {
             orderBy: { startDate: 'desc' },
           },
           qualifications: {
             orderBy: { issueDate: 'desc' },
           },
          applications: {
          include: {
            job: {
              include: {
                client: { select: { id: true, name: true } },
              },
            },
            timeline: {
              orderBy: { createdAt: 'desc' },
              include: {
                createdByUser: { select: { name: true, role: true } },
              },
            },
            feedback: {
              orderBy: { createdAt: 'desc' },
              include: {
                createdByUser: { select: { name: true, role: true } },
              },
            },
          },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return applicant;
  }

  async updateProfile(userId: string, data: UpdateApplicantDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return this.prisma.applicant.update({
      where: { userId },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async applyToJob(userId: string, data: ApplyToJobDto) {
    // Check if applicant exists
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException(
        'Applicant profile not found. Please create your profile first.',
      );
    }

    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already applied
    const existingApplication = await this.prisma.jobApplication.findFirst({
      where: {
        jobId: data.jobId,
        applicantId: applicant.id,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    // Create application
    const application = await this.prisma.jobApplication.create({
      data: {
        jobId: data.jobId,
        applicantId: applicant.id,
        resumeUrl: data.resumeUrl,
        status: 'PENDING',
      },
      include: {
        job: {
          include: {
            client: { select: { id: true, name: true } },
          },
        },
        applicant: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    // Create initial timeline entry
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        status: 'PENDING',
        notes: 'Application submitted',
        createdBy: userId,
      },
    });

    return application;
  }

  async getMyApplications(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    return this.prisma.jobApplication.findMany({
      where: { applicantId: applicant.id },
      include: {
        job: {
          include: {
            client: { select: { id: true, name: true } },
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest status
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        applicantId: applicant.id,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === 'WITHDRAWN') {
      throw new BadRequestException('Application is already withdrawn');
    }

    if (application.status === 'HIRED') {
      throw new BadRequestException('Cannot withdraw a hired application');
    }

    // Update application status
    const updatedApplication = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
      include: {
        job: {
          include: {
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Add timeline entry
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: applicationId,
        status: 'WITHDRAWN',
        notes: 'Application withdrawn by applicant',
        createdBy: userId,
      },
    });

    return updatedApplication;
  }

  async getAllApplicants(status?: string, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { skills: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.applications = {
        some: {
          status: status,
        },
      };
    }

    return this.prisma.applicant.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true, createdAt: true },
        },
        applications: {
          include: {
            job: {
              select: { id: true, title: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicantStatus(userId: string, data: UpdateApplicantStatusDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: { applications: true },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    // Update the latest application status
    if (applicant.applications.length > 0) {
       const latestApplication =
         applicant.applications[applicant.applications.length - 1];
      await this.prisma.jobApplication.update({
        where: { id: latestApplication.id },
        data: { status: data.status as any },
      });
    }

    return this.getProfile(userId);
  }

  async updateApplicantRating(userId: string, data: UpdateApplicantRatingDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { userId },
      data: { rating: data.rating },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async getApplicantsStats() {
    const totalApplicants = await this.prisma.applicant.count();
    const totalApplications = await this.prisma.jobApplication.count();

    const statusCounts = await this.prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const recentApplicants = await this.prisma.applicant.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalApplicants,
      totalApplications,
      recentApplicants,
      statusBreakdown: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  // Experience methods
  async addExperience(userId: string, data: CreateExperienceDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.experience.create({
      data: {
        ...data,
        applicantId: applicant.id,
      },
    });
  }

  async updateExperience(userId: string, experienceId: string, data: UpdateExperienceDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.experience.update({
      where: {
        id: experienceId,
        applicantId: applicant.id,
      },
      data,
    });
  }

  async deleteExperience(userId: string, experienceId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.experience.delete({
      where: {
        id: experienceId,
        applicantId: applicant.id,
      },
    });
  }

  // Education methods
  async addEducation(userId: string, data: CreateEducationDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.education.create({
      data: {
        ...data,
        applicantId: applicant.id,
      },
    });
  }

  async updateEducation(userId: string, educationId: string, data: UpdateEducationDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.education.update({
      where: {
        id: educationId,
        applicantId: applicant.id,
      },
      data,
    });
  }

  async deleteEducation(userId: string, educationId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.education.delete({
      where: {
        id: educationId,
        applicantId: applicant.id,
      },
    });
  }

  // Project methods
  async addProject(userId: string, data: CreateProjectDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.project.create({
      data: {
        ...data,
        applicantId: applicant.id,
      },
    });
  }

  async updateProject(userId: string, projectId: string, data: UpdateProjectDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
        applicantId: applicant.id,
      },
      data,
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.project.delete({
      where: {
        id: projectId,
        applicantId: applicant.id,
      },
    });
  }

  // Qualification methods
  async addQualification(userId: string, data: CreateQualificationDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.qualification.create({
      data: {
        ...data,
        applicantId: applicant.id,
      },
    });
  }

  async updateQualification(userId: string, qualificationId: string, data: UpdateQualificationDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.qualification.update({
      where: {
        id: qualificationId,
        applicantId: applicant.id,
      },
      data,
    });
  }

  async deleteQualification(userId: string, qualificationId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.qualification.delete({
      where: {
        id: qualificationId,
        applicantId: applicant.id,
      },
    });
  }

  // GET methods for experiences, educations, projects, and qualifications
  async getExperiences(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.experience.findMany({
      where: { applicantId: applicant.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async getEducations(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.education.findMany({
      where: { applicantId: applicant.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async getProjects(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.project.findMany({
      where: { applicantId: applicant.id },
      orderBy: { startDate: 'desc' },
    });
  }

  async getQualifications(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.qualification.findMany({
      where: { applicantId: applicant.id },
      orderBy: { issueDate: 'desc' },
    });
  }

  async recommendApplicant(applicantId: string, clientId: string, notes?: string) {
    // Check if applicant exists
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Create recommendation record (you might need to create this table in your schema)
    // For now, we'll return a success message
    return {
      success: true,
      message: 'Applicant recommended to client successfully',
      applicant: {
        id: applicant.id,
        name: applicant.user.name,
        email: applicant.user.email,
      },
      clientId,
      notes,
      recommendedAt: new Date(),
    };
  }

  // Top Candidates APIs
  async getTopCandidates(limit: number = 10, jobId?: string) {
    const whereCondition: any = {
      status: { in: ['PENDING', 'INTERVIEW'] },
    };

    if (jobId) {
      whereCondition.jobId = jobId;
    }

    const topApplications = await this.prisma.jobApplication.findMany({
      where: whereCondition,
      orderBy: [
        { createdAt: 'desc' },
        { status: 'asc' }, // INTERVIEW status first
      ],
      take: limit,
      include: {
        applicant: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            experiences: {
              orderBy: { startDate: 'desc' },
              take: 2,
            },
            educations: {
              orderBy: { startDate: 'desc' },
              take: 2,
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salaryRange: true,
          },
        },
      },
    });

    return topApplications.map(app => ({
      applicationId: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      candidate: {
        id: app.applicant.id,
        name: app.applicant.user.name,
        email: app.applicant.user.email,
        phone: app.applicant.phone,
        location: app.applicant.location,
        skills: app.applicant.skills,
        experience: app.applicant.experience,
        rating: app.applicant.rating,
        avatar: app.applicant.avatar,
        resumeUrl: app.applicant.resumeUrl,
        recentExperiences: app.applicant.experiences,
        recentEducations: app.applicant.educations,
      },
      job: app.job,
    }));
  }

  async getCandidatesByRating(minRating: number = 4, limit: number = 10) {
    return this.prisma.applicant.findMany({
      where: {
        rating: { gte: minRating },
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
          take: 2,
        },
        educations: {
          orderBy: { startDate: 'desc' },
          take: 2,
        },
        applications: {
          where: {
            status: { in: ['PENDING', 'INTERVIEW'] },
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });
  }

  async getRecentCandidates(days: number = 7, limit: number = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.prisma.applicant.findMany({
      where: {
        createdAt: { gte: dateThreshold },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getCandidatesForJob(jobId: string, status?: string, limit: number = 10) {
    const candidateLimit = Math.min(limit, 100);
    
    // Validate status if provided
    const validStatuses = ['PENDING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];
    if (status && !validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const whereClause: any = {
      applications: {
        some: {
          jobId: jobId,
          ...(status && { status: status as any }),
        },
      },
    };

    return this.prisma.applicant.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          where: {
            jobId: jobId,
            ...(status && { status: status as any }),
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      take: candidateLimit,
      orderBy: {
        rating: 'desc',
      },
    });
  }

  async updateResumeUrl(userId: string, resumeUrl: string) {
    // Check if applicant exists
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    // Update the resume URL
    return this.prisma.applicant.update({
      where: { userId },
      data: { resumeUrl },
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
  }
}
