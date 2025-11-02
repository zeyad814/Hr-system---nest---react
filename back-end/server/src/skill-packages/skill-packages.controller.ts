import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SkillPackagesService } from './skill-packages.service';
import { CreateSkillPackageDto } from './dto/create-skill-package.dto';
import { UpdateSkillPackageDto } from './dto/update-skill-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@Controller('skill-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillPackagesController {
  constructor(private readonly skillPackagesService: SkillPackagesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(@Body() createSkillPackageDto: CreateSkillPackageDto, @Request() req: any) {
    return this.skillPackagesService.create(createSkillPackageDto, req.user?.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  findAll() {
    return this.skillPackagesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  findOne(@Param('id') id: string) {
    return this.skillPackagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(@Param('id') id: string, @Body() updateSkillPackageDto: UpdateSkillPackageDto) {
    return this.skillPackagesService.update(id, updateSkillPackageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  remove(@Param('id') id: string) {
    return this.skillPackagesService.remove(id);
  }

  @Post(':id/use')
  @Roles(UserRole.ADMIN, UserRole.HR)
  incrementUsage(@Param('id') id: string) {
    return this.skillPackagesService.incrementUsage(id);
  }
}
