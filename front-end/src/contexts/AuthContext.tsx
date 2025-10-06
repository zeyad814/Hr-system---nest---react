import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshToken: () => Promise<boolean>;
  validateToken: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing token on mount and validate it
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Validate token
          if (validateToken()) {
            setUser(parsedUser);
          } else {
            // Try to refresh token
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Token refresh failed, clear auth data
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              localStorage.removeItem('token_expiry');
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('token_expiry');
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3000/api';
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('فشل في تسجيل الدخول');
      }

      const data = await response.json();
      
      // Store token and user data with expiry
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Calculate and store token expiry (1 hour from now)
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      setUser(data.user);
      
      toast({
        title: 'نجح تسجيل الدخول',
        description: 'مرحباً بك في النظام',
      });

      // Navigate based on user role
      switch (data.user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'HR':
          navigate('/hr');
          break;
        case 'CLIENT':
          navigate('/client');
          break;
        case 'APPLICANT':
          navigate('/applicant');
          break;
        case 'SALES':
          navigate('/sales');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: 'يرجى التحقق من بياناتك والمحاولة مرة أخرى',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Validate if token is still valid
  const validateToken = (): boolean => {
    const token = localStorage.getItem('access_token');
    const expiryTime = localStorage.getItem('token_expiry');
    
    if (!token || !expiryTime) {
      return false;
    }
    
    const now = Date.now();
    const expiry = parseInt(expiryTime);
    
    // Check if token is expired (with 5 minute buffer)
    return now < (expiry - 5 * 60 * 1000);
  };
  
  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem('access_token');
      if (!currentToken) {
        return false;
      }
      
      const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3000/api';
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update stored token and expiry
        localStorage.setItem('access_token', data.access_token);
        const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour
        localStorage.setItem('token_expiry', expiryTime.toString());
        
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.log('Token refresh failed');
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };
  
  const logout = () => {
    // Clear stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    
    // Clear user state
    setUser(null);
    
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم تسجيل خروجك بنجاح',
    });
    
    // Navigate to login page
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    refreshToken,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;