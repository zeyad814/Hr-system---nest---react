import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
  getSettings() {
    // Return current system settings
    // This would typically fetch from database or config
    return {
      system: {
        companyName: 'شركة إدارة التوظيف والمبيعات',
        timezone: 'Asia/Riyadh',
        description: 'نحن شركة رائدة في مجال إدارة الموارد البشرية والمبيعات...',
        phone: '+966 11 234 5678',
        email: 'info@hrcrm.com',
        emailNotifications: true,
        smsNotifications: false,
        browserNotifications: true,
        dailyReports: true,
        twoFactorAuth: false,
        passwordExpiration: true,
        minPasswordLength: 8,
        maxLoginAttempts: 3
      },
    };
  }

  @Put('settings')
  @Roles(UserRole.ADMIN)
  updateSettings(@Body() settings: any) {
    // Save settings to database or config
    // This would typically update the database
    console.log('Updating settings:', settings);
    return {
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    };
  }

}
