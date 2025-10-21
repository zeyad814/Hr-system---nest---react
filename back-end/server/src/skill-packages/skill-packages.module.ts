import { Module } from '@nestjs/common';
import { SkillPackagesService } from './skill-packages.service';
import { SkillPackagesController } from './skill-packages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkillPackagesController],
  providers: [SkillPackagesService],
  exports: [SkillPackagesService],
})
export class SkillPackagesModule {}

