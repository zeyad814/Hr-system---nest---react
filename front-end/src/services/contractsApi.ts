import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance with default config
const contractsApiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
contractsApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
contractsApiInstance.interceptors.response.use(
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

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  type: 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  jobTitle?: string;
  commission?: number;
  commissionType?: string;
  assignedTo?: string;
  progress: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  fileUrl?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    address?: string;
  };
  application?: {
    id: string;
    status: string;
    job?: {
      id: string;
      title: string;
      description?: string;
      location?: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryCurrency?: string;
      client?: {
        id: string;
        name: string;
        company?: string;
        email?: string;
        phone?: string;
      };
    };
    applicant?: {
      id: string;
      user?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
      };
    };
  };
  applicant?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface ContractQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  paymentStatus?: string;
  clientId?: string;
  applicantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContractStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  totalValue: number;
  averageValue: number;
}

export interface CreateContractData {
  clientId: string;
  title: string;
  description?: string;
  type: 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER';
  status?: 'DRAFT' | 'ACTIVE';
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  jobTitle?: string;
  commission?: number;
  commissionType?: string;
  assignedTo?: string;
  progress?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
}

export interface UpdateContractData {
  title?: string;
  description?: string;
  type?: 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER';
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  value?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  jobTitle?: string;
  commission?: number;
  commissionType?: string;
  assignedTo?: string;
  progress?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
  clientId?: string;
}

export const contractsApi = {
  // Get all contracts with optional filters
  getContracts: async (query?: ContractQuery): Promise<{ contracts: Contract[]; total: number; page: number; totalPages: number; data?: Contract[] }> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.paymentStatus) params.append('paymentStatus', query.paymentStatus);
    if (query?.clientId) params.append('clientId', query.clientId);
    if (query?.applicantId) params.append('applicantId', query.applicantId);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const response = await contractsApiInstance.get(`/contracts?${params.toString()}`);
    const apiData = response.data;
    // تحويل البنية من { data, pagination } إلى { contracts, total, page, totalPages }
    return {
      contracts: apiData.data || apiData.contracts || [],
      total: apiData.pagination?.total || apiData.total || 0,
      page: apiData.pagination?.page || apiData.page || 1,
      totalPages: apiData.pagination?.totalPages || apiData.totalPages || 1,
      data: apiData.data || apiData.contracts || [],
    };
  },

  // Get single contract by ID
  getContract: async (id: string): Promise<Contract> => {
    const response = await contractsApiInstance.get(`/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  createContract: async (data: CreateContractData): Promise<Contract> => {
    const response = await contractsApiInstance.post('/contracts', data);
    return response.data;
  },

  // Applicant respond to contract (accept/reject)
  applicantRespond: async (id: string, action: 'ACCEPT' | 'REJECT', notes?: string): Promise<Contract> => {
    const response = await contractsApiInstance.patch(`/contracts/${id}/applicant-response`, { action, notes });
    return response.data;
  },

  // Update contract
  updateContract: async (id: string, data: UpdateContractData): Promise<Contract> => {
    const response = await contractsApiInstance.patch(`/contracts/${id}`, data);
    return response.data;
  },

  // Delete contract
  deleteContract: async (id: string): Promise<void> => {
    await contractsApiInstance.delete(`/contracts/${id}`);
  },

  // Update contract status
  updateContractStatus: async (id: string, status: string): Promise<Contract> => {
    const response = await contractsApiInstance.patch(`/contracts/${id}/status`, { status });
    return response.data;
  },

  // Update contract progress
  updateContractProgress: async (id: string, progress: number): Promise<Contract> => {
    const response = await contractsApiInstance.patch(`/contracts/${id}/progress`, { progress });
    return response.data;
  },

  // Get contract statistics
  getContractStats: async (currency?: string): Promise<ContractStats> => {
    const params = currency ? `?currency=${currency}` : '';
    const response = await contractsApiInstance.get(`/contracts/stats${params}`);
    return response.data;
  },

  // Get contracts for specific client
  getClientContracts: async (clientId: string, query?: { page?: number; limit?: number }): Promise<{ contracts: Contract[]; total: number }> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const response = await contractsApiInstance.get(`/contracts/client/${clientId}?${params.toString()}`);
    return response.data;
  },
};

export default contractsApi;