import { IsInt, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateMonthlyTargetDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMonthlyTargetDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

