import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFeedbackDto {
  applicationId: string;
  rating?: number;
  comments?: string;
  decision?: 'ACCEPT' | 'REJECT' | 'INTERVIEW' | 'PENDING';
}

export interface UpdateFeedbackDto {
  rating?: number;
  comments?: string;
  decision?: 'ACCEPT' | 'REJECT' | 'INTERVIEW' | 'PENDING';
}

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(userId: string, data: CreateFeedbackDto) {
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

    // Check permissions - only HR, ADMIN, or CLIENT can create feedback
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canCreateFeedback =
      user.role === 'HR' ||
      user.role === 'ADMIN' ||
      (user.role === 'CLIENT' && application.job.clientId === userId);

    if (!canCreateFeedback) {
      throw new ForbiddenException(
        'You do not have permission to create feedback for this application',
      );
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Create feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        applicationId: data.applicationId,
        rating: data.rating,
        comments: data.comments,
        decision: data.decision,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
        application: {
          include: {
            job: {
              select: { id: true, title: true },
            },
            applicant: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    // If decision is made, update application status and create timeline entry
    if (data.decision && data.decision !== 'PENDING') {
      let newStatus: string;
      switch (data.decision) {
        case 'ACCEPT':
          newStatus = 'OFFER';
          break;
        case 'REJECT':
          newStatus = 'REJECTED';
          break;
        case 'INTERVIEW':
          newStatus = 'INTERVIEW';
          break;
        default:
          newStatus = application.status;
      }

      if (newStatus !== application.status) {
        // Update application status
        await this.prisma.jobApplication.update({
          where: { id: data.applicationId },
          data: { status: newStatus as any },
        });

        // Create timeline entry
        await this.prisma.applicationTimeline.create({
          data: {
            applicationId: data.applicationId,
            status: newStatus as any,
            notes: `Status updated based on feedback: ${data.decision}`,
            createdBy: userId,
          },
        });
      }
    }

    return feedback;
  }

  async getFeedbackForApplication(applicationId: string, userId: string) {
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
      (user.role === 'CLIENT' && application.job.clientId === userId);

    if (!canView) {
      throw new ForbiddenException(
        'You do not have permission to view feedback for this application',
      );
    }

    return this.prisma.feedback.findMany({
      where: { applicationId },
      include: {
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFeedback(
    userId: string,
    feedbackId: string,
    data: UpdateFeedbackDto,
  ) {
    // Find the feedback
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        application: {
          include: {
            job: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check permissions - only the creator or admin can update
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canUpdate = user.role === 'ADMIN' || feedback.createdBy === userId;

    if (!canUpdate) {
      throw new ForbiddenException(
        'You do not have permission to update this feedback',
      );
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data,
      include: {
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  async deleteFeedback(userId: string, feedbackId: string) {
    // Find the feedback
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check permissions - only the creator or admin can delete
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canDelete = user.role === 'ADMIN' || feedback.createdBy === userId;

    if (!canDelete) {
      throw new ForbiddenException(
        'You do not have permission to delete this feedback',
      );
    }

    return this.prisma.feedback.delete({
      where: { id: feedbackId },
    });
  }

  async getMyFeedback(userId: string) {
    return this.prisma.feedback.findMany({
      where: { createdBy: userId },
      include: {
        application: {
          include: {
            job: {
              select: { id: true, title: true },
            },
            applicant: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeedbackStats() {
    const stats = await this.prisma.feedback.groupBy({
      by: ['decision'],
      _count: {
        decision: true,
      },
    });

    const avgRating = await this.prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        rating: {
          not: null,
        },
      },
    });

    return {
      decisionStats: stats,
      averageRating: avgRating._avg.rating,
    };
  }
}
