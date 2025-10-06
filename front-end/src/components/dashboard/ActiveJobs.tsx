import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { ActiveJobsApiService, ActiveJob } from '../../services/activeJobsApi';
import { MapPin, Calendar, Users, DollarSign, Building, Clock, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ActiveJobsProps {
  clientId?: string;
  showClientFilter?: boolean;
  maxJobs?: number;
}

const ActiveJobs: React.FC<ActiveJobsProps> = ({ 
  clientId, 
  showClientFilter = false, 
  maxJobs = 10 
}) => {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    navigate(`/admin/jobs/${jobId}`);
  };

  useEffect(() => {
    fetchActiveJobs();
  }, [clientId]);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activeJobs = await ActiveJobsApiService.getActiveJobs(clientId);
      setJobs(activeJobs.slice(0, maxJobs));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل الوظائف النشطة');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full_time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'internship':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            الوظائف النشطة
          </CardTitle>
          <CardDescription>
            جاري تحميل الوظائف المتاحة حالياً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            الوظائف النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={fetchActiveJobs} 
            className="mt-4"
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {t('admin.dashboard.activeJobsCount' )} ({ jobs.length })
        </CardTitle>
        <CardDescription>
          {t('admin.dashboard.activeJobsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('admin.dashboard.noActiveJobs')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                      {job.location && (
                        <>
                          <span>•</span>
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status === 'active' ? 'نشط' : job.status}
                    </Badge>
                    <Badge className={getJobTypeColor(job.jobType)}>
                      {job.jobType === 'full_time' ? 'دوام كامل' : 
                       job.jobType === 'part_time' ? 'دوام جزئي' : 
                       job.jobType === 'contract' ? 'عقد' : 
                       job.jobType === 'internship' ? 'تدريب' : job.jobType}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">الراتب:</span>
                    <span>{job.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">المتقدمين:</span>
                    <span>{job._count.applications}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">آخر موعد:</span>
                    <span>{formatDate(job.applicationDeadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">تاريخ النشر:</span>
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                </div>

                {job.department && (
                  <div className="mb-3">
                    <Badge variant="outline">{job.department}</Badge>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {job.description}
                </p>

                {job.requiredSkills && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">المهارات المطلوبة: </span>
                    <span className="text-sm text-gray-600">{job.requiredSkills}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    العميل: {job.client.name}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveJobs;