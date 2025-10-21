import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSkillPackageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  skills: string; // JSON array or comma-separated skills

  @IsString()
  requirements: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
