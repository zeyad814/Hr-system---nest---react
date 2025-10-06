import { apiService } from './apiService';

// Types for Active Jobs and Top Candidates
export interface ActiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: string;
  department?: string;
  experienceLevel?: string;
  remoteWorkAvailable?: boolean;
  description: string;
  requirements: string;
  requiredSkills?: string;
  salaryRange: string;
  applicationDeadline: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  _count: {
    applications: number;
  };
}

export interface TopCandidate {
  applicationId: string;
  status: string;
  appliedAt: Date;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    skills?: string;
    experience?: string;
    rating?: number;
    status: string;
    avatar?: string;
    resumeUrl?: string;
    recentExperiences: Experience[];
    recentEducations: Education[];
  };
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salaryRange: string;
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  achievements?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface JobWithTopCandidates extends ActiveJob {
  topCandidates: TopCandidate[];
}

export interface JobStatistics {
  job: ActiveJob;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
}

export interface CandidateByRating {
  id: string;
  phone?: string;
  location?: string;
  skills?: string;
  experience?: string;
  rating?: number;
  status: string;
  avatar?: string;
  resumeUrl?: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  experiences: Experience[];
  educations: Education[];
  applications: {
    id: string;
    status: string;
    createdAt: Date;
    job: {
      id: string;
      title: string;
      company: string;
    };
  }[];
}

// Active Jobs API Service
export class ActiveJobsApiService {
  // Get all active jobs
  static async getActiveJobs(clientId?: string): Promise<ActiveJob[]> {
    const params = clientId ? { clientId } : {};
    const response = await apiService.get('/jobs/active/list', { params });
    return response.data;
  }

  // Get jobs with top candidates
  static async getJobsWithTopCandidates(
    clientId?: string,
    limit: number = 5
  ): Promise<JobWithTopCandidates[]> {
    const params: any = { limit };
    if (clientId) params.clientId = clientId;
    
    const response = await apiService.get('/jobs/active/with-candidates', { params });
    return response.data;
  }

  // Get job statistics
  static async getJobStatistics(jobId: string): Promise<JobStatistics> {
    const response = await apiService.get(`/jobs/${jobId}/statistics`);
    return response.data;
  }

  // Get top candidates
  static async getTopCandidates(
    limit: number = 10,
    jobId?: string
  ): Promise<TopCandidate[]> {
    const params: any = { limit };
    if (jobId) params.jobId = jobId;
    
    const response = await apiService.get('/applicants/top-candidates', { params });
    return response.data;
  }

  // Get candidates by rating
  static async getCandidatesByRating(
    minRating: number = 4,
    limit: number = 10
  ): Promise<CandidateByRating[]> {
    const params = { minRating, limit };
    const response = await apiService.get('/applicants/candidates/by-rating', { params });
    return response.data;
  }

  // Get recent candidates
  static async getRecentCandidates(
    days: number = 7,
    limit: number = 10
  ): Promise<CandidateByRating[]> {
    const params = { days, limit };
    const response = await apiService.get('/applicants/candidates/recent', { params });
    return response.data;
  }

  // Get candidates for specific job
  static async getCandidatesForJob(
    jobId: string,
    status?: string,
    limit: number = 10
  ): Promise<TopCandidate[]> {
    const params: any = { limit };
    if (status) params.status = status;
    
    const response = await apiService.get(`/applicants/candidates/for-job/${jobId}`, { params });
    return response.data;
  }
}

export default ActiveJobsApiService;