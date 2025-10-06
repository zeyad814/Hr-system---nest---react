import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgoraSettingsDto, UpdateAgoraSettingsDto } from './dto/agora-settings.dto';
import { AgoraSettings } from '@prisma/client';

@Injectable()
export class AgoraSettingsService {
  constructor(private prisma: PrismaService) {}

  async create(createAgoraSettingsDto: CreateAgoraSettingsDto): Promise<AgoraSettings> {
    // Check if settings already exist
    const existingSettings = await this.prisma.agoraSettings.findFirst();
    if (existingSettings) {
      throw new BadRequestException('Agora settings already exist. Use update instead.');
    }

    return this.prisma.agoraSettings.create({
      data: createAgoraSettingsDto,
    });
  }

  async findAll(): Promise<AgoraSettings[]> {
    return this.prisma.agoraSettings.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<AgoraSettings> {
    const settings = await this.prisma.agoraSettings.findUnique({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException(`Agora settings with ID ${id} not found`);
    }

    return settings;
  }

  async findCurrent(): Promise<AgoraSettings | null> {
    // Get the most recent settings
    return this.prisma.agoraSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateAgoraSettingsDto: UpdateAgoraSettingsDto): Promise<AgoraSettings> {
    const existingSettings = await this.findOne(id);

    return this.prisma.agoraSettings.update({
      where: { id },
      data: updateAgoraSettingsDto,
    });
  }

  async remove(id: string): Promise<AgoraSettings> {
    const existingSettings = await this.findOne(id);

    return this.prisma.agoraSettings.delete({
      where: { id },
    });
  }

  async getActiveSettings(): Promise<AgoraSettings | null> {
    return this.prisma.agoraSettings.findFirst({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const settings = await this.findOne(id);
    
    try {
      // Basic validation of App ID and Certificate format
      if (!settings.appId || settings.appId.length < 10) {
        return {
          success: false,
          message: 'Invalid App ID format'
        };
      }

      if (!settings.appCertificate || settings.appCertificate.length < 10) {
        return {
          success: false,
          message: 'Invalid App Certificate format'
        };
      }

      // Here you could add actual Agora API test calls
      // For now, we'll just validate the format
      
      return {
        success: true,
        message: 'Agora settings are valid'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`
      };
    }
  }
}