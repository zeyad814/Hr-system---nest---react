import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance for Admin API
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
adminApi.interceptors.response.use(
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
export interface AdminProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  department?: string;
  position?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAdminProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  department?: string;
  position?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  notes?: string;
}

export interface UpdateAdminProfileDto extends Partial<CreateAdminProfileDto> {}

// Admin API Service
export const adminApiService = {
  // Profile endpoints
  async getAdminProfile(): Promise<AdminProfile | null> {
    try {
      const response = await adminApi.get('/admin/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createAdminProfile(profileData: CreateAdminProfileDto): Promise<AdminProfile> {
    const response = await adminApi.post('/admin/profile', profileData);
    return response.data;
  },

  async updateAdminProfile(profileData: UpdateAdminProfileDto): Promise<AdminProfile> {
    const response = await adminApi.put('/admin/profile', profileData);
    return response.data;
  },
};
