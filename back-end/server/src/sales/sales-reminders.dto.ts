import { IsString, IsDateString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum ReminderType {
  FOLLOW_UP = 'FOLLOW_UP',
  MEETING = 'MEETING',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  CONTRACT_DEADLINE = 'CONTRACT_DEADLINE',
  PAYMENT_DUE = 'PAYMENT_DUE',
  PROPOSAL_DEADLINE = 'PROPOSAL_DEADLINE',
  OTHER = 'OTHER'
}

export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export class CreateSalesReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt: string;

  @IsEnum(ReminderType)
  type: ReminderType;

  @IsEnum(ReminderPriority)
  priority: ReminderPriority;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class UpdateSalesReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsEnum(ReminderType)
  type?: ReminderType;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class SalesReminderFilterDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(ReminderType)
  type?: ReminderType;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}