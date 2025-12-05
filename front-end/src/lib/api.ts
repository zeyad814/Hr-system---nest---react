import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');

      // Only redirect if not already on login/register pages to prevent infinite loops
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    // Normalize/translate backend error messages to current UI language
    try {
      const lang = (localStorage.getItem('language') || 'en').toLowerCase();
      const msg = error?.response?.data?.message;
      if (typeof msg === 'string') {
        const isArabic = /[\u0600-\u06FF]/.test(msg);
        if (lang === 'en' && isArabic) {
          const map: Record<string, string> = {
            'فشل في تحميل بيانات الإيرادات': 'Failed to load revenue data',
            'حدث خطأ غير متوقع': 'An unexpected error occurred',
            'غير مصرح': 'Unauthorized',
            'غير مسموح': 'Forbidden',
            'لم يتم العثور على البيانات': 'Data not found',
            'فشل الحفظ': 'Failed to save',
            'فشل التحديث': 'Failed to update',
            'فشل الحذف': 'Failed to delete',
            'حدث خطأ في الخادم': 'Server error',
          };
          const translated = map[msg] || 'An error occurred. Please try again.';
          if (error.response?.data) {
            error.response.data.message = translated;
          }
        }
      }
    } catch {}
    return Promise.reject(error);
  }
);

export default api;
