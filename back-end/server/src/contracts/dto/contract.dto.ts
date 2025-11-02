import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ContractType {
  RECRUITMENT = 'RECRUITMENT',
  CONSULTING = 'CONSULTING',
  TRAINING = 'TRAINING',
  RETAINER = 'RETAINER',
}

export class CreateContractDto {
  @IsString()
  clientId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

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
  @IsDateString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
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

  @IsOptional()
  @IsString()
  applicantId?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsString()
  applicantNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

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
  @IsDateString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
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

  @IsOptional()
  @IsString()
  applicantId?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

export class ContractQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  applicantId?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class ContractResponseDto {
  id: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    address?: string;
  };
  title: string;
  description?: string;
  type: ContractType;
  status: ContractStatus;
  value?: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  signedAt?: Date;
  fileUrl?: string;
  commission?: number;
  commissionType?: string;
  assignedTo?: string;
  jobTitle?: string;
  progress?: number;
  paymentStatus?: string;
  application?: {
    id: string;
    status: string;
    job?: {
      id: string;
      title: string;
      description?: string;
      location?: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryCurrency?: string;
      client?: {
        id: string;
        name: string;
        company?: string;
        email?: string;
        phone?: string;
      };
    };
    applicant?: {
      id: string;
      user?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
      };
    };
  };
  applicant?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ContractStatsDto {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  pendingContracts: number;
  totalValue: number;
  totalCommission: number;
  contractsByStatus: Record<ContractStatus, number>;
  contractsByType: Record<ContractType, number>;
  contractsByCurrency: Record<string, number>;
}
