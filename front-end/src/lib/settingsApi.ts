import api from './api';

export interface UserSettings {
  // Notification Settings
  jobAlerts: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'recruiter_only';
  showContactInfo: boolean;
  allowRecruiterContact: boolean;
  showSalaryExpectations: boolean;
  
  // Job Search Settings
  jobSearchStatus: 'actively_looking' | 'open_to_offers' | 'not_looking';
  preferredJobTypes: string[];
  preferredLocations: string[];
  salaryRange: { min: number; max: number };
  remoteWork: boolean;
  
  // Account Settings
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  
  // Security Settings
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
}

export interface ApplicantSettings extends UserSettings {
  applicantProfile?: {
    id: string;
    phone?: string;
    address?: string;
    location?: string;
    skills?: string;
    experience?: string;
    education?: string;
    portfolio?: string;
    avatar?: string;
    rating?: number;
    resumeUrl?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export const settingsApi = {
  // Get current user settings
  getSettings: async (): Promise<{ settings: UserSettings }> => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<{ settings: UserSettings }> => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Get applicant-specific settings
  getApplicantSettings: async (): Promise<{ settings: ApplicantSettings }> => {
    const response = await api.get('/settings/applicant');
    return response.data;
  },

  // Update applicant-specific settings
  updateApplicantSettings: async (settings: Partial<UserSettings & { profileData?: any }>): Promise<{ settings: ApplicantSettings }> => {
    const response = await api.put('/settings/applicant', settings);
    return response.data;
  },

  // Reset settings to default
  resetSettings: async (): Promise<{ settings: UserSettings }> => {
    const response = await api.post('/settings/reset');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await api.delete('/auth/delete-account', {
      data: { password }
    });
    return response.data;
  }
};

export default settingsApi;