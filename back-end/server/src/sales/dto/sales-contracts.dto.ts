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

export interface CreateMilestoneDto {
  title: string;
  amount: number;
  dueDate: string;
}

export interface UpdateMilestoneDto {
  title?: string;
  amount?: number;
  dueDate?: string;
  status?: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completedAt?: string;
}

export interface CreateDocumentDto {
  name: string;
  type: string;
  fileUrl: string;
}

export interface SalesContractResponseDto {
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
  milestones: MilestoneResponseDto[];
  documents: DocumentResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneResponseDto {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completedAt?: string;
}

export interface DocumentResponseDto {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadDate: string;
}
