import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHRProfileDto, UpdateHRProfileDto } from './dto/hr-profile.dto';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getHRProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return profile;
  }

  async createHRProfile(userId: string, data: CreateHRProfileDto) {
    // Convert date strings to Date objects
    const profileData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      userId,
    };

    const profile = await this.prisma.profile.create({
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return profile;
  }

  async updateHRProfile(userId: string, data: UpdateHRProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    // Convert date strings to Date objects
    const profileData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
    };

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return profile;
  }
}