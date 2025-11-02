import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { AgoraService } from '../agora/agora.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  ApplicantInterviewResponseDto,
  HRInterviewReviewDto,
} from './dto/interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    // private agoraService: AgoraService
  ) {}

  // Schedule a new interview
  async scheduleInterview(userId: string, data: CreateInterviewDto) {
    // Verify application exists
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: data.applicationId },
      include: {
        applicant: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        job: {
          include: {
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Generate Agora channel info for VIDEO interviews
    let agoraChannelName: string | undefined;
    let agoraAppId: string | undefined;
    
    // if (data.type === 'VIDEO' && this.agoraService.isConfigured()) {
    //   agoraChannelName = this.agoraService.generateChannelName(data.applicationId);
    //   const agoraConfig = this.agoraService.getAgoraConfig();
    //   agoraAppId = agoraConfig.appId;
    // }

    // Create interview
    const interview = await this.prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        scheduledBy: userId,
        candidateId: application.applicantId,
        title: data.title,
        description: data.description,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 60,
        location: data.location,
        notes: data.notes,
        interviewerIds: data.interviewerIds || [userId],
        // Agora fields for video interviews
        agoraChannelName,
        agoraAppId,
      },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { name: true, role: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Update application status to INTERVIEW if not already
    if (application.status !== 'INTERVIEW') {
      await this.prisma.jobApplication.update({
        where: { id: data.applicationId },
        data: { status: 'INTERVIEW' },
      });

      // Create timeline entry
      await this.prisma.applicationTimeline.create({
        data: {
          applicationId: data.applicationId,
          status: 'INTERVIEW',
          notes: `Interview scheduled: ${data.title}`,
          createdBy: userId,
        },
      });
    }

    return interview;
  }

  // Get all interviews with filters
  async getInterviews(filters?: {
    status?: string;
    type?: string;
    scheduledBy?: string;
    candidateId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.scheduledBy) {
      where.scheduledBy = filters.scheduledBy;
    }
    if (filters?.candidateId) {
      where.candidateId = filters.candidateId;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.scheduledAt = {};
      if (filters.dateFrom) {
        where.scheduledAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.scheduledAt.lte = new Date(filters.dateTo);
      }
    }

    return this.prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            applicant: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { id: true, name: true, role: true } },
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Get interview by ID
  async getInterviewById(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: {
              include: {
                client: { select: { id: true, name: true } },
              },
            },
            applicant: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { id: true, name: true, role: true } },
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  // Update interview details
  async updateInterview(id: string, userId: string, data: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check if user has permission to update (scheduled by user or admin/hr)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      interview.scheduledBy !== userId &&
      (!user || !['ADMIN', 'HR'].includes(user.role))
    ) {
      throw new BadRequestException('Not authorized to update this interview');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        duration: data.duration,
        location: data.location,
        notes: data.notes,
        ...(data.interviewerIds && { interviewerIds: data.interviewerIds }),
      },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { name: true, role: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  // Update interview status (attendance, cancellation, etc.)
  async updateInterviewStatus(
    id: string,
    userId: string,
    data: UpdateInterviewStatusDto,
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const updatedInterview = await this.prisma.interview.update({
      where: { id },
      data: {
        status: data.status,
        attendanceNotes: data.attendanceNotes,
        report: data.report,
      },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { name: true, role: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Create timeline entry for status change
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: interview.applicationId,
        status: interview.application.status,
        notes: `Interview ${data.status.toLowerCase()}: ${data.attendanceNotes || 'Status updated'}`,
        createdBy: userId,
      },
    });

    return updatedInterview;
  }

  // Get interviews for a specific candidate
  async getCandidateInterviews(candidateId: string) {
    return this.prisma.interview.findMany({
      where: { candidateId },
      include: {
        application: {
          include: {
            job: {
              include: {
                client: { select: { name: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { name: true, role: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  // Get upcoming interviews (for reminders)
  async getUpcomingInterviews(hoursAhead: number = 24): Promise<any[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return this.prisma.interview.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: futureTime,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        reminderSent: false,
      },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        scheduledByUser: { select: { name: true, email: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  // Mark reminder as sent
  async markReminderSent(id: string) {
    return this.prisma.interview.update({
      where: { id },
      data: {
        reminderSent: true,
        reminderSentAt: new Date(),
      },
    });
  }

  // Delete interview
  async deleteInterview(id: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check if user has permission to delete
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      interview.scheduledBy !== userId &&
      (!user || !['ADMIN', 'HR'].includes(user.role))
    ) {
      throw new BadRequestException('Not authorized to delete this interview');
    }

    await this.prisma.interview.delete({
      where: { id },
    });

    // Create timeline entry
    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: interview.applicationId,
        status: 'PENDING', // Reset to pending or keep current status
        notes: `Interview cancelled: ${interview.title}`,
        createdBy: userId,
      },
    });

    return { message: 'Interview deleted successfully' };
  }

  // Agora Integration Methods - DISABLED
  
  /**
   * Generate Agora token for interview participant
   */
  async generateAgoraToken(interviewId: string, userId: string, role: 'interviewer' | 'candidate') {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        type: true,
        agoraChannelName: true,
        agoraAppId: true,
        candidateId: true,
        interviewerIds: true,
        scheduledBy: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.type !== 'VIDEO') {
      throw new BadRequestException('This interview is not a video interview');
    }

    if (!interview.agoraChannelName) {
      throw new BadRequestException('Video interview not properly configured');
    }

    // Verify user has permission to join
    const isCandidate = interview.candidateId === userId;
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    
    if (!isCandidate && !isInterviewer) {
      throw new BadRequestException('You are not authorized to join this interview');
    }

    // try {
    //   const tokenResponse = this.agoraService.generateInterviewToken(
    //     interviewId,
    //     userId,
    //     role
    //   );

    //   // Update interview with token info
    //   await this.prisma.interview.update({
    //     where: { id: interviewId },
    //     data: {
    //       agoraToken: tokenResponse.token
    //     }
    //   });

    //   return tokenResponse;
    // } catch (error) {
    //   throw new BadRequestException('Failed to generate video call token');
    // }
    throw new BadRequestException('Agora integration is disabled');
  }

  /**
   * Start recording for an interview
   */
  async startRecording(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        type: true,
        agoraChannelName: true,
        isRecording: true,
        interviewerIds: true,
        scheduledBy: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.type !== 'VIDEO') {
      throw new BadRequestException('This interview is not a video interview');
    }

    // Only interviewers can start recording
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    if (!isInterviewer) {
      throw new BadRequestException('Only interviewers can start recording');
    }

    if (interview.isRecording) {
      throw new BadRequestException('Recording is already in progress');
    }

    // try {
    //   const uid = this.agoraService['generateUid'](userId);
    //   const recordingId = await this.agoraService.startRecording(interview.agoraChannelName!, uid);

    //   await this.prisma.interview.update({
    //     where: { id: interviewId },
    //     data: {
    //       isRecording: true,
    //       recordingId,
    //       recordingStartedAt: new Date()
    //     }
    //   });

    //   return { recordingId, message: 'Recording started successfully' };
    // } catch (error) {
    //   throw new BadRequestException('Failed to start recording');
    // }
    throw new BadRequestException('Agora integration is disabled');
  }

  /**
   * Stop recording for an interview
   */
  async stopRecording(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        type: true,
        isRecording: true,
        recordingId: true,
        interviewerIds: true,
        scheduledBy: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (!interview.isRecording || !interview.recordingId) {
      throw new BadRequestException('No active recording found');
    }

    // Only interviewers can stop recording
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    if (!isInterviewer) {
      throw new BadRequestException('Only interviewers can stop recording');
    }

    // try {
    //   const recordingUrl = await this.agoraService.stopRecording(interview.recordingId);

    //   await this.prisma.interview.update({
    //     where: { id: interviewId },
    //     data: {
    //       isRecording: false,
    //       recordingUrl,
    //       recordingEndedAt: new Date()
    //     }
    //   });

    //   return { recordingUrl, message: 'Recording stopped successfully' };
    // } catch (error) {
    //   throw new BadRequestException('Failed to stop recording');
    // }
    throw new BadRequestException('Agora integration is disabled');
  }

  /**
   * Get interview with Agora details
   */
  async getInterviewWithAgoraDetails(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            job: { select: { title: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        scheduledByUser: { select: { name: true, role: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check if user has access to this interview
    const isCandidate = interview.candidateId === userId;
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    
    if (!isCandidate && !isInterviewer) {
      throw new BadRequestException('You are not authorized to access this interview');
    }

    return interview;
  }

  /**
   * Get interviews for current user (applicant)
   */
  async getMyInterviews(userId: string) {
    // Get applicant ID from user
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId: userId },
    });

    if (!applicant) {
      return [];
    }

    return this.getCandidateInterviews(applicant.id);
  }

  /**
   * Join video interview - generate token and return channel info
   */
  async joinVideoInterview(interviewId: string, userId: string, role?: 'interviewer' | 'candidate') {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        type: true,
        agoraChannelName: true,
        agoraAppId: true,
        candidateId: true,
        interviewerIds: true,
        scheduledBy: true,
        status: true,
        scheduledAt: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.type !== 'VIDEO') {
      throw new BadRequestException('This interview is not a video interview');
    }

    if (!interview.agoraChannelName) {
      throw new BadRequestException('Video interview not properly configured');
    }

    // Verify user has permission to join
    const isCandidate = interview.candidateId === userId;
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    
    if (!isCandidate && !isInterviewer) {
      throw new BadRequestException('You are not authorized to join this interview');
    }

    // Determine role if not provided
    if (!role) {
      role = isCandidate ? 'candidate' : 'interviewer';
    }

    // try {
    //   const tokenResponse = this.agoraService.generateInterviewToken(
    //     interviewId,
    //     userId,
    //     role
    //   );

    //   // Update interview status to CONFIRMED if it was SCHEDULED
    //   if (interview.status === 'SCHEDULED') {
    //     await this.prisma.interview.update({
    //       where: { id: interviewId },
    //       data: {
    //         status: 'CONFIRMED'
    //       }
    //     });
    //   }

    //   return {
    //     ...tokenResponse,
    //     channelName: interview.agoraChannelName,
    //     role: role,
    //     interviewId: interviewId
    //   };
    // } catch (error) {
    //   throw new BadRequestException('Failed to join video interview');
    // }
    throw new BadRequestException('Agora integration is disabled');
  }

  /**
   * Leave video interview
   */
  async leaveVideoInterview(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        candidateId: true,
        interviewerIds: true,
        scheduledBy: true,
        status: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Verify user has permission
    const isCandidate = interview.candidateId === userId;
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    
    if (!isCandidate && !isInterviewer) {
      throw new BadRequestException('You are not authorized to leave this interview');
    }

    // Update interview status to ATTENDED if it was CONFIRMED
    if (interview.status === 'CONFIRMED') {
      await this.prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: 'ATTENDED'
        }
      });
    }

    return { message: 'Successfully left the interview' };
  }

  /**
   * Send interview reminder
   */
  async sendInterviewReminder(interviewId: string) {
    const interview = await this.getInterviewById(interviewId);
    
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Mark reminder as sent
    await this.markReminderSent(interviewId);

    // Here you would integrate with your notification service
    // For now, just return success
    return { message: 'Interview reminder sent successfully' };
  }

  /**
   * Refresh Agora token
   */
  async refreshAgoraToken(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        id: true,
        type: true,
        agoraChannelName: true,
        candidateId: true,
        interviewerIds: true,
        scheduledBy: true
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.type !== 'VIDEO') {
      throw new BadRequestException('This interview is not a video interview');
    }

    // Verify user has permission
    const isCandidate = interview.candidateId === userId;
    const isInterviewer = interview.interviewerIds.includes(userId) || interview.scheduledBy === userId;
    
    if (!isCandidate && !isInterviewer) {
      throw new BadRequestException('You are not authorized to refresh token for this interview');
    }

    const role = isCandidate ? 'candidate' : 'interviewer';

    // try {
    //   const tokenResponse = this.agoraService.generateInterviewToken(
    //     interviewId,
    //     userId,
    //     role
    //   );

    //   // Update interview with new token
    //   await this.prisma.interview.update({
    //     where: { id: interviewId },
    //     data: {
    //       agoraToken: tokenResponse.token
    //     }
    //   });

    //   return tokenResponse;
    // } catch (error) {
    //   throw new BadRequestException('Failed to refresh video call token');
    // }
    throw new BadRequestException('Agora integration is disabled');
  }

  /**
   * ردّ المتقدم على المقابلة (قبول/رفض)
   */
  async applicantRespondToInterview(
    interviewId: string,
    userId: string,
    responseDto: ApplicantInterviewResponseDto,
  ) {
    // الحصول على المتقدم المرتبط بالمستخدم
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant profile not found');
    }

    // الحصول على المقابلة
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
        candidate: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.candidateId !== applicant.id) {
      throw new BadRequestException('Not authorized to respond to this interview');
    }

    // تحديث المقابلة برأي المتقدم
    const updateData: any = {
      applicantResponse: responseDto.response,
    };

    if (responseDto.response === 'REJECTED') {
      updateData.applicantRejectedDate = new Date();
      updateData.applicantRejectedNotes = responseDto.notes || null;
      if (responseDto.suggestedDate) {
        try {
          const suggestedDateObj = new Date(responseDto.suggestedDate);
          if (isNaN(suggestedDateObj.getTime())) {
            throw new BadRequestException('Invalid suggested date format');
          }
          updateData.applicantSuggestedDate = suggestedDateObj;
        } catch (error) {
          throw new BadRequestException('Invalid suggested date format');
        }
      }
      updateData.hrResponse = 'PENDING'; // في انتظار مراجعة HR
    } else if (responseDto.response === 'ACCEPTED') {
      updateData.hrResponse = 'APPROVED'; // إذا قبل، يعتبر موافق عليه
    }

    try {
      return await this.prisma.interview.update({
        where: { id: interviewId },
        data: updateData,
        include: {
          application: {
            include: {
              job: { select: { title: true } },
            },
          },
          candidate: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating interview:', error);
      throw new BadRequestException(`Failed to update interview: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * الحصول على طلبات المقابلات في انتظار مراجعة HR
   */
  async getPendingInterviewRequests() {
    return this.prisma.interview.findMany({
      where: {
        applicantResponse: 'REJECTED',
        hrResponse: 'PENDING',
      },
      include: {
        application: {
          include: {
            job: { select: { title: true, id: true } },
            applicant: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        scheduledByUser: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * مراجعة HR لطلب رفض المقابلة من المتقدم
   */
  async hrReviewInterviewRequest(
    interviewId: string,
    userId: string,
    reviewDto: HRInterviewReviewDto,
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.applicantResponse !== 'REJECTED' || interview.hrResponse !== 'PENDING') {
      throw new BadRequestException('This interview request is not pending HR review');
    }

    const updateData: any = {
      hrResponse: reviewDto.response === 'APPROVED' ? 'APPROVED' : 'REJECTED',
    };

    if (reviewDto.response === 'APPROVED') {
      // إذا وافق HR على ميعاد جديد مقترح من المتقدم، أو اقترح HR ميعاد جديد
      const newDate = reviewDto.suggestedDate
        ? new Date(reviewDto.suggestedDate)
        : interview.applicantSuggestedDate
        ? new Date(interview.applicantSuggestedDate)
        : null;

      if (newDate) {
        // تحديث موعد المقابلة
        updateData.scheduledAt = newDate;
        updateData.status = 'RESCHEDULED';
        updateData.hrSuggestedDate = newDate;
      } else {
        // إذا لم يكن هناك ميعاد مقترح، نحتفظ بالموعد الأصلي
        updateData.status = 'SCHEDULED';
      }
      updateData.hrResponse = 'APPROVED';
      updateData.applicantResponse = 'ACCEPTED'; // بعد موافقة HR، يعتبر متقبل
    } else {
      // إذا رفض HR
      updateData.hrRejectedAt = new Date();
      updateData.hrRejectedNotes = reviewDto.notes || null;
      if (reviewDto.suggestedDate) {
        updateData.hrSuggestedDate = new Date(reviewDto.suggestedDate);
      }
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
      include: {
        application: {
          include: {
            job: { select: { title: true } },
          },
        },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }
}
