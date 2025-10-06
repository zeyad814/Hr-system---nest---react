import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AgoraService } from '../agora/agora.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly agoraService: AgoraService
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
      agora: this.agoraService.getAgoraConfig()
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

  @Post('agora/test-connection')
  @Roles(UserRole.ADMIN)
  async testAgoraConnection(@Body() credentials: { appId: string; appCertificate: string }) {
    try {
      // Test Agora connection by generating a test token
      const testChannel = 'test_connection_' + Date.now();
      const testUid = 12345;
      
      // Temporarily set credentials for testing
      const originalAppId = process.env.AGORA_APP_ID;
      const originalCertificate = process.env.AGORA_APP_CERTIFICATE;
      
      process.env.AGORA_APP_ID = credentials.appId;
      process.env.AGORA_APP_CERTIFICATE = credentials.appCertificate;
      
      // Try to generate a token
      const token = this.agoraService.generateRtcToken(testChannel, testUid, 'publisher', 3600);
      
      // Restore original credentials
      process.env.AGORA_APP_ID = originalAppId;
      process.env.AGORA_APP_CERTIFICATE = originalCertificate;
      
      if (token) {
        return {
          success: true,
          message: 'تم الاتصال بـ Agora بنجاح',
          testToken: token.substring(0, 20) + '...' // Show partial token for verification
        };
      } else {
        throw new Error('Failed to generate token');
      }
    } catch (error) {
      return {
        success: false,
        message: 'فشل في الاتصال بـ Agora: ' + error.message
      };
    }
  }
}
