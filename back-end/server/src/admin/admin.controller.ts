import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateSystemSettingsDto, UploadLogoDto } from './dto/system-settings.dto';
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService
  ) {}
  
  @Get()
  @Roles(UserRole.ADMIN)
  getAdminHome() {
    return {
      message: 'مرحباً بك في لوحة الإدارة',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/admin/dashboard',
        '/admin/revenues/timeseries',
        '/admin/clients/timeseries'
      ]
    };
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  getDashboard() {
    return this.admin.getSummary();
  }

  @Get('revenues/timeseries')
  @Roles(UserRole.ADMIN)
  getRevenueTimeseries() {
    return this.admin.getRevenueTimeseries();
  }

  @Get('clients/timeseries')
  @Roles(UserRole.ADMIN)
  getClientsTimeseries() {
    return this.admin.getClientsTimeseries();
  }

  @Get('settings')
  @Roles(UserRole.ADMIN)
  async getSettings() {
    const settings = await this.admin.getSystemSettings();
    return {
      system: {
        companyLogo: settings.companyLogo,
        companyName: settings.companyName,
        showTotalUsers: settings.showTotalUsers,
        showTotalClients: settings.showTotalClients,
        showTotalJobs: settings.showTotalJobs,
        showTotalContracts: settings.showTotalContracts,
        showTotalApplicants: settings.showTotalApplicants,
        showMonthlyRevenue: settings.showMonthlyRevenue,
      },
    };
  }

  @Put('settings')
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() updateDto: UpdateSystemSettingsDto) {
    const settings = await this.admin.updateSystemSettings(updateDto);
    return {
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      settings: {
        companyLogo: settings.companyLogo,
        companyName: settings.companyName,
        showTotalUsers: settings.showTotalUsers,
        showTotalClients: settings.showTotalClients,
        showTotalJobs: settings.showTotalJobs,
        showTotalContracts: settings.showTotalContracts,
        showTotalApplicants: settings.showTotalApplicants,
        showMonthlyRevenue: settings.showMonthlyRevenue,
      },
    };
  }

  @Post('settings/logo')
  @Roles(UserRole.ADMIN)
  async uploadLogo(@Body() uploadDto: UploadLogoDto) {
    const settings = await this.admin.uploadCompanyLogo(uploadDto.logo);
    return {
      success: true,
      message: 'تم رفع الشعار بنجاح',
      logo: settings.companyLogo,
    };
  }

  @Get('profile')
  @Roles(UserRole.ADMIN)
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    return await this.admin.getAdminProfile(userId);
  }

  @Post('profile')
  @Roles(UserRole.ADMIN)
  async createProfile(@Request() req: any, @Body() createProfileDto: any) {
    const userId = req.user.id;
    return await this.admin.createAdminProfile(userId, createProfileDto);
  }

  @Put('profile')
  @Roles(UserRole.ADMIN)
  async updateProfile(@Request() req: any, @Body() updateProfileDto: any) {
    const userId = req.user.id;
    return await this.admin.updateAdminProfile(userId, updateProfileDto);
  }

}
