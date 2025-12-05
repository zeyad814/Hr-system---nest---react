import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SystemSettings {
  companyLogo?: string;
  companyName?: string;
  showTotalUsers: boolean;
  showTotalClients: boolean;
  showTotalJobs: boolean;
  showTotalContracts: boolean;
  showTotalApplicants: boolean;
  showMonthlyRevenue: boolean;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    companyLogo: '/logo.png',
    showTotalUsers: true,
    showTotalClients: true,
    showTotalJobs: true,
    showTotalContracts: true,
    showTotalApplicants: true,
    showMonthlyRevenue: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/settings');
        if (response.data?.system) {
          setSettings(prev => ({
            ...prev,
            companyLogo: response.data.system.companyLogo || '/logo.png',
            companyName: response.data.system.companyName,
            showTotalUsers: response.data.system.showTotalUsers ?? true,
            showTotalClients: response.data.system.showTotalClients ?? true,
            showTotalJobs: response.data.system.showTotalJobs ?? true,
            showTotalContracts: response.data.system.showTotalContracts ?? true,
            showTotalApplicants: response.data.system.showTotalApplicants ?? true,
            showMonthlyRevenue: response.data.system.showMonthlyRevenue ?? true,
          }));
        }
      } catch (error: any) {
        // Silently fail for auth errors or network issues - use default values
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          console.log('Settings endpoint requires authentication - using defaults');
        } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
          console.log('Backend not available - using defaults');
        } else {
          console.warn('Failed to load system settings:', error?.message || 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    settings,
    loading,
    logo: settings.companyLogo || '/logo.png',
    companyName: settings.companyName,
  };
}

