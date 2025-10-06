import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Create axios instance for Applicant API
const applicantApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
applicantApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
applicantApi.interceptors.response.use(
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
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  position?: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  id: string;
  userId: string;
  user: User;
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
  applications?: JobApplication[];
  experiences?: Experience[];
  educations?: Education[];
  projects?: Project[];
  qualifications?: Qualification[];
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  status: 'OPEN' | 'CLOSED' | 'HIRED';
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: Job;
  applicantId: string;
  status: 'PENDING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ApplicationTimeline[];
  feedback?: Feedback[];
  interviews?: Interview[];
}

export interface ApplicationTimeline {
  id: string;
  applicationId: string;
  status: 'PENDING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  notes?: string;
  createdBy: string;
  createdByUser: {
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface Feedback {
  id: string;
  applicationId: string;
  rating?: number;
  comments?: string;
  decision?: 'ACCEPT' | 'REJECT' | 'INTERVIEW' | 'PENDING';
  createdBy: string;
  createdByUser: {
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledBy: string;
  scheduledByUser: {
    name: string;
    role: string;
  };
  interviewerIds: string[];
  candidateId: string;
  title: string;
  description?: string;
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR' | 'FINAL';
  status: 'SCHEDULED' | 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED' | 'RESCHEDULED';
  scheduledAt: string;
  duration: number;
  location?: string;
  notes?: string;
  attendanceNotes?: string;
  report?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  agoraChannelName?: string;
  agoraToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  applicantId: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  applicantId: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  applicantId: string;
  title: string;
  description?: string;
  technologies?: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Qualification {
  id: string;
  applicantId: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateApplicantDto {
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
  coverLetter?: string;
  expectedSalary?: string;
  availableFrom?: string;
  workType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
}

export interface UpdateApplicantDto {
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
  resumeUrl?: string;
  coverLetter?: string;
  expectedSalary?: string;
  availableFrom?: string;
  workType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
}

export interface ApplyToJobDto {
  jobId: string;
  resumeUrl?: string;
}

// API Service
export const applicantApiService = {
  // Profile Management
  async getProfile(): Promise<Applicant> {
    const response = await applicantApi.get('/applicants/profile');
    return response.data;
  },

  async createProfile(data: CreateApplicantDto): Promise<Applicant> {
    const response = await applicantApi.post('/applicants/profile', data);
    return response.data;
  },

  async updateProfile(data: UpdateApplicantDto): Promise<Applicant> {
    const response = await applicantApi.put('/applicants/profile', data);
    return response.data;
  },

  // Job Applications
  async applyToJob(data: ApplyToJobDto): Promise<JobApplication> {
    const response = await applicantApi.post('/applicants/apply', data);
    return response.data;
  },

  async getMyApplications(): Promise<JobApplication[]> {
    const response = await applicantApi.get('/applicants/applications');
    return response.data;
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    await applicantApi.patch(`/applicants/applications/${applicationId}/withdraw`);
  },

  // Application Details
  async getApplicationById(applicationId: string): Promise<JobApplication> {
    const response = await applicantApi.get(`/applicants/applications/${applicationId}`);
    return response.data;
  },

  async getApplicationTimeline(applicationId: string): Promise<ApplicationTimeline[]> {
    const response = await applicantApi.get(`/applicants/applications/${applicationId}/timeline`);
    return response.data;
  },

  async getApplicationFeedback(applicationId: string): Promise<Feedback[]> {
    const response = await applicantApi.get(`/applicants/applications/${applicationId}/feedback`);
    return response.data;
  },

  // Interviews
  async getMyInterviews(): Promise<Interview[]> {
    const response = await applicantApi.get('/interviews/applicant');
    return response.data;
  },

  // Available Jobs (from applicant controller)
  async getAvailableJobs(): Promise<Job[]> {
    const response = await applicantApi.get('/jobs/available');
    return response.data;
  },

  async getJobById(jobId: string): Promise<Job> {
    const response = await applicantApi.get(`/jobs/${jobId}`);
    return response.data;
  },

  // File Upload (placeholder - would need actual implementation)
  async uploadResume(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await applicantApi.post('/applicants/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // New CV upload function using the new API endpoint
  async uploadCV(file: File): Promise<Applicant> {
    const formData = new FormData();
    formData.append('cv', file);
    
    const response = await applicantApi.post('/applicants/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await applicantApi.post('/applicant/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Experience endpoints
  async getExperiences(): Promise<Experience[]> {
    const response = await applicantApi.get('/applicant/experiences');
    return response.data;
  },

  async createExperience(data: Omit<Experience, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
    const response = await applicantApi.post('/applicant/experiences', data);
    return response.data;
  },

  async updateExperience(id: string, data: Partial<Omit<Experience, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>): Promise<Experience> {
    const response = await applicantApi.put(`/applicant/experiences/${id}`, data);
    return response.data;
  },

  async deleteExperience(id: string): Promise<void> {
    await applicantApi.delete(`/applicant/experiences/${id}`);
  },

  // Education endpoints
  async getEducations(): Promise<Education[]> {
    const response = await applicantApi.get('/applicant/educations');
    return response.data;
  },

  async createEducation(data: Omit<Education, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>): Promise<Education> {
    const response = await applicantApi.post('/applicant/educations', data);
    return response.data;
  },

  async updateEducation(id: string, data: Partial<Omit<Education, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>): Promise<Education> {
    const response = await applicantApi.put(`/applicant/educations/${id}`, data);
    return response.data;
  },

  async deleteEducation(id: string): Promise<void> {
    await applicantApi.delete(`/applicant/educations/${id}`);
  },

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    const response = await applicantApi.get('/applicant/projects');
    return response.data;
  },

  async createProject(data: Omit<Project, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await applicantApi.post('/applicant/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>): Promise<Project> {
    const response = await applicantApi.put(`/applicant/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await applicantApi.delete(`/applicant/projects/${id}`);
  },

  // Qualification endpoints
  async getQualifications(): Promise<Qualification[]> {
    const response = await applicantApi.get('/applicant/qualifications');
    return response.data;
  },

  async createQualification(data: Omit<Qualification, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>): Promise<Qualification> {
    const response = await applicantApi.post('/applicant/qualifications', data);
    return response.data;
  },

  async updateQualification(id: string, data: Partial<Omit<Qualification, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>): Promise<Qualification> {
    const response = await applicantApi.put(`/applicant/qualifications/${id}`, data);
    return response.data;
  },

  async deleteQualification(id: string): Promise<void> {
    await applicantApi.delete(`/applicant/qualifications/${id}`);
  },

};

export default applicantApiService;