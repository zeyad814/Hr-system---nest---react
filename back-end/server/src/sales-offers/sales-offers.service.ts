import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOfferDto, ApplicantSalesOfferResponseDto, SalesOfferReviewDto } from './dto/sales-offer.dto';

@Injectable()
export class SalesOffersService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء عرض Sales جديد
   */
  async create(userId: string, createDto: CreateSalesOfferDto) {
    // التحقق من وجود Application
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: createDto.applicationId },
      include: {
        job: true,
        applicant: {
          include: { user: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'OFFER') {
      throw new BadRequestException('Application status must be OFFER');
    }

    // إنشاء العرض
    const offer = await this.prisma.salesOffer.create({
      data: {
        applicationId: createDto.applicationId,
        applicantId: createDto.applicantId,
        jobId: createDto.jobId,
        createdBy: userId,
        value: createDto.value,
        currency: createDto.currency || 'SAR',
        notes: createDto.notes,
        status: 'PENDING',
      },
      include: {
        application: {
          include: {
            job: { select: { title: true, id: true } },
          },
        },
        applicant: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        job: { select: { title: true } },
        createdByUser: { select: { name: true, email: true } },
      },
    });

    return offer;
  }

  /**
   * الحصول على جميع عروض Sales
   */
  async findAll(userId?: string) {
    const where: any = {};
    if (userId) {
      where.createdBy = userId;
    }

    return this.prisma.salesOffer.findMany({
      where,
      include: {
        application: {
          include: {
            job: { select: { title: true, id: true } },
          },
        },
        applicant: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        job: { select: { title: true } },
        createdByUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * الحصول على عروض Sales للمتقدم
   */
  async findApplicantOffers(applicantId: string) {
    return this.prisma.salesOffer.findMany({
      where: { applicantId },
      include: {
        application: {
          include: {
            job: { select: { title: true, id: true } },
          },
        },
        job: { select: { title: true } },
        createdByUser: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * رد المتقدم على العرض
   */
  async applicantRespond(offerId: string, userId: string, responseDto: ApplicantSalesOfferResponseDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    const offer = await this.prisma.salesOffer.findUnique({
      where: { id: offerId },
      include: {
        application: {
          select: { id: true, status: true },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.applicantId !== applicant.id) {
      throw new BadRequestException('Not authorized to respond to this offer');
    }

    // applicationId مطلوب في schema، لذا يجب أن يكون موجوداً
    const applicationId = offer.applicationId;
    console.log(`📝 عرض ${offerId}:`);
    console.log(`   - applicationId = ${applicationId}`);
    console.log(`   - applicantResponse = ${responseDto.response}`);
    console.log(`   - application relation =`, offer.application);
    
    if (!applicationId) {
      console.error(`❌ خطأ: SalesOffer ${offerId} لا يحتوي على applicationId!`);
      throw new BadRequestException('SalesOffer missing applicationId');
    }

    const updateData: any = {
      applicantResponse: responseDto.response,
      status: responseDto.response === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
    };

    if (responseDto.response === 'REJECTED') {
      updateData.applicantRejectedAt = new Date();
      updateData.applicantRejectedNotes = responseDto.notes || null;
      updateData.salesResponse = 'PENDING'; // في انتظار مراجعة Sales
    }

    // استخدام transaction لضمان تحديث كل من SalesOffer و JobApplication
    const result = await this.prisma.$transaction(async (tx) => {
      // تحديث SalesOffer
      const updatedOffer = await tx.salesOffer.update({
        where: { id: offerId },
        data: updateData,
        include: {
          application: {
            include: {
              job: { select: { title: true, id: true } },
            },
          },
          applicant: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          job: { select: { title: true } },
          createdByUser: { select: { name: true, email: true } },
        },
      });

      // إذا قبل المتقدم العرض، تحديث حالة JobApplication إلى HIRED
      if (responseDto.response === 'ACCEPTED') {
        // applicationId مطلوب، يجب أن يكون موجوداً دائماً
        if (applicationId) {
          try {
            console.log(`🔄 محاولة تحديث JobApplication ${applicationId} إلى HIRED...`);
            // التحقق من وجود JobApplication أولاً
            const application = await tx.jobApplication.findUnique({
              where: { id: applicationId },
            });

            if (!application) {
              console.error(`❌ JobApplication ${applicationId} غير موجود!`);
              throw new NotFoundException(`JobApplication ${applicationId} not found`);
            } else {
              console.log(`📋 الحالة الحالية لـ JobApplication ${applicationId}: ${application.status}`);
              console.log(`🔄 جاري تحديث الحالة إلى "HIRED"...`);
              
              const updated = await tx.jobApplication.update({
                where: { id: applicationId },
                data: { status: 'HIRED' as any },
              });
              
              console.log(`✅ تم تحديث حالة JobApplication ${applicationId} بنجاح من "${application.status}" إلى "${updated.status}"`);
              
              // التحقق مرة أخرى للتأكد من قاعدة البيانات
              const verify = await tx.jobApplication.findUnique({
                where: { id: applicationId },
                select: { id: true, status: true },
              });
              
              if (verify?.status === 'HIRED') {
                console.log(`✅✅✅ تأكيد: JobApplication ${applicationId} حالته الآن = "HIRED" في قاعدة البيانات`);
              } else {
                console.error(`❌❌❌ خطأ: JobApplication ${applicationId} لم يتم تحديثه! الحالة الحالية = "${verify?.status}"`);
              }
            }
          } catch (error: any) {
            console.error(`❌ خطأ في تحديث حالة JobApplication ${applicationId}:`, error.message);
            console.error(`❌ Error details:`, error);
            throw error;
          }
        } else {
          console.error(`❌ خطأ: applicationId مفقود! offer.applicationId = ${offer.applicationId}`);
          throw new BadRequestException('SalesOffer missing applicationId');
        }
      }

      return updatedOffer;
    });

    return result;
  }

  /**
   * الحصول على طلبات الرفض في انتظار مراجعة Sales
   */
  async getPendingRejections(userId?: string) {
    const where: any = {
      applicantResponse: 'REJECTED',
      salesResponse: 'PENDING',
    };
    if (userId) {
      where.createdBy = userId;
    }

    return this.prisma.salesOffer.findMany({
      where,
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
        applicant: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        job: { select: { title: true } },
        createdByUser: { select: { name: true, email: true } },
      },
      orderBy: { applicantRejectedAt: 'desc' },
    });
  }

  /**
   * مراجعة Sales لطلب الرفض
   */
  async reviewRejection(offerId: string, userId: string, reviewDto: SalesOfferReviewDto) {
    const offer = await this.prisma.salesOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.createdBy !== userId) {
      throw new BadRequestException('Not authorized to review this offer');
    }

    if (offer.applicantResponse !== 'REJECTED' || offer.salesResponse !== 'PENDING') {
      throw new BadRequestException('This offer is not pending review');
    }

    const updateData: any = {
      salesResponse: reviewDto.response,
    };

    if (reviewDto.response === 'APPROVED') {
      // يمكن Sales إنشاء عرض جديد
      updateData.status = 'SALES_APPROVED';
    } else {
      updateData.salesRejectedAt = new Date();
      updateData.salesRejectedNotes = reviewDto.notes || null;
      updateData.status = 'SALES_REJECTED';
    }

    return this.prisma.salesOffer.update({
      where: { id: offerId },
      data: updateData,
      include: {
        application: {
          include: {
            job: { select: { title: true, id: true } },
          },
        },
        applicant: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        job: { select: { title: true } },
        createdByUser: { select: { name: true, email: true } },
      },
    });
  }
}

