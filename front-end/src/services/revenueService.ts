import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/sales';

export interface RevenueStats {
  totalRevenue: number;
  totalCommissions: number;
  averageContractValue: number;
  contractCount: number;
  growthPercentage: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  commissions: number;
  contracts: number;
  clients: number;
}

export interface TopClient {
  id: string;
  name: string;
  revenue: number;
  contracts: number;
  commissions: number;
}

export interface CommissionBreakdown {
  type: string;
  amount: number;
  percentage: number;
  count: number;
}

export const revenueService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<RevenueStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get monthly revenue data
  async getMonthlyRevenue(year?: number): Promise<MonthlyRevenueData[]> {
    try {
      const params = year ? { year: year.toString() } : {};
      const response = await axios.get(`${API_BASE_URL}/dashboard/monthly-revenue`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  },

  // Get top clients by revenue
  async getTopClients(limit: number = 10): Promise<TopClient[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/top-clients`, {
        params: { limit: limit.toString() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top clients:', error);
      throw error;
    }
  },

  // Get commission breakdown
  async getCommissionBreakdown(): Promise<CommissionBreakdown[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/commission-breakdown`);
      return response.data;
    } catch (error) {
      console.error('Error fetching commission breakdown:', error);
      throw error;
    }
  },

  // Export revenue report as PDF
  async exportRevenuePDF(data: {
    stats: RevenueStats;
    monthlyData: MonthlyRevenueData[];
    topClients: TopClient[];
    commissionBreakdown: CommissionBreakdown[];
  }): Promise<Blob> {
    try {
      const response = await axios.post(`${API_BASE_URL}/export/revenue-pdf`, data, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }
};