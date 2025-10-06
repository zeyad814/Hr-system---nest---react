import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { UpdateSettingsDto } from './dto/settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Get user settings
  @Get()
  @Roles(UserRole.APPLICANT, UserRole.CLIENT, UserRole.HR, UserRole.ADMIN)
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.sub);
  }

  // Update user settings
  @Put()
  @Roles(UserRole.APPLICANT, UserRole.CLIENT, UserRole.HR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Request() req: any,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(req.user.sub, updateSettingsDto);
  }

  // Get applicant-specific settings
  @Get('applicant')
  @Roles(UserRole.APPLICANT)
  async getApplicantSettings(@Request() req: any) {
    return this.settingsService.getApplicantSettings(req.user.sub);
  }

  // Update applicant-specific settings
  @Put('applicant')
  @Roles(UserRole.APPLICANT)
  @HttpCode(HttpStatus.OK)
  async updateApplicantSettings(
    @Request() req: any,
    @Body() updateSettingsDto: any,
  ) {
    return this.settingsService.updateApplicantSettings(
      req.user.sub,
      updateSettingsDto,
    );
  }

  // Reset settings to default
  @Put('reset')
  @Roles(UserRole.APPLICANT, UserRole.CLIENT, UserRole.HR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async resetSettings(@Request() req: any) {
    return this.settingsService.resetSettings(req.user.sub);
  }
}
