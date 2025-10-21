import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillPackageDto } from './create-skill-package.dto';

export class UpdateSkillPackageDto extends PartialType(CreateSkillPackageDto) {}

