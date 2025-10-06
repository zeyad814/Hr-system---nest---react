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

export interface SalesTargetResponseDto {
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
