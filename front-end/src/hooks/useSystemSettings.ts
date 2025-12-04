import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        if (response.data.system) {
          setSettings(response.data.system);
        }
      } catch (error) {
        console.error('Failed to load system settings:', error);
        // Use default logo if settings fail to load
        setSettings({
          companyLogo: '/logo.png',
          showTotalUsers: true,
          showTotalClients: true,
          showTotalJobs: true,
          showTotalContracts: true,
          showTotalApplicants: true,
          showMonthlyRevenue: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const getLogo = () => {
    if (settings?.companyLogo) {
      return settings.companyLogo;
    }
    return '/logo.png'; // Fallback to default logo
  };

  return {
    settings,
    loading,
    logo: getLogo(),
    companyName: settings?.companyName,
  };
}

