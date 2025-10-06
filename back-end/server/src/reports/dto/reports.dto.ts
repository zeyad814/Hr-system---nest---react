import {
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class MonthlyStatsDto {
  @IsNumber()
  @Type(() => Number)
  @Min(2020)
  @Max(2030)
  year: number;
}

export class SalesRepFilterDto extends DateRangeDto {
  @IsOptional()
  @IsString()
  repId?: string;
}

export class RevenueFilterDto extends DateRangeDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeUnpaid?: boolean;
}

export class HiringStatsFilterDto extends DateRangeDto {
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}

export class InterviewStatsFilterDto extends DateRangeDto {
  @IsOptional()
  @IsString()
  interviewType?:
    | 'PHONE'
    | 'VIDEO'
    | 'IN_PERSON'
    | 'TECHNICAL'
    | 'HR'
    | 'FINAL';

  @IsOptional()
  @IsString()
  status?:
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'ATTENDED'
    | 'NO_SHOW'
    | 'CANCELLED'
    | 'RESCHEDULED';
}

export class DashboardStatsResponseDto {
  newClientsCount: number;
  openJobsCount: number;
  closedJobsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  salesRepTargetAchievement: number;
}

export class RevenueByClientResponseDto {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  contractsCount: number;
}

export class SalesRepPerformanceResponseDto {
  repId: string;
  repName: string;
  newClientsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  targetAchievement: number;
  target: number;
}

export class MonthlyStatsResponseDto {
  month: number;
  year: number;
  newClients: number;
  signedContracts: number;
  revenue: number;
}

export class HiringStatsResponseDto {
  totalApplications: number;
  hiredCount: number;
  rejectedCount: number;
  interviewCount: number;
  pendingCount: number;
  hiringSuccessRate: number;
}

export class InterviewStatsResponseDto {
  totalInterviews: number;
  attendedInterviews: number;
  noShowInterviews: number;
  cancelledInterviews: number;
  attendanceRate: number;
}
