import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AgoraSettingsService } from './agora-settings.service';
import { CreateAgoraSettingsDto, UpdateAgoraSettingsDto } from './dto/agora-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@Controller('agora-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgoraSettingsController {
  constructor(private readonly agoraSettingsService: AgoraSettingsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAgoraSettingsDto: CreateAgoraSettingsDto) {
    const settings = await this.agoraSettingsService.create(createAgoraSettingsDto);
    return {
      success: true,
      message: 'Agora settings created successfully',
      data: settings,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  async findAll() {
    const settings = await this.agoraSettingsService.findAll();
    return {
      success: true,
      data: settings,
    };
  }

  @Get('current')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async findCurrent() {
    const settings = await this.agoraSettingsService.findCurrent();
    return {
      success: true,
      data: settings,
    };
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async getActiveSettings() {
    const settings = await this.agoraSettingsService.getActiveSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async findOne(@Param('id') id: string) {
    const settings = await this.agoraSettingsService.findOne(id);
    return {
      success: true,
      data: settings,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateAgoraSettingsDto: UpdateAgoraSettingsDto,
  ) {
    const settings = await this.agoraSettingsService.update(id, updateAgoraSettingsDto);
    return {
      success: true,
      message: 'Agora settings updated successfully',
      data: settings,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const settings = await this.agoraSettingsService.remove(id);
    return {
      success: true,
      message: 'Agora settings deleted successfully',
      data: settings,
    };
  }

  @Post(':id/test')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async testConnection(@Param('id') id: string) {
    const result = await this.agoraSettingsService.testConnection(id);
    return {
      success: result.success,
      message: result.message,
    };
  }
}