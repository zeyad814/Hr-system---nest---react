import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Request,
  Param,
  Query,
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
import { CreateMonthlyTargetDto, UpdateMonthlyTargetDto } from './dto/monthly-target.dto';

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

  // Monthly Targets Management
  @Get('monthly-targets')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async getMonthlyTargets(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.settingsService.getMonthlyTargets(yearNumber);
  }

  @Get('monthly-targets/:month/:year')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async getMonthlyTarget(
    @Param('month') month: string,
    @Param('year') year: string,
  ) {
    return this.settingsService.getMonthlyTarget(
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }

  @Post('monthly-targets')
  @Roles(UserRole.ADMIN)
  async createMonthlyTarget(
    @Request() req: any,
    @Body() dto: CreateMonthlyTargetDto,
  ) {
    return this.settingsService.upsertMonthlyTarget(req.user.sub, dto);
  }

  @Put('monthly-targets/:id')
  @Roles(UserRole.ADMIN)
  async updateMonthlyTarget(
    @Param('id') id: string,
    @Body() dto: UpdateMonthlyTargetDto,
  ) {
    return this.settingsService.updateMonthlyTarget(id, dto);
  }

  @Delete('monthly-targets/:id')
  @Roles(UserRole.ADMIN)
  async deleteMonthlyTarget(@Param('id') id: string) {
    return this.settingsService.deleteMonthlyTarget(id);
  }
}
