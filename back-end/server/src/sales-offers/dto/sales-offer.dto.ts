import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateSalesOfferDto {
  @IsString()
  applicationId: string;

  @IsString()
  applicantId: string;

  @IsString()
  jobId: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApplicantSalesOfferResponseDto {
  @IsEnum(['ACCEPTED', 'REJECTED'])
  response: 'ACCEPTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SalesOfferReviewDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  response: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  notes?: string;
}

