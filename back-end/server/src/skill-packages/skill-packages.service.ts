import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillPackageDto } from './dto/create-skill-package.dto';
import { UpdateSkillPackageDto } from './dto/update-skill-package.dto';

@Injectable()
export class SkillPackagesService {
  constructor(private prisma: PrismaService) {}

  async create(createSkillPackageDto: CreateSkillPackageDto, userId?: string) {
    return this.prisma.skillPackage.create({
      data: {
        ...createSkillPackageDto,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.skillPackage.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const package_ = await this.prisma.skillPackage.findUnique({
      where: { id },
    });

    if (!package_) {
      throw new NotFoundException(`Skill package with ID ${id} not found`);
    }

    return package_;
  }

  async update(id: string, updateSkillPackageDto: UpdateSkillPackageDto) {
    const package_ = await this.findOne(id);
    
    return this.prisma.skillPackage.update({
      where: { id },
      data: updateSkillPackageDto,
    });
  }

  async remove(id: string) {
    const package_ = await this.findOne(id);
    
    return this.prisma.skillPackage.delete({
      where: { id },
    });
  }

  async incrementUsage(id: string) {
    return this.prisma.skillPackage.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

}
