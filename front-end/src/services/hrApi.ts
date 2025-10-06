import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance for HR API
const hrApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
hrApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
hrApi.interceptors.response.use(
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
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  type: string;
  status: 'OPEN' | 'CLOSED' | 'HIRED';
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
  applications?: JobApplication[];
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  appliedAt: string;
  applicant: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  job: Job;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledBy: string;
  interviewerIds: string[];
  candidateId: string;
  title: string;
  description?: string;
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR' | 'FINAL';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  duration: number;
  location?: string;
  notes?: string;
  attendanceNotes?: string;
  report?: string;
  reminderSent: boolean;
  application: {
    job: {
      id: string;
      title: string;
    };
    applicant: {
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
  candidate: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  scheduledByUser: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'APPLICANT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  applications: JobApplication[];
  interviews: Interview[];
}

export interface ApplicantStats {
  totalApplicants: number;
  totalApplications: number;
  recentApplicants: number;
  statusBreakdown: Record<string, number>;
}

export interface HRStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  scheduledInterviews: number;
  completedInterviews: number;
  hiredCandidates: number;
  rejectedApplications: number;
}

// Reports Interfaces
export interface DashboardStats {
  newClientsCount: number;
  openJobsCount: number;
  closedJobsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  salesRepTargetAchievement: number;
}

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  contractsCount: number;
}

export interface SalesRepPerformance {
  repId: string;
  repName: string;
  newClientsCount: number;
  signedContractsCount: number;
  totalRevenue: number;
  targetAchievement: number;
  target: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  newClients: number;
  signedContracts: number;
  revenue: number;
}

export interface HiringStats {
  totalApplications: number;
  hiredCount: number;
  rejectedCount: number;
  interviewCount: number;
  pendingCount: number;
  hiringSuccessRate: number;
}

export interface InterviewStats {
  totalInterviews: number;
  attendedInterviews: number;
  noShowInterviews: number;
  cancelledInterviews: number;
  attendanceRate: number;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface HRSummaryReport {
  hiringStats: HiringStats;
  interviewStats: InterviewStats;
  jobsStatus: { openJobs: number; closedJobs: number };
}

export interface HRProfile {
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
  skills: string[];
  experience?: string;
  education?: string;
  certifications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateHRProfileData {
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

export interface UpdateHRProfileData {
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

// HR API functions
export const hrApiService = {
  // Jobs
  async getJobs(clientId?: string): Promise<{ data: Job[] }> {
    const params = clientId ? { clientId } : {};
    const response = await hrApi.get('/jobs', { params });
    return { data: response.data };
  },

  async getJob(id: string): Promise<Job> {
    const response = await hrApi.get(`/jobs/${id}`);
    return response.data;
  },

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const response = await hrApi.get(`/applicants/candidates/for-job/${jobId}`);
    return response.data;
  },

  async getJobDetails(jobId: string): Promise<any> {
    const response = await hrApi.get(`/jobs/${jobId}`);
    return response.data;
  },

  async getJobStatistics(jobId: string): Promise<any> {
    const response = await hrApi.get(`/jobs/${jobId}/statistics`);
    return response.data;
  },

  async getCandidatesForJob(jobId: string, status?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const response = await hrApi.get(`/applicants/candidates/for-job/${jobId}?${params.toString()}`);
    return response.data;
  },

  async getJobById(jobId: string): Promise<any> {
    const response = await hrApi.get(`/jobs/${jobId}`);
    return response.data;
  },

  async downloadResume(resumeUrl: string): Promise<any> {
    // Handle different URL formats for file access
    let fileUrl = resumeUrl;
    
    // If it's a relative path, construct the full URL
    if (resumeUrl.startsWith('/uploads/')) {
      fileUrl = `http://localhost:3000${resumeUrl}`;
    }
    // If it contains the API prefix, remove it
    else if (resumeUrl.includes('http://localhost:3000/api/uploads/')) {
      fileUrl = resumeUrl.replace('http://localhost:3000/api/', 'http://localhost:3000/');
    }
    
    // Use axios with authentication headers
    const token = localStorage.getItem('access_token');
    const response = await axios.get(fileUrl, {
      responseType: 'blob',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    return response;
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<JobApplication> {
    const response = await hrApi.patch(`/jobs/applications/${applicationId}/status`, { status });
    return response.data;
  },

  // Interviews
  async getInterviews(filters?: {
    status?: string;
    type?: string;
    candidateId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: Interview[] }> {
    const response = await hrApi.get('/interviews', { params: filters });
    return { data: response.data };
  },

  async createInterview(data: {
    applicantId: string;
    scheduledAt: string;
    type: string;
    status: string;
  }): Promise<{ data: Interview }> {
    const response = await hrApi.post('/interviews', data);
    return { data: response.data };
  },

  async getInterview(id: string): Promise<Interview> {
    const response = await hrApi.get(`/interviews/${id}`);
    return response.data;
  },

  async scheduleInterview(data: {
    applicationId: string;
    title: string;
    description?: string;
    type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR' | 'FINAL';
    scheduledAt: string;
    duration?: number;
    location?: string;
    notes?: string;
    interviewerIds?: string[];
  }): Promise<Interview> {
    const response = await hrApi.post('/interviews', data);
    return response.data;
  },

  async updateInterview(id: string, data: {
    title?: string;
    description?: string;
    type?: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR' | 'FINAL';
    scheduledAt?: string;
    duration?: number;
    location?: string;
    notes?: string;
    interviewerIds?: string[];
  }): Promise<Interview> {
    const response = await hrApi.put(`/interviews/${id}`, data);
    return response.data;
  },

  async updateInterviewStatus(id: string, status: string, data?: {
    attendanceNotes?: string;
    report?: string;
  }): Promise<Interview> {
    const response = await hrApi.put(`/interviews/${id}/status`, { status, ...data });
    return response.data;
  },

  async getUpcomingInterviews(hours?: number): Promise<Interview[]> {
    const params = hours ? { hours: hours.toString() } : {};
    const response = await hrApi.get('/interviews/upcoming', { params });
    return response.data;
  },

  async getCandidateInterviews(candidateId: string): Promise<Interview[]> {
    const response = await hrApi.get(`/interviews/candidate/${candidateId}`);
    return response.data;
  },

  // Get all applicants
  getApplicants: async (status?: string, search?: string): Promise<{ data: Applicant[] }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await hrApi.get(`/applicants/all?${params.toString()}`);
    return { data: response.data };
  },

  // Get all applicants (alias for compatibility)
  getAllApplicants: async (status?: string, search?: string): Promise<Applicant[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await hrApi.get(`/applicants/all?${params.toString()}`);
    return response.data;
  },

  async getApplicantProfile(applicantId: string): Promise<Applicant> {
    const response = await hrApi.get(`/applicants/profile/${applicantId}`);
    return response.data;
  },

  async updateApplicantStatus(userId: string, status: string, notes?: string): Promise<Applicant> {
    const response = await hrApi.patch(`/applicants/${userId}/status`, { status, notes });
    return response.data;
  },

  async recommendApplicant(applicantId: string, clientId: string, notes?: string): Promise<any> {
    const response = await hrApi.post('/applicants/recommend', {
      applicantId,
      clientId,
      notes
    });
    return response.data;
  },

  async updateApplicantRating(userId: string, rating: number): Promise<Applicant> {
    const response = await hrApi.patch(`/applicants/${userId}/rating`, { rating });
    return response.data;
  },

  async getApplicantsStats(): Promise<ApplicantStats> {
    const response = await hrApi.get('/applicants/stats');
    return response.data;
  },

  // Clients
  async getClients(): Promise<{ data: any[] }> {
    const response = await hrApi.get('/clients');
    return { data: response.data };
  },

  // Users
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const response = await hrApi.get('/users', { params });
    return response.data;
  },

  async getUserStats(): Promise<any> {
    const response = await hrApi.get('/users/stats');
    return response.data;
  },

  // HR Statistics
  async getHRStats(): Promise<HRStats> {
    try {
      // Get jobs data
      const jobsResponse = await hrApi.get('/jobs');
      const jobs = jobsResponse.data;
      
      // Get interviews data
      const interviewsResponse = await hrApi.get('/interviews');
      const interviews = interviewsResponse.data;
      
      // Get all applications from jobs
      let allApplications: JobApplication[] = [];
      for (const job of jobs) {
        try {
          const applicationsResponse = await hrApi.get(`/jobs/${job.id}/applications`);
          allApplications = [...allApplications, ...applicationsResponse.data];
        } catch (error) {
          console.warn(`Failed to fetch applications for job ${job.id}:`, error);
        }
      }
      
      // Calculate statistics
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((job: Job) => job.status === 'OPEN').length;
      const totalApplications = allApplications.length;
      
      // Get new applications (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const newApplications = allApplications.filter(
        (app: JobApplication) => new Date(app.appliedAt) > weekAgo
      ).length;
      
      const scheduledInterviews = interviews.filter(
        (interview: Interview) => interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED'
      ).length;
      
      const completedInterviews = interviews.filter(
        (interview: Interview) => interview.status === 'COMPLETED'
      ).length;
      
      const hiredCandidates = allApplications.filter(
        (app: JobApplication) => app.status === 'HIRED'
      ).length;
      
      const rejectedApplications = allApplications.filter(
        (app: JobApplication) => app.status === 'REJECTED'
      ).length;
      
      return {
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications,
        scheduledInterviews,
        completedInterviews,
        hiredCandidates,
        rejectedApplications,
      };
    } catch (error) {
      console.error('Error fetching HR stats:', error);
      // Return default stats if API fails
      return {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        scheduledInterviews: 0,
        completedInterviews: 0,
        hiredCandidates: 0,
        rejectedApplications: 0,
      };
    }
  },

  // Reports API functions
  async getDashboardStats(filters?: DateRangeFilter): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/dashboard?${params.toString()}`);
    return response.data;
  },

  async getHiringStats(filters?: DateRangeFilter): Promise<HiringStats> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/hiring-stats?${params.toString()}`);
    return response.data;
  },

  async getInterviewStats(filters?: DateRangeFilter): Promise<InterviewStats> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/interview-stats?${params.toString()}`);
    return response.data;
  },

  async getHRSummaryReport(filters?: DateRangeFilter): Promise<HRSummaryReport> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/hr-summary?${params.toString()}`);
    return response.data;
  },

  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    const response = await hrApi.get(`/reports/monthly-stats?year=${year}`);
    return response.data;
  },

  async getRevenueByClient(filters?: DateRangeFilter): Promise<RevenueByClient[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/revenue-by-client?${params.toString()}`);
    return response.data;
  },

  async getSalesRepPerformance(filters?: DateRangeFilter): Promise<SalesRepPerformance[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/sales-rep-performance?${params.toString()}`);
    return response.data;
  },

  async getTotalRevenue(filters?: DateRangeFilter): Promise<{ totalRevenue: number }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/total-revenue?${params.toString()}`);
    return response.data;
  },

  async getJobsStatus(filters?: DateRangeFilter): Promise<{ openJobs: number; closedJobs: number }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await hrApi.get(`/reports/jobs-status?${params.toString()}`);
    return response.data;
  },

  // HR Profile Management
  async getHRProfile(): Promise<HRProfile> {
    const response = await hrApi.get('/hr/profile');
    return response.data;
  },

  async createHRProfile(profileData: CreateHRProfileData): Promise<HRProfile> {
    const response = await hrApi.post('/hr/profile', profileData);
    return response.data;
  },

  async updateHRProfile(profileData: UpdateHRProfileData): Promise<HRProfile> {
    const response = await hrApi.put('/hr/profile', profileData);
    return response.data;
  },
};

export default hrApiService;