import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  CLIENT = 'CLIENT',
  APPLICANT = 'APPLICANT',
  SALES = 'SALES',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'يجب أن يكون البريد الإلكتروني صحيحاً' })
  email: string;

  @IsString({ message: 'الاسم مطلوب' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'دور المستخدم غير صحيح' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'الاسم مطلوب' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'دور المستخدم غير صحيح' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'حالة المستخدم غير صحيحة' })
  status?: UserStatus;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  @IsString()
  achieved?: string;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 1 : parsed;
  })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 10 : parsed;
  })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'حالة المستخدم غير صحيحة' })
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  position?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  target?: string;
  achieved?: string;
  joinDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class UserStatsResponseDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: {
    [key in UserRole]: number;
  };
  usersByDepartment: {
    department: string;
    count: number;
  }[];
  recentUsers: UserResponseDto[];
}

export class PaginatedUsersResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
