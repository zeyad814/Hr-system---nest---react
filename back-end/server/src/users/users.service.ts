import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UpdateUserStatusDto,
  UserResponseDto,
  UserStatsResponseDto,
  PaginatedUsersResponseDto,
  UserRole,
  UserStatus,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: (data.role ?? UserRole.APPLICANT) as any,
        status: 'ACTIVE',
        department: data.department,
        position: data.position,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user as UserResponseDto;
  }

  async findAll(query?: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const {
      search,
      role,
      status,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query || {};

    const skip = (page - 1) * limit;
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Department filter
    if (department) {
      where.department = department;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          department: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users as UserResponseDto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user as UserResponseDto;
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (existingUser) {
        throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    const updateData: any = {
      name: data.name,
      department: data.department,
      position: data.position,
      status: data.status,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.role) {
      updateData.role = data.role as any;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user as UserResponseDto;
  }

  async updateStatus(
    id: string,
    data: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: data.status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user as UserResponseDto;
  }

  async updateProfile(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (existingUser) {
        throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    const updateData: any = {
      name: data.name,
      department: data.department,
      position: data.position,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      avatar: data.avatar,
      target: data.target,
      achieved: data.achieved,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        position: true,
        phone: true,
        location: true,
        bio: true,
        avatar: true,
        target: true,
        achieved: true,
        joinDate: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user as UserResponseDto;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'تم حذف المستخدم بنجاح' };
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      usersByRole,
      usersByDepartment,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'INACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.prisma.user.groupBy({
        by: ['department'],
        _count: { department: true },
        where: { department: { not: null } },
      }),
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          department: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const roleStats = Object.values(UserRole).reduce(
      (acc, role) => {
        acc[role] = usersByRole.find((r) => r.role === role)?._count.role || 0;
        return acc;
      },
      {} as { [key in UserRole]: number },
    );

    const departmentStats = usersByDepartment.map((d) => ({
      department: d.department || 'غير محدد',
      count: d._count.department,
    }));

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      usersByRole: roleStats,
      usersByDepartment: departmentStats,
      recentUsers: recentUsers as UserResponseDto[],
    };
  }

  async getDepartments(): Promise<string[]> {
    const departments = await this.prisma.user.findMany({
      select: { department: true },
      where: { department: { not: null } },
      distinct: ['department'],
    });

    return departments.map((d) => d.department).filter(Boolean) as string[];
  }
}
