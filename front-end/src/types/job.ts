// Job Types and Interfaces

export type JobStatus = "OPEN" | "CLOSED" | "HIRED";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE";

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: JobType;
  department?: string;
  experienceLevel?: ExperienceLevel;
  remoteWorkAvailable?: boolean;
  description: string;
  requirements: string;
  requiredSkills?: string;
  salaryRange: string;
  applicationDeadline: string;
  status: JobStatus;
  clientId: string;
  client?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  applications?: JobApplication[];
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  locationLink: string;
  jobType: JobType;
  department: string;
  experienceLevel: ExperienceLevel;
  remoteWorkAvailable: boolean;
  description: string;
  requirements: string;
  requiredSkills: string;
  salaryRange: string;
  applicationDeadline: string;
  clientId: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: JobType;
  department?: string;
  experienceLevel?: ExperienceLevel;
  remoteWorkAvailable?: boolean;
  description: string;
  requirements: string;
  requiredSkills?: string;
  salaryRange: string;
  applicationDeadline: string;
  clientId: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  applicant?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    resume?: string;
  };
}

export type ApplicationStatus = "PENDING" | "REVIEWED" | "INTERVIEWED" | "REJECTED" | "HIRED";

export interface JobFilters {
  status?: JobStatus;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  remoteWorkAvailable?: boolean;
  department?: string;
  clientId?: string;
  search?: string;
}

export interface JobStatistics {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  hiredJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  jobsByType: Record<JobType, number>;
  jobsByExperienceLevel: Record<ExperienceLevel, number>;
}

// Helper functions for job types
export const getJobTypeLabel = (jobType: JobType): string => {
  switch (jobType) {
    case "FULL_TIME":
      return "دوام كامل";
    case "PART_TIME":
      return "دوام جزئي";
    case "CONTRACT":
      return "عقد";
    case "FREELANCE":
      return "عمل حر";
    default:
      return jobType;
  }
};

export const getExperienceLevelLabel = (level: ExperienceLevel): string => {
  switch (level) {
    case "ENTRY":
      return "مبتدئ";
    case "MID":
      return "متوسط";
    case "SENIOR":
      return "خبير";
    case "LEAD":
      return "قائد فريق";
    default:
      return level;
  }
};

export const getJobStatusLabel = (status: JobStatus): string => {
  switch (status) {
    case "OPEN":
      return "مفتوحة";
    case "CLOSED":
      return "مغلقة";
    case "HIRED":
      return "تم التوظيف";
    default:
      return status;
  }
};

export const getApplicationStatusLabel = (status: ApplicationStatus): string => {
  switch (status) {
    case "PENDING":
      return "قيد المراجعة";
    case "REVIEWED":
      return "تمت المراجعة";
    case "INTERVIEWED":
      return "تمت المقابلة";
    case "REJECTED":
      return "مرفوض";
    case "HIRED":
      return "تم التوظيف";
    default:
      return status;
  }
};

// Default form data
export const getDefaultJobFormData = (): JobFormData => ({
  title: "",
  company: "",
  location: "",
  locationLink: "",
  jobType: "FULL_TIME",
  department: "",
  experienceLevel: "ENTRY",
  remoteWorkAvailable: false,
  description: "",
  requirements: "",
  requiredSkills: "",
  salaryRange: "",
  applicationDeadline: "",
  clientId: ""
});

// Validation helpers
export const validateJobFormData = (data: JobFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.title.trim()) errors.push("عنوان الوظيفة مطلوب");
  if (!data.company.trim()) errors.push("اسم الشركة مطلوب");
  if (!data.location.trim()) errors.push("الموقع مطلوب");
  if (!data.description.trim()) errors.push("وصف الوظيفة مطلوب");
  if (!data.requirements.trim()) errors.push("متطلبات الوظيفة مطلوبة");
  if (!data.salaryRange.trim()) errors.push("نطاق الراتب مطلوب");
  if (!data.applicationDeadline) errors.push("آخر موعد للتقديم مطلوب");
  if (!data.clientId) errors.push("العميل مطلوب");
  
  // Validate application deadline is in the future
  if (data.applicationDeadline) {
    const deadline = new Date(data.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
      errors.push("آخر موعد للتقديم يجب أن يكون في المستقبل");
    }
  }
  
  return errors;
};