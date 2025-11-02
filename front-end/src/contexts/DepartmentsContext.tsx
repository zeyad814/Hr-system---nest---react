import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  requirements: string;
  jobCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentsContextType {
  departments: Department[];
  loading: boolean;
  addDepartment: (department: Omit<Department, 'id' | 'jobCount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDepartment: (id: string, department: Omit<Department, 'id' | 'jobCount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  refreshDepartments: () => Promise<void>;
}

const DepartmentsContext = createContext<DepartmentsContextType | undefined>(undefined);

export const useDepartments = () => {
  const context = useContext(DepartmentsContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentsProvider');
  }
  return context;
};

interface DepartmentsProviderProps {
  children: ReactNode;
}

export const DepartmentsProvider = ({ children }: DepartmentsProviderProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load departments from localStorage on mount
  useEffect(() => {
    loadDepartmentsFromStorage();
  }, []);

  const loadDepartmentsFromStorage = () => {
    try {
      const stored = localStorage.getItem('client_departments');
      if (stored) {
        const parsedDepartments = JSON.parse(stored);
        setDepartments(parsedDepartments);
      } else {
        // Initialize with default departments
        const defaultDepartments: Department[] = [
          {
            id: "1",
            name: "التطوير",
            description: "قسم متخصص في تطوير البرمجيات والتطبيقات",
            requirements: "خبرة في البرمجة، معرفة بلغات البرمجة الحديثة، خبرة في قواعد البيانات",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "التصميم",
            description: "قسم متخصص في التصميم الجرافيكي والواجهات",
            requirements: "خبرة في أدوات التصميم، معرفة بمبادئ التصميم، إبداع وخيال",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "3",
            name: "التسويق",
            description: "قسم متخصص في التسويق الرقمي والتقليدي",
            requirements: "خبرة في التسويق، معرفة بمنصات التواصل الاجتماعي، مهارات تحليلية",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setDepartments(defaultDepartments);
        localStorage.setItem('client_departments', JSON.stringify(defaultDepartments));
      }
    } catch (error) {
      console.error('Error loading departments from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDepartmentsToStorage = (newDepartments: Department[]) => {
    try {
      localStorage.setItem('client_departments', JSON.stringify(newDepartments));
    } catch (error) {
      console.error('Error saving departments to storage:', error);
    }
  };

  const addDepartment = async (departmentData: Omit<Department, 'id' | 'jobCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDepartment: Department = {
        ...departmentData,
        id: Date.now().toString(),
        jobCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      saveDepartmentsToStorage(updatedDepartments);

      toast({
        title: "تم الإضافة",
        description: "تم إضافة القسم بنجاح",
      });
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة القسم",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDepartment = async (id: string, departmentData: Omit<Department, 'id' | 'jobCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedDepartments = departments.map(dept => 
        dept.id === id 
          ? { ...dept, ...departmentData, updatedAt: new Date().toISOString() }
          : dept
      );
      
      setDepartments(updatedDepartments);
      saveDepartmentsToStorage(updatedDepartments);

      toast({
        title: "تم التحديث",
        description: "تم تحديث القسم بنجاح",
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث القسم",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      setDepartments(updatedDepartments);
      saveDepartmentsToStorage(updatedDepartments);

      toast({
        title: "تم الحذف",
        description: "تم حذف القسم بنجاح",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف القسم",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshDepartments = async () => {
    setLoading(true);
    loadDepartmentsFromStorage();
  };

  return (
    <DepartmentsContext.Provider value={{
      departments,
      loading,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      refreshDepartments
    }}>
      {children}
    </DepartmentsContext.Provider>
  );
};
