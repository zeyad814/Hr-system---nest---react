import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

export interface CandidateSearchFilters {
  search?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  jobId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateCandidateDto {
  userId: string;
  phone?: string;
  address?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  portfolio?: string;
  resumeUrl?: string;
}

export interface UpdateCandidateDto {
  phone?: string;
  address?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  portfolio?: string;
  resumeUrl?: string;
  rating?: number;
}

@Injectable()
export class AdminCandidatesService {
  constructor(private prisma: PrismaService) {}

  async getAllCandidates(
    page: number = 1,
    limit: number = 10,
    filters: CandidateSearchFilters = {},
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { skills: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.skills && filters.skills.length > 0) {
      where.skills = { contains: filters.skills[0], mode: 'insensitive' };
    }

    if (filters.experience) {
      where.experience = { contains: filters.experience, mode: 'insensitive' };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.jobId) {
      where.applications = {
        some: { jobId: filters.jobId.toString() },
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [candidates, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          applications: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return {
      candidates: candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.user.name,
        email: candidate.user.email,
        phone: candidate.phone,
        skills: candidate.skills
          ? candidate.skills.split(',').map((s) => s.trim())
          : [],
        experience: candidate.experience,
        location: candidate.location,
        resumeUrl: candidate.resumeUrl,
        rating: candidate.rating,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        applicationsCount: candidate.applications.length,
        recentApplications: candidate.applications
          .slice(0, 3)
          .map((app: any) => ({
            id: app.id,
            jobTitle: app.job.title,
            jobStatus: app.job.status,
            status: app.status,
            appliedAt: app.createdAt,
          })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCandidateStats() {
    const [total, newThisMonth] = await Promise.all([
      this.prisma.applicant.count(),
      this.prisma.applicant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Get popular skills
    const candidates = await this.prisma.applicant.findMany({
      select: { skills: true },
    });

    const skillsCount: { [key: string]: number } = {};
    candidates.forEach((candidate) => {
      if (candidate.skills) {
        const skillsArray = candidate.skills.split(',').map((s) => s.trim());
        skillsArray.forEach((skill) => {
          if (skill) {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          }
        });
      }
    });

    const popularSkills = Object.entries(skillsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    return {
      total,
      active: total,
      newThisMonth,
      popularSkills,
    };
  }

  async getCandidateById(id: string) {
    const candidate = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return {
      id: candidate.id,
      name: candidate.user.name,
      email: candidate.user.email,
      phone: candidate.phone,
      skills: candidate.skills
        ? candidate.skills.split(',').map((s) => s.trim())
        : [],
      experience: candidate.experience,
      location: candidate.location,
      resumeUrl: candidate.resumeUrl,
      rating: candidate.rating,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      applications: candidate.applications.map((app: any) => ({
        id: app.id,
        jobTitle: app.job.title,
        jobStatus: app.job.status,
        status: app.status,
        appliedAt: app.createdAt,
      })),
    };
  }

  async getCandidateApplications(candidateId: string) {
    const applications = await this.prisma.jobApplication.findMany({
      where: { applicantId: candidateId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      status: app.status,
      appliedAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
  }

  async getCandidateTimeline(candidateId: string) {
    const timeline = await this.prisma.applicationTimeline.findMany({
      where: {
        application: {
          applicantId: candidateId,
        },
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return timeline.map((item) => ({
      id: item.id,
      status: item.status,
      jobTitle: item.application.job.title,
      notes: item.notes,
      createdAt: item.createdAt,
    }));
  }

  async createCandidate(data: CreateCandidateDto) {
    return this.prisma.applicant.create({
      data,
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

  async updateCandidate(id: string, data: UpdateCandidateDto) {
    const candidate = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data,
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

  async deleteCandidate(id: string) {
    const candidate = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    await this.prisma.applicant.delete({
      where: { id },
    });

    return { message: 'Candidate deleted successfully' };
  }

  async addCandidateNote(
    candidateId: string,
    content: string,
    type: string = 'general',
  ) {
    // For now, we'll store notes in a simple way since the Note model might not exist
    // This would need to be implemented based on your actual Note model
    return {
      message:
        'Note functionality needs to be implemented based on your Note model',
    };
  }

  async addCandidateTag(candidateId: string, tag: string) {
    const candidate = await this.prisma.applicant.findUnique({
      where: { id: candidateId },
      select: { skills: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const currentSkills = candidate.skills
      ? candidate.skills.split(',').map((s) => s.trim())
      : [];
    if (!currentSkills.includes(tag)) {
      currentSkills.push(tag);
    }

    await this.prisma.applicant.update({
      where: { id: candidateId },
      data: { skills: currentSkills.join(', ') },
    });

    return { message: 'Tag added successfully' };
  }

  async removeCandidateTag(candidateId: string, tag: string) {
    const candidate = await this.prisma.applicant.findUnique({
      where: { id: candidateId },
      select: { skills: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const currentSkills = candidate.skills
      ? candidate.skills.split(',').map((s) => s.trim())
      : [];
    const updatedSkills = currentSkills.filter((skill) => skill !== tag);

    await this.prisma.applicant.update({
      where: { id: candidateId },
      data: { skills: updatedSkills.join(', ') },
    });

    return { message: 'Tag removed successfully' };
  }

  async bulkActions(candidateIds: string[], action: string, data?: any) {
    const candidates = await this.prisma.applicant.findMany({
      where: { id: { in: candidateIds } },
    });

    if (candidates.length === 0) {
      throw new NotFoundException('No candidates found');
    }

    switch (action) {
      case 'delete':
        await this.prisma.applicant.deleteMany({
          where: { id: { in: candidateIds } },
        });
        return {
          message: `${candidates.length} candidates deleted successfully`,
        };

      case 'addTag':
        if (!data?.tag) {
          throw new Error('Tag is required for addTag action');
        }

        for (const candidate of candidates) {
          const currentSkills = candidate.skills
            ? candidate.skills.split(',').map((s) => s.trim())
            : [];
          if (!currentSkills.includes(data.tag)) {
            currentSkills.push(data.tag);
            await this.prisma.applicant.update({
              where: { id: candidate.id },
              data: { skills: currentSkills.join(', ') },
            });
          }
        }
        return { message: `Tag added to ${candidates.length} candidates` };

      default:
        throw new Error('Invalid bulk action');
    }
  }

  async exportCandidates(filters: CandidateSearchFilters = {}) {
    const candidates = await this.getAllCandidates(1, 1000, filters);

    // Convert to CSV format
    const csvHeaders = [
      'Name',
      'Email',
      'Phone',
      'Skills',
      'Experience',
      'Location',
      'Applications Count',
    ];
    const csvData = candidates.candidates.map((candidate) => [
      candidate.name,
      candidate.email,
      candidate.phone || '',
      candidate.skills.join('; '),
      candidate.experience || '',
      candidate.location || '',
      candidate.applicationsCount.toString(),
    ]);

    return {
      headers: csvHeaders,
      data: csvData,
      filename: `candidates_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
  }
}