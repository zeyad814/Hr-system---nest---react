
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { hrApiService, Job } from "@/services/hrApi";
import { 
  Briefcase, 
  Search,
  Filter,
  Eye,
  Edit,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  Building
} from "lucide-react";

const HRJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await hrApiService.getJobs();
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "FILLED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "مفتوحة";
      case "CLOSED":
        return "مغلقة";
      case "FILLED":
        return "تم التوظيف";
      default:
        return status;
    }
  };

  return (
    <MainLayout userRole="hr" userName="سارة أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">إدارة الوظائف</h1>
            <p className="text-muted-foreground">إنشاء ومتابعة الوظائف المتاحة</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة وظيفة
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الوظائف..."
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                فلترة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="grid gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const createdDate = new Date(job.createdAt).toLocaleDateString('ar-SA');
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="h-4 w-4" />
                              <span>{job.client?.name || 'غير محدد'}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{job.location || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{job.salary || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{job.type || 'دوام كامل'}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {job.description || 'لا يوجد وصف متاح'}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{job.applications?.length || 0} متقدم</span>
                          </div>
                          <span className="text-muted-foreground">نُشرت في: {createdDate}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          تحرير
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Users className="h-4 w-4" />
                          المتقدمين ({job.applications?.length || 0})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد وظائف</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'لم يتم العثور على وظائف تطابق البحث' : 'لم يتم إنشاء أي وظائف بعد'}
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة وظيفة جديدة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HRJobs;
