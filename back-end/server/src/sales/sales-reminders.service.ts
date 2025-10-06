import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesReminderDto, UpdateSalesReminderDto, SalesReminderFilterDto } from './sales-reminders.dto';
import { SalesReminder, Prisma } from '@prisma/client';

@Injectable()
export class SalesRemindersService {
  constructor(private prisma: PrismaService) {}

  async create(createReminderDto: CreateSalesReminderDto, userId: string): Promise<SalesReminder> {
    const data: Prisma.SalesReminderCreateInput = {
      title: createReminderDto.title,
      description: createReminderDto.description,
      remindAt: new Date(createReminderDto.remindAt),
      type: createReminderDto.type,
      priority: createReminderDto.priority,
      creator: {
        connect: { id: userId }
      }
    };

    // Connect optional relations
    if (createReminderDto.clientId) {
      data.client = { connect: { id: createReminderDto.clientId } };
    }

    if (createReminderDto.contractId) {
      data.contract = { connect: { id: createReminderDto.contractId } };
    }

    if (createReminderDto.assignedTo) {
      data.assignedUser = { connect: { id: createReminderDto.assignedTo } };
    }

    return this.prisma.salesReminder.create({
      data,
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async findAll(filters: SalesReminderFilterDto, userId: string): Promise<SalesReminder[]> {
    const where: Prisma.SalesReminderWhereInput = {
      OR: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    };

    // Apply filters
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.contractId) {
      where.contractId = filters.contractId;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.completed !== undefined) {
      where.completed = filters.completed;
    }

    if (filters.startDate || filters.endDate) {
      where.remindAt = {};
      if (filters.startDate) {
        where.remindAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.remindAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.salesReminder.findMany({
      where,
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        remindAt: 'asc'
      }
    });
  }

  async findOne(id: string, userId: string): Promise<SalesReminder> {
    const reminder = await this.prisma.salesReminder.findUnique({
      where: { id },
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    // Check if user has access to this reminder
    if (reminder.createdBy !== userId && reminder.assignedTo !== userId) {
      throw new ForbiddenException('Access denied to this reminder');
    }

    return reminder;
  }

  async update(id: string, updateReminderDto: UpdateSalesReminderDto, userId: string): Promise<SalesReminder> {
    const reminder = await this.findOne(id, userId);

    const data: Prisma.SalesReminderUpdateInput = {};

    if (updateReminderDto.title !== undefined) {
      data.title = updateReminderDto.title;
    }

    if (updateReminderDto.description !== undefined) {
      data.description = updateReminderDto.description;
    }

    if (updateReminderDto.remindAt !== undefined) {
      data.remindAt = new Date(updateReminderDto.remindAt);
    }

    if (updateReminderDto.type !== undefined) {
      data.type = updateReminderDto.type;
    }

    if (updateReminderDto.priority !== undefined) {
      data.priority = updateReminderDto.priority;
    }

    if (updateReminderDto.completed !== undefined) {
      data.completed = updateReminderDto.completed;
    }

    if (updateReminderDto.clientId !== undefined) {
      data.client = updateReminderDto.clientId ? { connect: { id: updateReminderDto.clientId } } : { disconnect: true };
    }

    if (updateReminderDto.contractId !== undefined) {
      data.contract = updateReminderDto.contractId ? { connect: { id: updateReminderDto.contractId } } : { disconnect: true };
    }

    if (updateReminderDto.assignedTo !== undefined) {
      data.assignedUser = updateReminderDto.assignedTo ? { connect: { id: updateReminderDto.assignedTo } } : { disconnect: true };
    }

    return this.prisma.salesReminder.update({
      where: { id },
      data,
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId);

    // Only creator can delete the reminder
    if (reminder.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can delete this reminder');
    }

    await this.prisma.salesReminder.delete({
      where: { id }
    });
  }

  async getUpcomingReminders(userId: string, days: number = 7): Promise<SalesReminder[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.salesReminder.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { assignedTo: userId }
        ],
        completed: false,
        remindAt: {
          gte: new Date(),
          lte: endDate
        }
      },
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        remindAt: 'asc'
      }
    });
  }

  async markAsCompleted(id: string, userId: string): Promise<SalesReminder> {
    return this.update(id, { completed: true }, userId);
  }

  async getOverdueReminders(userId: string): Promise<SalesReminder[]> {
    return this.prisma.salesReminder.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { assignedTo: userId }
        ],
        completed: false,
        remindAt: {
          lt: new Date()
        }
      },
      include: {
        client: true,
        contract: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        remindAt: 'desc'
      }
    });
  }
}