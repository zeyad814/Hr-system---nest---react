import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance for Client API
const clientApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
clientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
clientApi.interceptors.response.use(
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

// Types based on Prisma schema
export interface Client {
  id: string;
  userId?: string;
  name: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  description?: string;
  logo?: string;
  establishedYear?: number;
  employees?: string;
  revenue?: string;
  status: 'NEW' | 'NEGOTIATION' | 'SIGNED' | 'NOT_INTERESTED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: string;
  department?: string;
  experienceLevel?: string;
  remoteWorkAvailable: boolean;
  description: string;
  requirements: string;
  requiredSkills?: string;
  salaryRange: string;
  applicationDeadline: string;
  clientId: string;
  client?: Client;
  status: 'OPEN' | 'CLOSED' | 'HIRED';
  createdAt: string;
  updatedAt: string;
  applications?: JobApplication[];
}

export interface Applicant {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  location?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  skills?: string;
  experience?: string;
  education?: string;
  languages?: string;
  portfolio?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  avatar?: string;
  rating?: number;
  resumeUrl?: string;
  coverLetter?: string;
  expectedSalary?: string;
  availableFrom?: string;
  workType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'PENDING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  applicant?: Applicant;
}

export interface Note {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface Reminder {
  id: string;
  clientId: string;
  title: string;
  remindAt: string;
  done: boolean;
  createdAt: string;
  client?: Client;
}

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  type: 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER';
  status: 'DRAFT' | 'PENDING' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  value?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  signedAt?: string;
  fileUrl?: string;
  commission?: number;
  commissionType?: string;
  assignedTo?: string;
  jobTitle?: string;
  progress?: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface Revenue {
  id: string;
  clientId: string;
  amount: number;
  periodMonth?: number;
  periodYear?: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  experience?: string;
  rating?: number;
  status?: string;
  avatar?: string;
}

export interface ClientContract {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  startDate: string;
  endDate: string;
  salary: string;
  contractType: string;
  duration: string;
  status: string;
  signedDate: string;
  department: string;
  probationPeriod: string;
  benefits: string[];
}

export interface JobRequest {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  status: string;
  submittedDate: string;
  expectedApproval: string;
  description?: string;
  requirements?: string;
  positions?: number;
}

// Client API Service
export const clientApiService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await clientApi.get('/client/dashboard/stats');
    return response.data;
  },

  // Jobs Management - Updated to match backend endpoints
  getJobs: async () => {
    const response = await clientApi.get('/client/jobs');
    return response.data;
  },

  getActiveJobs: async () => {
    const response = await clientApi.get('/client/dashboard/stats');
    return response.data.activeJobs || [];
  },

  getClientJobs: async () => {
    const response = await clientApi.get('/client/jobs');
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await clientApi.post('/client/jobs', jobData);
    return response.data;
  },

  createClientJob: async (jobData: Partial<Job>) => {
    const response = await clientApi.post('/client/jobs', jobData);
    return response.data;
  },

  updateJob: async (jobId: string, jobData: Partial<Job>) => {
    const response = await clientApi.put(`/client/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId: string) => {
    const response = await clientApi.delete(`/client/jobs/${jobId}`);
    return response.data;
  },

  changeJobStatus: async (jobId: string, status: 'OPEN' | 'CLOSED' | 'HIRED') => {
    const response = await clientApi.patch(`/client/jobs/${jobId}/status`, { status });
    return response.data;
  },

  // Candidates Management
  getCandidates: async () => {
    const response = await clientApi.get('/client/candidates');
    return response.data;
  },

  getCandidateById: async (candidateId: string) => {
    const response = await clientApi.get(`/client/candidates/${candidateId}`);
    return response.data;
  },

  // Toggle candidate favorite status
  toggleCandidateFavorite: async (candidateId: string) => {
    const response = await clientApi.post(`/client/candidates/${candidateId}/favorite`);
    return response.data;
  },

  // Job Applications
  getJob: async (jobId: string) => {
    const response = await clientApi.get(`/client/jobs/${jobId}`);
    return response.data;
  },

  getJobApplications: async (jobId: string) => {
    const response = await clientApi.get(`/client/jobs/${jobId}/applications`);
    return response.data;
  },

  getJobApplication: async (applicationId: string) => {
    const response = await clientApi.get(`/client/applications/${applicationId}`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    const response = await clientApi.patch(`/client/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  },

  acceptApplication: async (applicationId: string) => {
    const response = await clientApi.post(`/client/applications/${applicationId}/accept`);
    return response.data;
  },

  rejectApplication: async (applicationId: string, reason?: string) => {
    const response = await clientApi.post(`/client/applications/${applicationId}/reject`, { reason });
    return response.data;
  },

  // Feedback Management
  submitFeedback: async (feedbackData: {
    applicationId: string;
    feedbackText: string;
    feedbackType: 'positive' | 'negative';
  }) => {
    const response = await clientApi.post('/client/feedback', feedbackData);
    return response.data;
  },

  // Interview Management
  getInterviews: async () => {
    const response = await clientApi.get('/client/interviews');
    return response.data;
  },

  scheduleInterview: async (interviewData: any) => {
    const response = await clientApi.post('/client/interviews', interviewData);
    return response.data;
  },

  updateInterview: async (interviewId: string, interviewData: any) => {
    const response = await clientApi.put(`/client/interviews/${interviewId}`, interviewData);
    return response.data;
  },

  cancelInterview: async (interviewId: string) => {
    const response = await clientApi.delete(`/client/interviews/${interviewId}`);
    return response.data;
  },

  // Reports
  getReports: async (params?: any) => {
    const response = await clientApi.get('/client/reports', { params });
    return response.data;
  },

  getJobPerformance: async (params?: any) => {
    const response = await clientApi.get('/client/reports/job-performance', { params });
    return response.data;
  },

  getApplicationTrends: async (params?: any) => {
    const response = await clientApi.get('/client/reports/application-trends', { params });
    return response.data;
  },

  // Profile Management - Updated to match backend endpoints
  getProfile: async () => {
    const response = await clientApi.get('/client/profile');
    return response.data;
  },

  updateProfile: async (profileData: Partial<Client>) => {
    const response = await clientApi.put('/client/profile', profileData);
    return response.data;
  },

  createOrUpdateProfile: async (profileData: Partial<Client>) => {
    const response = await clientApi.post('/client/profile', profileData);
    return response.data;
  },

  // Notes Management - Updated to use client ID from backend
  getNotes: async (clientId?: string) => {
    const response = await clientApi.get('/client/notes');
    return response.data;
  },

  addNote: async (clientId: string, content: string) => {
    const response = await clientApi.post('/client/notes', { content });
    return response.data;
  },

  // Reminders Management - Updated to use client ID from backend
  getReminders: async (clientId?: string) => {
    const response = await clientApi.get('/client/reminders');
    return response.data;
  },

  addReminder: async (clientId: string, reminderData: { title: string; remindAt: string }) => {
    const response = await clientApi.post('/client/reminders', reminderData);
    return response.data;
  },

  // Contracts Management - Updated to use client ID from backend
  getContracts: async (clientId?: string) => {
    const response = await clientApi.get('/client/contracts');
    return response.data;
  },

  addContract: async (clientId: string, contractData: { title: string; fileUrl?: string; signedAt?: string }) => {
    const response = await clientApi.post('/client/contracts', contractData);
    return response.data;
  },

  // Revenues Management - Updated to use client ID from backend
  getRevenues: async (clientId?: string) => {
    const response = await clientApi.get('/client/revenues');
    return response.data;
  },

  addRevenue: async (clientId: string, revenueData: { amount: string; periodMonth?: number; periodYear?: number }) => {
    const response = await clientApi.post('/client/revenues', revenueData);
    return response.data;
  },

  // Client Contracts (different from above)
  getClientContracts: async () => {
    const response = await clientApi.get('/client/contracts');
    return response.data;
  },

  getContractById: async (contractId: string) => {
    const response = await clientApi.get(`/client/contracts/${contractId}`);
    return response.data;
  },

  updateContractStatus: async (contractId: string, status: string) => {
    const response = await clientApi.patch(`/client/contracts/${contractId}/status`, { status });
    return response.data;
  },

  renewContract: async (contractId: string, renewalData: any) => {
    const response = await clientApi.post(`/client/contracts/${contractId}/renew`, renewalData);
    return response.data;
  },

  downloadContract: async (contractId: string) => {
    const response = await clientApi.get(`/client/contracts/${contractId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getContractStats: async () => {
    const response = await clientApi.get('/client/contracts/stats');
    return response.data;
  },

  // Job Requests Management - Updated to match backend endpoints
  getJobRequests: async () => {
    const response = await clientApi.get('/client/job-requests');
    return response.data;
  },

  getJobRequest: async (requestId: string) => {
    const response = await clientApi.get(`/client/job-requests/${requestId}`);
    return response.data;
  },

  createJobRequest: async (requestData: Partial<JobRequest>) => {
    console.log('=== CLIENT API CREATE JOB REQUEST ===');
    console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
    
    const response = await clientApi.post('/client/job-requests', requestData);
    
    console.log('API Response:', response.data);
    return response.data;
  },

  updateJobRequest: async (requestId: string, requestData: Partial<JobRequest>) => {
    const response = await clientApi.put(`/client/job-requests/${requestId}`, requestData);
    return response.data;
  },

  deleteJobRequest: async (requestId: string) => {
    const response = await clientApi.delete(`/client/job-requests/${requestId}`);
    return response.data;
  },

  getJobRequestStats: async () => {
    const response = await clientApi.get('/client/job-requests/stats');
    return response.data;
  },

  // Recent Activities
  getRecentActivities: async () => {
    const response = await clientApi.get('/client/activities/recent');
    return response.data;
  },
};

export default clientApiService;