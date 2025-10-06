import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractQueryDto,
  ContractResponseDto,
  ContractStatsDto,
  ContractStatus,
  ContractType,
} from './dto/contract.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء عقد جديد
   */
  async create(
    createContractDto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    // التحقق من وجود العميل
    const client = await this.prisma.client.findUnique({
      where: { id: createContractDto.clientId },
    });

    if (!client) {
      throw new NotFoundException('العميل غير موجود');
    }

    const contract = await this.prisma.contract.create({
      data: {
        ...createContractDto,
        startDate: createContractDto.startDate
          ? new Date(createContractDto.startDate)
          : null,
        endDate: createContractDto.endDate
          ? new Date(createContractDto.endDate)
          : null,
        signedAt: createContractDto.signedAt
          ? new Date(createContractDto.signedAt)
          : null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.formatContractResponse(contract);
  }

  /**
   * الحصول على جميع العقود مع البحث والفلترة والترقيم
   */
  async findAll(query: ContractQueryDto) {
    const {
      search,
      status,
      type,
      currency,
      clientId,
      paymentStatus,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: Prisma.ContractWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (currency) {
      where.currency = currency;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // الحصول على العقود والعدد الإجمالي
    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: contracts.map((contract) => this.formatContractResponse(contract)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * الحصول على عقد واحد بالمعرف
   */
  async findOne(id: string): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    return this.formatContractResponse(contract);
  }

  /**
   * تحديث عقد
   */
  async update(
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    // التحقق من وجود العقد
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      throw new NotFoundException('العقد غير موجود');
    }

    const contract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...updateContractDto,
        startDate: updateContractDto.startDate
          ? new Date(updateContractDto.startDate)
          : undefined,
        endDate: updateContractDto.endDate
          ? new Date(updateContractDto.endDate)
          : undefined,
        signedAt: updateContractDto.signedAt
          ? new Date(updateContractDto.signedAt)
          : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.formatContractResponse(contract);
  }

  /**
   * حذف عقد
   */
  async remove(id: string): Promise<{ message: string }> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    await this.prisma.contract.delete({
      where: { id },
    });

    return { message: 'تم حذف العقد بنجاح' };
  }

  /**
   * تحديث حالة العقد
   */
  async updateStatus(
    id: string,
    status: ContractStatus,
  ): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.formatContractResponse(updatedContract);
  }

  /**
   * تحديث تقدم العقد
   */
  async updateProgress(
    id: string,
    progress: number,
  ): Promise<ContractResponseDto> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('نسبة التقدم يجب أن تكون بين 0 و 100');
    }

    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: { progress },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return this.formatContractResponse(updatedContract);
  }

  /**
   * الحصول على إحصائيات العقود
   */
  async getStats(): Promise<ContractStatsDto> {
    const [
      totalContracts,
      contractsByStatus,
      contractsByType,
      contractsByCurrency,
      valueStats,
    ] = await Promise.all([
      this.prisma.contract.count(),
      this.prisma.contract.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.contract.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.contract.groupBy({
        by: ['currency'],
        _count: { currency: true },
      }),
      this.prisma.contract.aggregate({
        _sum: {
          value: true,
          commission: true,
        },
      }),
    ]);

    const activeContracts =
      contractsByStatus.find((s) => s.status === ContractStatus.ACTIVE)?._count
        .status || 0;
    const completedContracts =
      contractsByStatus.find((s) => s.status === ContractStatus.COMPLETED)
        ?._count.status || 0;
    const pendingContracts =
      contractsByStatus.find((s) => s.status === ContractStatus.PENDING)?._count
        .status || 0;

    const statusCounts = Object.values(ContractStatus).reduce(
      (acc, status) => {
        acc[status] =
          contractsByStatus.find((s) => s.status === status)?._count.status ||
          0;
        return acc;
      },
      {} as Record<ContractStatus, number>,
    );

    const typeCounts = Object.values(ContractType).reduce(
      (acc, type) => {
        acc[type] =
          contractsByType.find((t) => t.type === type)?._count.type || 0;
        return acc;
      },
      {} as Record<ContractType, number>,
    );

    const currencyCounts = contractsByCurrency.reduce(
      (acc, curr) => {
        acc[curr.currency] = curr._count.currency;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      pendingContracts,
      totalValue: valueStats._sum.value || 0,
      totalCommission: valueStats._sum.commission || 0,
      contractsByStatus: statusCounts,
      contractsByType: typeCounts,
      contractsByCurrency: currencyCounts,
    };
  }

  /**
   * الحصول على عقود العميل
   */
  async getClientContracts(clientId: string, query: ContractQueryDto) {
    const clientExists = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!clientExists) {
      throw new NotFoundException('العميل غير موجود');
    }

    return this.findAll({ ...query, clientId });
  }

  /**
   * تنسيق استجابة العقد
   */
  private formatContractResponse(contract: any): ContractResponseDto {
    return {
      id: contract.id,
      clientId: contract.clientId,
      client: contract.client,
      title: contract.title,
      description: contract.description,
      type: contract.type,
      status: contract.status,
      value: contract.value,
      currency: contract.currency,
      startDate: contract.startDate,
      endDate: contract.endDate,
      signedAt: contract.signedAt,
      fileUrl: contract.fileUrl,
      commission: contract.commission,
      commissionType: contract.commissionType,
      assignedTo: contract.assignedTo,
      jobTitle: contract.jobTitle,
      progress: contract.progress,
      paymentStatus: contract.paymentStatus,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }
}
