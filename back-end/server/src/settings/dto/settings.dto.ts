import {
  IsOptional,
  IsBoolean,
  IsString,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class UpdateSettingsDto {
  // Notification Settings
  @IsOptional()
  @IsBoolean()
  jobAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  interviewReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  // Privacy Settings
  @IsOptional()
  @IsString()
  profileVisibility?: string;

  @IsOptional()
  @IsBoolean()
  showContactInfo?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRecruiterContact?: boolean;

  @IsOptional()
  @IsBoolean()
  showSalaryExpectations?: boolean;

  // Job Search Settings
  @IsOptional()
  @IsString()
  jobSearchStatus?: string;

  @IsOptional()
  @IsArray()
  preferredJobTypes?: string[];

  @IsOptional()
  @IsArray()
  preferredLocations?: string[];

  @IsOptional()
  @IsObject()
  salaryRange?: {
    min: number;
    max: number;
  };

  @IsOptional()
  @IsBoolean()
  remoteWork?: boolean;

  // Account Settings
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  // Security Settings
  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  loginNotifications?: boolean;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;
}

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  jobAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  interviewReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;
}

export class ApplicantSettingsDto extends UpdateSettingsDto {
  @IsOptional()
  @IsObject()
  profileData?: {
    phone?: string;
    address?: string;
    location?: string;
    skills?: string;
    experience?: string;
    education?: string;
    portfolio?: string;
  };
}