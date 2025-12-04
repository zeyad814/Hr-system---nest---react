import {
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsBoolean()
  showTotalUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  showTotalClients?: boolean;

  @IsOptional()
  @IsBoolean()
  showTotalJobs?: boolean;

  @IsOptional()
  @IsBoolean()
  showTotalContracts?: boolean;

  @IsOptional()
  @IsBoolean()
  showTotalApplicants?: boolean;

  @IsOptional()
  @IsBoolean()
  showMonthlyRevenue?: boolean;
}

export class UploadLogoDto {
  @IsString()
  logo: string; // base64 encoded image
}

