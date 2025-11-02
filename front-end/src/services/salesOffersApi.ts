import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

const salesOffersApi = axios.create({
  baseURL: `${API_BASE_URL}/sales-offers`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
salesOffersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
salesOffersApi.interceptors.response.use(
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

export interface SalesOffer {
  id: string;
  applicationId: string;
  applicantId: string;
  jobId: string;
  createdBy: string;
  value: number;
  currency: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SALES_REJECTED' | 'SALES_APPROVED';
  applicantResponse?: 'ACCEPTED' | 'REJECTED' | null;
  applicantRejectedAt?: string;
  applicantRejectedNotes?: string;
  salesResponse?: 'APPROVED' | 'REJECTED' | 'PENDING' | null;
  salesRejectedAt?: string;
  salesRejectedNotes?: string;
  salesNewOfferId?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    job?: {
      title: string;
      id: string;
    };
  };
  applicant?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  };
  job?: {
    title: string;
  };
  createdByUser?: {
    name: string;
    email: string;
  };
}

export interface CreateSalesOfferDto {
  applicationId: string;
  applicantId: string;
  jobId: string;
  value: number;
  currency?: string;
  notes?: string;
}

export const salesOffersApiService = {
  // إنشاء عرض جديد
  async create(createDto: CreateSalesOfferDto): Promise<SalesOffer> {
    const response = await salesOffersApi.post('', createDto);
    return response.data;
  },

  // الحصول على جميع العروض (لـ Sales)
  async getAll(): Promise<SalesOffer[]> {
    const response = await salesOffersApi.get('');
    return response.data;
  },

  // الحصول على عروض المتقدم
  async getApplicantOffers(): Promise<SalesOffer[]> {
    const response = await salesOffersApi.get('/applicant');
    return response.data;
  },

  // رد المتقدم على العرض
  async applicantRespond(offerId: string, response: 'ACCEPTED' | 'REJECTED', notes?: string): Promise<SalesOffer> {
    const response_1 = await salesOffersApi.post(`/${offerId}/applicant-response`, {
      response,
      notes,
    });
    return response_1.data;
  },

  // الحصول على طلبات الرفض في انتظار المراجعة
  async getPendingRejections(): Promise<SalesOffer[]> {
    const response = await salesOffersApi.get('/rejections/pending');
    return response.data;
  },

  // مراجعة Sales لطلب الرفض
  async reviewRejection(offerId: string, response: 'APPROVED' | 'REJECTED', notes?: string): Promise<SalesOffer> {
    const response_1 = await salesOffersApi.post(`/${offerId}/review`, {
      response,
      notes,
    });
    return response_1.data;
  },
};

export default salesOffersApiService;

