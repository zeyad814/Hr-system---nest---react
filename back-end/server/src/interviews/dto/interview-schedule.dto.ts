import { IsString, IsEmail, IsDateString, IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';

export class CreateInterviewScheduleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  candidateName: string;

  @IsEmail()
  candidateEmail: string;

  @IsString()
  interviewerName: string;

  @IsEmail()
  interviewerEmail: string;

  @IsDateString()
  scheduledDate: string;

  @IsInt()
  @Min(15)
  @Max(480)
  duration: number; // in minutes

  @IsEnum(['GOOGLE_MEET', 'ZOOM'])
  meetingType: 'GOOGLE_MEET' | 'ZOOM';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInterviewScheduleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  candidateName?: string;

  @IsOptional()
  @IsEmail()
  candidateEmail?: string;

  @IsOptional()
  @IsString()
  interviewerName?: string;

  @IsOptional()
  @IsEmail()
  interviewerEmail?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsEnum(['GOOGLE_MEET', 'ZOOM'])
  meetingType?: 'GOOGLE_MEET' | 'ZOOM';

  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

  @IsOptional()
  @IsString()
  notes?: string;
}










