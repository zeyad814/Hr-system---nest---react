import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // Default settings for new users
  private getDefaultSettings() {
    return {
      // Notification Settings
      jobAlerts: true,
      applicationUpdates: true,
      interviewReminders: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,

      // Privacy Settings
      profileVisibility: 'public',
      showContactInfo: true,
      allowRecruiterContact: true,
      showSalaryExpectations: false,

      // Job Search Settings
      jobSearchStatus: 'actively_looking',
      preferredJobTypes: ['full-time'],
      preferredLocations: ['الرياض'],
      salaryRange: { min: 8000, max: 15000 },
      remoteWork: true,

      // Account Settings
      language: 'ar',
      timezone: 'Asia/Riyadh',
      theme: 'light',

      // Security Settings
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
    };
  }

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = this.getDefaultSettings();
      settings = await this.prisma.userSettings.create({
        data: {
          userId,
          settings: defaultSettings,
        },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, updateData: UpdateSettingsDto) {
    // Get current settings or create default ones
    let currentSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!currentSettings) {
      const defaultSettings = this.getDefaultSettings();
      currentSettings = await this.prisma.userSettings.create({
        data: {
          userId,
          settings: defaultSettings,
        },
      });
    }

    // Merge current settings with updates
    const updatedSettings = {
      ...(currentSettings.settings as any),
      ...updateData,
    };

    // Update settings in database
    const settings = await this.prisma.userSettings.update({
      where: { userId },
      data: {
        settings: updatedSettings,
        updatedAt: new Date(),
      },
    });

    return settings;
  }

  async getApplicantSettings(userId: string) {
    // Get user settings
    const settings = await this.getSettings(userId);

    // Get applicant-specific data
    const applicant = await this.prisma.applicant.findUnique({
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

    return {
      ...settings,
      applicantProfile: applicant,
    };
  }

  async updateApplicantSettings(userId: string, updateData: any) {
    // Update general settings
    const settings = await this.updateSettings(userId, updateData);

    // Update applicant-specific fields if provided
    if (updateData.profileData) {
      await this.prisma.applicant.upsert({
        where: { userId },
        update: updateData.profileData,
        create: {
          userId,
          ...updateData.profileData,
        },
      });
    }

    return settings;
  }

  async resetSettings(userId: string) {
    const defaultSettings = this.getDefaultSettings();

    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        settings: defaultSettings,
        updatedAt: new Date(),
      },
      create: {
        userId,
        settings: defaultSettings,
      },
    });

    return settings;
  }

  // Get notification preferences for a user
  async getNotificationPreferences(userId: string) {
    const settings = await this.getSettings(userId);
    const settingsData = settings.settings as any;

    return {
      jobAlerts: settingsData.jobAlerts || true,
      applicationUpdates: settingsData.applicationUpdates || true,
      interviewReminders: settingsData.interviewReminders || true,
      emailNotifications: settingsData.emailNotifications || true,
      smsNotifications: settingsData.smsNotifications || false,
      pushNotifications: settingsData.pushNotifications || true,
    };
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.updateSettings(userId, preferences);
  }
}
