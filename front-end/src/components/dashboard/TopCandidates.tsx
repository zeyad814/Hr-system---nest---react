import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ActiveJobsApiService, TopCandidate, CandidateByRating } from '../../services/activeJobsApi';
import { Star, MapPin, Calendar, Briefcase, GraduationCap, Phone, Mail, Download, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopCandidatesProps {
  jobId?: string;
  showJobFilter?: boolean;
  maxCandidates?: number;
}

const TopCandidates: React.FC<TopCandidatesProps> = ({ 
  jobId, 
  showJobFilter = false, 
  maxCandidates = 10 
}) => {
  const [topCandidates, setTopCandidates] = useState<TopCandidate[]>([]);
  const [ratedCandidates, setRatedCandidates] = useState<CandidateByRating[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<CandidateByRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('top');
  const { user } = useAuth();

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [topCands, ratedCands, recentCands] = await Promise.all([
        ActiveJobsApiService.getTopCandidates(maxCandidates, jobId),
        ActiveJobsApiService.getCandidatesByRating(4, maxCandidates),
        ActiveJobsApiService.getRecentCandidates(7, maxCandidates)
      ]);
      
      setTopCandidates(topCands);
      setRatedCandidates(ratedCands);
      setRecentCandidates(recentCands);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المرشحين');
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'قيد المراجعة';
      case 'reviewed': return 'تمت المراجعة';
      case 'shortlisted': return 'مرشح نهائي';
      case 'interviewed': return 'تمت المقابلة';
      case 'hired': return 'تم التوظيف';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const renderTopCandidate = (candidate: TopCandidate) => (
    <div key={candidate.applicationId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={candidate.candidate.avatar} />
          <AvatarFallback>
            {candidate.candidate.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{candidate.candidate.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{candidate.candidate.email}</span>
                {candidate.candidate.phone && (
                  <>
                    <span>•</span>
                    <Phone className="h-4 w-4" />
                    <span>{candidate.candidate.phone}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStatusColor(candidate.status)}>
                {getStatusText(candidate.status)}
              </Badge>
              {renderStars(candidate.candidate.rating)}
            </div>
          </div>

          {candidate.candidate.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span>{candidate.candidate.location}</span>
            </div>
          )}

          {candidate.candidate.skills && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">المهارات: </span>
              <span className="text-sm text-gray-600">{candidate.candidate.skills}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium">الوظيفة:</span>
              <span>{candidate.job.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-medium">تاريخ التقديم:</span>
              <span>{formatDate(candidate.appliedAt)}</span>
            </div>
          </div>

          {candidate.candidate.recentExperiences?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">آخر خبرة:</h4>
              <div className="text-sm text-gray-600">
                {candidate.candidate.recentExperiences[0].title} في {candidate.candidate.recentExperiences[0].company}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-sm text-gray-500">
              الشركة: {candidate.job.company}
            </div>
            <div className="flex gap-2">
              {candidate.candidate.resumeUrl && (
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  السيرة الذاتية
                </Button>
              )}
              <Button size="sm">
                عرض الملف الشخصي
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRatedCandidate = (candidate: CandidateByRating) => (
    <div key={candidate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={candidate.avatar} />
          <AvatarFallback>
            {candidate.user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{candidate.user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{candidate.user.email}</span>
                {candidate.phone && (
                  <>
                    <span>•</span>
                    <Phone className="h-4 w-4" />
                    <span>{candidate.phone}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStatusColor(candidate.status)}>
                {getStatusText(candidate.status)}
              </Badge>
              {renderStars(candidate.rating)}
            </div>
          </div>

          {candidate.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span>{candidate.location}</span>
            </div>
          )}

          {candidate.skills && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">المهارات: </span>
              <span className="text-sm text-gray-600">{candidate.skills}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium">الطلبات:</span>
              <span>{candidate.applications.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-medium">تاريخ التسجيل:</span>
              <span>{formatDate(candidate.createdAt)}</span>
            </div>
          </div>

          {candidate.experiences?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">آخر خبرة:</h4>
              <div className="text-sm text-gray-600">
                {candidate.experiences[0].title} في {candidate.experiences[0].company}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-sm text-gray-500">
              {candidate.applications.length > 0 && (
                <span>آخر تقديم: {candidate.applications[0].job.title}</span>
              )}
            </div>
            <div className="flex gap-2">
              {candidate.resumeUrl && (
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  السيرة الذاتية
                </Button>
              )}
              <Button size="sm">
                عرض الملف الشخصي
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            أفضل المرشحين
          </CardTitle>
          <CardDescription>
            جاري تحميل المرشحين المميزين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
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
            <Users className="h-5 w-5" />
            أفضل المرشحين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={fetchCandidates} 
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
          <Users className="h-5 w-5" />
          أفضل المرشحين
        </CardTitle>
        <CardDescription>
          المرشحين المميزين والمؤهلين للوظائف المتاحة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="top">أفضل المرشحين ({topCandidates.length})</TabsTrigger>
            <TabsTrigger value="rated">الأعلى تقييماً ({ratedCandidates.length})</TabsTrigger>
            <TabsTrigger value="recent">الجدد ({recentCandidates.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="top" className="mt-4">
            {topCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد مرشحين متاحين حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCandidates.map(renderTopCandidate)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rated" className="mt-4">
            {ratedCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد مرشحين مقيمين حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratedCandidates.map(renderRatedCandidate)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-4">
            {recentCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد مرشحين جدد خلال الأسبوع الماضي</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCandidates.map(renderRatedCandidate)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TopCandidates;