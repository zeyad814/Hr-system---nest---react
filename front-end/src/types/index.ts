// Export all type definitions

export * from './job';

// Common types that might be used across the application
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "HR" | "SALES" | "CLIENT" | "APPLICANT";

export interface Client {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resume?: string;
  skills?: string;
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// API error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Filter and sort types
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filters?: FilterOption[];
  search?: string;
}