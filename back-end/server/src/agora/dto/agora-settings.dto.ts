import { IsString, IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateAgoraSettingsDto {
  @IsString()
  appId: string;

  @IsString()
  appCertificate: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @IsOptional()
  @IsString()
  recordingBucket?: string;

  @IsOptional()
  @IsString()
  recordingRegion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxChannelUsers?: number;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(86400)
  tokenExpiry?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAgoraSettingsDto {
  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @IsString()
  appCertificate?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @IsOptional()
  @IsString()
  recordingBucket?: string;

  @IsOptional()
  @IsString()
  recordingRegion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxChannelUsers?: number;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(86400)
  tokenExpiry?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AgoraTokenDto {
  @IsString()
  channelName: string;

  @IsOptional()
  @IsString()
  uid?: string;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(86400)
  expiry?: number;
}