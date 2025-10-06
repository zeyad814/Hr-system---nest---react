import { IsString, IsOptional, IsEmail, IsNumber, IsDateString, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { JobStatus, ContractStatus, ContractType } from '@prisma/client';

// Basic Client DTOs
export class CreateClientDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  establishedYear?: number;

  @IsOptional()
  @IsString()
  employees?: string;

  @IsOptional()
  @IsString()
  revenue?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  establishedYear?: number;

  @IsOptional()
  @IsString()
  employees?: string;

  @IsOptional()
  @IsString()
  revenue?: string;
}

// Profile DTOs
export class CreateClientProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  establishedYear?: number;

  @IsOptional()
  @IsString()
  employees?: string;

  @IsOptional()
  @IsString()
  revenue?: string;
}

export class UpdateClientProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  establishedYear?: number;

  @IsOptional()
  @IsString()
  employees?: string;

  @IsOptional()
  @IsString()
  revenue?: string;
}

// Job DTOs
export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  locationLink?: string;

  @IsString()
  jobType: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsBoolean()
  remoteWorkAvailable?: boolean;

  @IsString()
  description: string;

  @IsString()
  requirements: string;

  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @IsString()
  salaryRange: string;

  @IsDateString()
  applicationDeadline: string;
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  status: JobStatus;
}

// Contract DTOs
export class CreateContractDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission?: number;

  @IsOptional()
  @IsString()
  commissionType?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;
}

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus)
  status: ContractStatus;
}

export class RenewContractDto {
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;
}

// Note DTOs
export class CreateNoteDto {
  @IsString()
  content: string;
}

// Reminder DTOs
export class CreateReminderDto {
  @IsString()
  title: string;

  @IsDateString()
  remindAt: string;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

// Revenue DTOs
export class CreateRevenueDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  periodMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(3000)
  periodYear?: number;
}

// Query DTOs
export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}