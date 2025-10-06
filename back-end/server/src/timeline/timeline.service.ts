import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTimelineEntryDto {
  applicationId: string;
  status:
    | 'PENDING'
    | 'INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';
  notes?: string;
}

export interface UpdateApplicationStatusDto {
  status:
    | 'PENDING'
    | 'INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';
  notes?: string;
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async createTimelineEntry(userId: string, data: CreateTimelineEntryDto) {
    // Verify the application exists
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: data.applicationId },
      include: {
        job: {
          include: {
            client: true,
          },
        },
        applicant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check permissions - only HR, ADMIN, or the applicant can create timeline entries
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canUpdate =
      user.role === 'HR' ||
      user.role === 'ADMIN' ||
      (user.role === 'APPLICANT' &&
        application.applicant.userId === userId &&
        data.status === 'WITHDRAWN');

    if (!canUpdate) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    // Create timeline entry
    const timelineEntry = await this.prisma.applicationTimeline.create({
      data: {
        applicationId: data.applicationId,
        status: data.status,
        notes: data.notes,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Update application status
    await this.prisma.jobApplication.update({
      where: { id: data.applicationId },
      data: { status: data.status },
    });

    return timelineEntry;
  }

  async getApplicationTimeline(applicationId: string, userId: string) {
    // Verify the application exists and user has access
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          include: {
            user: true,
          },
        },
        job: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    const canView =
      user.role === 'HR' ||
      user.role === 'ADMIN' ||
      (user.role === 'APPLICANT' && application.applicant.userId === userId) ||
      (user.role === 'CLIENT' && application.job.client.id === userId);

    if (!canView) {
      throw new ForbiddenException(
        'You do not have permission to view this timeline',
      );
    }

    return this.prisma.applicationTimeline.findMany({
      where: { applicationId },
      include: {
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    data: UpdateApplicationStatusDto,
  ) {
    return this.createTimelineEntry(userId, {
      applicationId,
      status: data.status,
      notes: data.notes,
    });
  }

  async getApplicationsByStatus(status?: string) {
    const where = status ? { status: status as any } : {};

    return this.prisma.jobApplication.findMany({
      where,
      include: {
        applicant: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        job: {
          include: {
            client: {
              select: { id: true, name: true },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            createdByUser: {
              select: { name: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicantTimeline(userId: string) {
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
            client: {
              select: { id: true, name: true },
            },
          },
        },
        timeline: {
          include: {
            createdByUser: {
              select: { name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
