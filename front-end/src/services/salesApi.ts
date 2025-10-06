import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance for Sales API
const salesApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
salesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling with token refresh
salesApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface SalesClient {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  status: 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  totalJobs: number;
  totalSpent: number;
  joinDate: string;
  lastActivity: string;
  contactPerson?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  jobs?: SalesJob[];
  revenues?: SalesRevenue[];
}

export interface SalesJob {
  id: string;
  title: string;
  clientId: string;
  client?: SalesClient;
  department?: string;
  location?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  status: 'OPEN' | 'IN_PROGRESS' | 'FILLED' | 'CANCELLED' | 'ON_HOLD';
  salary?: string;
  candidates: number;
  applications: number;
  hired: number;
  createdDate: string;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  commission?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesRevenue {
  id: string;
  source: string;
  clientId: string;
  client?: SalesClient;
  contract?: string;
  amount: number;
  currency: string;
  commission?: number;
  type: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER';
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  date: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesClientDto {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  contactPerson?: string;
  description?: string;
}

export interface UpdateSalesClientDto {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  status?: 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  contactPerson?: string;
  description?: string;
}

export interface CreateSalesJobDto {
  title: string;
  clientId: string;
  department?: string;
  location?: string;
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  salary?: string;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  commission?: number;
}

export interface UpdateSalesJobDto {
  title?: string;
  department?: string;
  location?: string;
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  status?: 'OPEN' | 'IN_PROGRESS' | 'FILLED' | 'CANCELLED' | 'ON_HOLD';
  salary?: string;
  candidates?: number;
  applications?: number;
  hired?: number;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  commission?: number;
}

export interface CreateSalesRevenueDto {
  source: string;
  clientId: string;
  contract?: string;
  amount: number;
  currency?: string;
  commission?: number;
  type?: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER';
  date?: string;
  dueDate?: string;
}

export interface UpdateSalesRevenueDto {
  source?: string;
  contract?: string;
  amount?: number;
  currency?: string;
  commission?: number;
  type?: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER';
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  date?: string;
  dueDate?: string;
  paidDate?: string;
}

export interface SalesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  industry?: string;
  clientId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalJobs: number;
  openJobs: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface MonthlyRevenue {
  month: number;
  revenue: number;
}

// Sales Targets Interfaces
export interface SalesTarget {
  id: string;
  title: string;
  type: 'REVENUE' | 'CONTRACTS' | 'CLIENTS' | 'JOBS';
  target: number;
  achieved: number;
  percentage: number;
  period: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  assignedTo?: string;
  description?: string;
  daysLeft?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReminder {
  id: string;
  title: string;
  description?: string;
  type: 'FOLLOW_UP' | 'MEETING' | 'CALL' | 'EMAIL' | 'CONTRACT_DEADLINE' | 'PAYMENT_DUE' | 'PROPOSAL_DEADLINE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  remindAt: string;
  clientId?: string;
  client?: SalesClient;
  contractId?: string;
  contract?: SalesContract;
  assignedTo?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesReminderDto {
  title: string;
  description?: string;
  remindAt: string;
  type: 'FOLLOW_UP' | 'MEETING' | 'CALL' | 'EMAIL' | 'CONTRACT_DEADLINE' | 'PAYMENT_DUE' | 'PROPOSAL_DEADLINE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  clientId?: string;
  contractId?: string;
  assignedTo?: string;
}

export interface UpdateSalesReminderDto {
  title?: string;
  description?: string;
  remindAt?: string;
  type?: 'FOLLOW_UP' | 'MEETING' | 'CALL' | 'EMAIL' | 'CONTRACT_DEADLINE' | 'PAYMENT_DUE' | 'PROPOSAL_DEADLINE' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  clientId?: string;
  contractId?: string;
  assignedTo?: string;
  completed?: boolean;
}

export interface CreateSalesTargetDto {
  title: string;
  type: 'REVENUE' | 'CONTRACTS' | 'CLIENTS' | 'JOBS';
  target: number;
  period: string;
  startDate: string;
  endDate: string;
  assignedTo?: string;
  description?: string;
}

export interface UpdateSalesTargetDto {
  title?: string;
  type?: 'REVENUE' | 'CONTRACTS' | 'CLIENTS' | 'JOBS';
  target?: number;
  achieved?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  assignedTo?: string;
  description?: string;
}

// Sales Contracts Interfaces
export interface SalesContract {
  id: string;
  title: string;
  client: {
    id: string;
    name: string;
    company?: string;
  };
  type: 'RECRUITMENT' | 'RETAINER' | 'PROJECT' | 'ANNUAL';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  value: {
    amount: number;
    currency: string;
  };
  startDate: string;
  endDate: string;
  signedDate?: string;
  paymentTerms?: string;
  commission: number;
  description?: string;
  terms: string[];
  assignedTo?: string;
  progress: number;
  milestones: ContractMilestone[];
  documents: ContractDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractMilestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completedAt?: string;
}

export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadDate: string;
}

export interface CreateSalesContractDto {
  title: string;
  clientId: string;
  type: 'RECRUITMENT' | 'RETAINER' | 'PROJECT' | 'ANNUAL';
  value: number;
  currency?: string;
  startDate: string;
  endDate: string;
  paymentTerms?: string;
  commission?: number;
  description?: string;
  terms?: string[];
  assignedTo?: string;
}

export interface UpdateSalesContractDto {
  title?: string;
  type?: 'RECRUITMENT' | 'RETAINER' | 'PROJECT' | 'ANNUAL';
  status?: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  value?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  signedDate?: string;
  paymentTerms?: string;
  commission?: number;
  description?: string;
  terms?: string[];
  assignedTo?: string;
  progress?: number;
}

// Sales API functions
export const salesApiService = {
  // Sales Clients
  async getClients(query?: SalesQuery): Promise<{ clients: SalesClient[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.industry) params.append('industry', query.industry);
    
    const response = await salesApi.get(`/sales/clients?${params.toString()}`);
    return response.data;
  },

  async getClient(id: string): Promise<SalesClient> {
    const response = await salesApi.get(`/sales/clients/${id}`);
    return response.data;
  },

  async createClient(data: CreateSalesClientDto): Promise<SalesClient> {
    const response = await salesApi.post('/sales/clients', data);
    return response.data;
  },

  async updateClient(id: string, data: UpdateSalesClientDto): Promise<SalesClient> {
    const response = await salesApi.put(`/sales/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    await salesApi.delete(`/sales/clients/${id}`);
  },

  // Sales Jobs
  async getJobs(query?: SalesQuery): Promise<{ jobs: SalesJob[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.clientId) params.append('clientId', query.clientId);
    if (query?.type) params.append('type', query.type);
    
    const response = await salesApi.get(`/sales/jobs?${params.toString()}`);
    return response.data;
  },

  async getJob(id: string): Promise<SalesJob> {
    const response = await salesApi.get(`/sales/jobs/${id}`);
    return response.data;
  },

  async createJob(data: CreateSalesJobDto): Promise<SalesJob> {
    const response = await salesApi.post('/sales/jobs', data);
    return response.data;
  },

  async updateJob(id: string, data: UpdateSalesJobDto): Promise<SalesJob> {
    const response = await salesApi.put(`/sales/jobs/${id}`, data);
    return response.data;
  },

  async deleteJob(id: string): Promise<void> {
    await salesApi.delete(`/sales/jobs/${id}`);
  },

  // Sales Revenue
  async getRevenues(query?: SalesQuery): Promise<{ revenues: SalesRevenue[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.clientId) params.append('clientId', query.clientId);
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    
    const response = await salesApi.get(`/sales/revenues?${params.toString()}`);
    return response.data;
  },

  async getRevenue(id: string): Promise<SalesRevenue> {
    const response = await salesApi.get(`/sales/revenues/${id}`);
    return response.data;
  },

  async createRevenue(data: CreateSalesRevenueDto): Promise<SalesRevenue> {
    const response = await salesApi.post('/sales/revenues', data);
    return response.data;
  },

  async updateRevenue(id: string, data: UpdateSalesRevenueDto): Promise<SalesRevenue> {
    const response = await salesApi.put(`/sales/revenues/${id}`, data);
    return response.data;
  },

  async deleteRevenue(id: string): Promise<void> {
    await salesApi.delete(`/sales/revenues/${id}`);
  },

  // Dashboard and Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await salesApi.get('/sales/dashboard/stats');
    return response.data;
  },

  async getMonthlyRevenue(year?: number): Promise<MonthlyRevenue[]> {
    const params = year ? `?year=${year}` : '';
    const response = await salesApi.get(`/sales/dashboard/monthly-revenue${params}`);
    return response.data;
  },

  // Sales Targets
  getTargets: async (): Promise<SalesTarget[]> => {
    const response = await salesApi.get('/sales/targets');
    return response.data.targets || [];
  },

  getTarget: async (id: string): Promise<SalesTarget> => {
    const response = await salesApi.get(`/sales/targets/${id}`);
    return response.data;
  },

  createTarget: async (data: CreateSalesTargetDto): Promise<SalesTarget> => {
    const response = await salesApi.post('/sales/targets', data);
    return response.data;
  },

  updateTarget: async (id: string, data: UpdateSalesTargetDto): Promise<SalesTarget> => {
    const response = await salesApi.put(`/sales/targets/${id}`, data);
    return response.data;
  },

  deleteTarget: async (id: string): Promise<void> => {
    await salesApi.delete(`/sales/targets/${id}`);
  },

  // Sales Contracts
  getContracts: async (): Promise<SalesContract[]> => {
    const response = await salesApi.get('/sales/contracts');
    return response.data.contracts || response.data;
  },

  getContract: async (id: string): Promise<SalesContract> => {
    const response = await salesApi.get(`/sales/contracts/${id}`);
    return response.data;
  },

  createContract: async (data: CreateSalesContractDto): Promise<SalesContract> => {
    const response = await salesApi.post('/sales/contracts', data);
    return response.data;
  },

  updateContract: async (id: string, data: UpdateSalesContractDto): Promise<SalesContract> => {
    const response = await salesApi.put(`/sales/contracts/${id}`, data);
    return response.data;
  },

  deleteContract: async (id: string): Promise<void> => {
    await salesApi.delete(`/sales/contracts/${id}`);
  },

  // Contract Milestones
  addMilestone: async (contractId: string, data: { title: string; amount: number; dueDate: string }): Promise<ContractMilestone> => {
    const response = await salesApi.post(`/sales/contracts/${contractId}/milestones`, data);
    return response.data;
  },

  updateMilestone: async (contractId: string, milestoneId: string, data: { status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'; completedAt?: string }): Promise<ContractMilestone> => {
    const response = await salesApi.put(`/sales/contracts/${contractId}/milestones/${milestoneId}`, data);
    return response.data;
  },

  deleteMilestone: async (contractId: string, milestoneId: string): Promise<void> => {
    await salesApi.delete(`/sales/contracts/${contractId}/milestones/${milestoneId}`);
  },

  // Contract Documents
  addDocument: async (contractId: string, data: { name: string; type: string; fileUrl: string }): Promise<ContractDocument> => {
    const response = await salesApi.post(`/sales/contracts/${contractId}/documents`, data);
    return response.data;
  },

  deleteDocument: async (contractId: string, documentId: string): Promise<void> => {
    await salesApi.delete(`/sales/contracts/${contractId}/documents/${documentId}`);
  },

  // Sales Achievements
  getAchievements: async (): Promise<any[]> => {
    const response = await salesApi.get('/sales/achievements');
    return response.data;
  },

  // Quarterly Performance
  getQuarterlyPerformance: async (year?: number): Promise<any[]> => {
    const params = year ? `?year=${year}` : '';
    const response = await salesApi.get(`/sales/quarterly-performance${params}`);
    return response.data;
  },

  // Reminders
  getReminders: async (): Promise<SalesReminder[]> => {
    const response = await salesApi.get('/sales/reminders');
    return response.data;
  },

  getReminder: async (id: string): Promise<SalesReminder> => {
    const response = await salesApi.get(`/sales/reminders/${id}`);
    return response.data;
  },

  createReminder: async (data: CreateSalesReminderDto): Promise<SalesReminder> => {
    const response = await salesApi.post('/sales/reminders', data);
    return response.data;
  },

  updateReminder: async (id: string, data: UpdateSalesReminderDto): Promise<SalesReminder> => {
    const response = await salesApi.patch(`/sales/reminders/${id}`, data);
    return response.data;
  },

  deleteReminder: async (id: string): Promise<void> => {
    await salesApi.delete(`/sales/reminders/${id}`);
  },

  // Reports
  // Reports endpoints
  getReports: async (): Promise<any[]> => {
    const response = await salesApi.get('/sales/reports');
    return response.data;
  },

  generateReport: async (type: string, params?: any): Promise<any> => {
    const response = await salesApi.post(`/sales/reports/generate`, { type, ...params });
    return response.data;
  },

  downloadReport: async (type: string, format: string = 'pdf'): Promise<Blob> => {
    const response = await salesApi.get(`/sales/reports/download/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Dashboard stats endpoint
  getDashboardData: async (): Promise<DashboardStats> => {
    const response = await salesApi.get('/sales/dashboard/stats');
    return response.data;
  },

  // User Profile endpoints
  getProfile: async (): Promise<any> => {
    const response = await salesApi.get('/sales/profile');
    return response.data;
  },

  createProfile: async (profileData: any): Promise<any> => {
    const response = await salesApi.post('/sales/profile', profileData);
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await salesApi.put('/sales/profile', profileData);
    return response.data;
  },

};

export default salesApiService;