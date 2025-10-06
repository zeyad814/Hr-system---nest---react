import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building2, Users, Star, Phone, Mail, Globe, Filter, Search, Map } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface Partner {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  employees: string;
  rating: number;
  reviews: number;
  description: string;
  services: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  partnership: {
    since: string;
    type: string;
    status: string;
  };
  stats: {
    jobsPosted: number;
    candidatesHired: number;
    successRate: number;
  };
}

const Partners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Mock data for partner companies
  const partners: Partner[] = [
    {
      id: "1",
      name: "شركة التقنية المتقدمة",
      logo: "🏢",
      industry: "التقنية",
      location: "الرياض، المملكة العربية السعودية",
      city: "الرياض",
      country: "السعودية",
      coordinates: { lat: 24.7136, lng: 46.6753 },
      employees: "500-1000",
      rating: 4.8,
      reviews: 156,
      description: "شركة رائدة في مجال التقنية والحلول الرقمية، متخصصة في تطوير البرمجيات وحلول الذكاء الاصطناعي.",
      services: ["تطوير البرمجيات", "الذكاء الاصطناعي", "الحلول السحابية", "الأمن السيبراني"],
      contact: {
        phone: "+966 11 123 4567",
        email: "info@advancedtech.sa",
        website: "www.advancedtech.sa"
      },
      partnership: {
        since: "2020",
        type: "شريك ذهبي",
        status: "نشط"
      },
      stats: {
        jobsPosted: 45,
        candidatesHired: 38,
        successRate: 84
      }
    },
    {
      id: "2",
      name: "مجموعة الخليج المالية",
      logo: "🏦",
      industry: "المالية",
      location: "دبي، الإمارات العربية المتحدة",
      city: "دبي",
      country: "الإمارات",
      coordinates: { lat: 25.2048, lng: 55.2708 },
      employees: "1000+",
      rating: 4.6,
      reviews: 203,
      description: "مجموعة مالية رائدة تقدم خدمات مصرفية وتمويلية متنوعة في منطقة الخليج العربي.",
      services: ["الخدمات المصرفية", "التمويل", "الاستثمار", "التأمين"],
      contact: {
        phone: "+971 4 123 4567",
        email: "careers@gulffinance.ae",
        website: "www.gulffinance.ae"
      },
      partnership: {
        since: "2019",
        type: "شريك فضي",
        status: "نشط"
      },
      stats: {
        jobsPosted: 32,
        candidatesHired: 28,
        successRate: 88
      }
    },
    {
      id: "3",
      name: "مستشفى الملك فيصل التخصصي",
      logo: "🏥",
      industry: "الرعاية الصحية",
      location: "الرياض، المملكة العربية السعودية",
      city: "الرياض",
      country: "السعودية",
      coordinates: { lat: 24.6877, lng: 46.7219 },
      employees: "5000+",
      rating: 4.9,
      reviews: 89,
      description: "مستشفى متخصص رائد في تقديم الرعاية الصحية المتقدمة والبحث الطبي.",
      services: ["الرعاية الطبية", "البحث الطبي", "التدريب الطبي", "الاستشارات"],
      contact: {
        phone: "+966 11 464 7272",
        email: "hr@kfshrc.edu.sa",
        website: "www.kfshrc.edu.sa"
      },
      partnership: {
        since: "2021",
        type: "شريك بلاتيني",
        status: "نشط"
      },
      stats: {
        jobsPosted: 67,
        candidatesHired: 52,
        successRate: 78
      }
    },
    {
      id: "4",
      name: "شركة البترول الكويتية",
      logo: "⛽",
      industry: "النفط والغاز",
      location: "الكويت، دولة الكويت",
      city: "الكويت",
      country: "الكويت",
      coordinates: { lat: 29.3759, lng: 47.9774 },
      employees: "10000+",
      rating: 4.5,
      reviews: 134,
      description: "شركة نفط وطنية رائدة في استكشاف وإنتاج وتكرير النفط والغاز الطبيعي.",
      services: ["استكشاف النفط", "التكرير", "البتروكيماويات", "التسويق"],
      contact: {
        phone: "+965 2481 1111",
        email: "careers@kpc.com.kw",
        website: "www.kpc.com.kw"
      },
      partnership: {
        since: "2018",
        type: "شريك ذهبي",
        status: "نشط"
      },
      stats: {
        jobsPosted: 89,
        candidatesHired: 71,
        successRate: 80
      }
    },
    {
      id: "5",
      name: "جامعة الملك عبدالله للعلوم والتقنية",
      logo: "🎓",
      industry: "التعليم",
      location: "ثول، المملكة العربية السعودية",
      city: "ثول",
      country: "السعودية",
      coordinates: { lat: 22.3089, lng: 39.1044 },
      employees: "1000-5000",
      rating: 4.7,
      reviews: 76,
      description: "جامعة بحثية دولية رائدة تركز على العلوم والتقنية والابتكار.",
      services: ["التعليم العالي", "البحث العلمي", "الابتكار", "ريادة الأعمال"],
      contact: {
        phone: "+966 12 808 0000",
        email: "careers@kaust.edu.sa",
        website: "www.kaust.edu.sa"
      },
      partnership: {
        since: "2022",
        type: "شريك أكاديمي",
        status: "نشط"
      },
      stats: {
        jobsPosted: 23,
        candidatesHired: 19,
        successRate: 83
      }
    },
    {
      id: "6",
      name: "مجموعة العثيم",
      logo: "🛒",
      industry: "التجارة",
      location: "الرياض، المملكة العربية السعودية",
      city: "الرياض",
      country: "السعودية",
      coordinates: { lat: 24.7136, lng: 46.6753 },
      employees: "10000+",
      rating: 4.3,
      reviews: 198,
      description: "مجموعة تجارية رائدة تدير سلسلة من المتاجر والمراكز التجارية في المملكة.",
      services: ["التجارة بالتجزئة", "العقارات", "الضيافة", "الاستثمار"],
      contact: {
        phone: "+966 11 218 8888",
        email: "hr@alothaimgroup.com",
        website: "www.alothaimgroup.com"
      },
      partnership: {
        since: "2020",
        type: "شريك فضي",
        status: "نشط"
      },
      stats: {
        jobsPosted: 156,
        candidatesHired: 134,
        successRate: 86
      }
    }
  ];

  const industries = ["التقنية", "المالية", "الرعاية الصحية", "النفط والغاز", "التعليم", "التجارة"];
  const locations = ["الرياض", "دبي", "الكويت", "ثول"];
  const partnershipTypes = ["شريك بلاتيني", "شريك ذهبي", "شريك فضي", "شريك أكاديمي"];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || partner.industry === selectedIndustry;
    const matchesLocation = !selectedLocation || partner.city === selectedLocation;
    const matchesType = !selectedType || partner.partnership.type === selectedType;
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesType;
  });

  const getPartnershipBadgeColor = (type: string) => {
    switch (type) {
      case "شريك بلاتيني": return "bg-gray-100 text-gray-800";
      case "شريك ذهبي": return "bg-yellow-100 text-yellow-800";
      case "شريك فضي": return "bg-gray-100 text-gray-600";
      case "شريك أكاديمي": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderPartnerCard = (partner: Partner) => (
    <Card key={partner.id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{partner.logo}</div>
            <div>
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {partner.location}
              </CardDescription>
            </div>
          </div>
          <Badge className={getPartnershipBadgeColor(partner.partnership.type)}>
            {partner.partnership.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">القطاع:</span>
            <Badge variant="outline">{partner.industry}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">عدد الموظفين:</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {partner.employees}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">التقييم:</span>
            <div className="flex items-center gap-1">
              <div className="flex">{renderStars(partner.rating)}</div>
              <span className="text-sm text-gray-600">({partner.reviews})</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">{partner.description}</p>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{partner.stats.jobsPosted}</div>
              <div className="text-xs text-gray-500">وظيفة منشورة</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{partner.stats.candidatesHired}</div>
              <div className="text-xs text-gray-500">مرشح تم توظيفه</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{partner.stats.successRate}%</div>
              <div className="text-xs text-gray-500">معدل النجاح</div>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mt-3" onClick={() => setSelectedPartner(partner)}>
                عرض التفاصيل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-2xl">{partner.logo}</span>
                  {partner.name}
                </DialogTitle>
                <DialogDescription>
                  {partner.description}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="services">الخدمات</TabsTrigger>
                  <TabsTrigger value="contact">التواصل</TabsTrigger>
                  <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">معلومات الشركة</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">القطاع:</span>
                          <span>{partner.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الموقع:</span>
                          <span>{partner.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">عدد الموظفين:</span>
                          <span>{partner.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">التقييم:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex">{renderStars(partner.rating)}</div>
                            <span>({partner.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">معلومات الشراكة</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع الشراكة:</span>
                          <Badge className={getPartnershipBadgeColor(partner.partnership.type)}>
                            {partner.partnership.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">شريك منذ:</span>
                          <span>{partner.partnership.since}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الحالة:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {partner.partnership.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="services" className="space-y-4">
                  <h4 className="font-semibold">الخدمات المقدمة</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {partner.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="justify-center p-2">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <h4 className="font-semibold">معلومات التواصل</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.website}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="space-y-4">
                  <h4 className="font-semibold">إحصائيات الأداء</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{partner.stats.jobsPosted}</div>
                        <div className="text-sm text-gray-600">وظيفة منشورة</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{partner.stats.candidatesHired}</div>
                        <div className="text-sm text-gray-600">مرشح تم توظيفه</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{partner.stats.successRate}%</div>
                        <div className="text-sm text-gray-600">معدل النجاح</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الشركات الشريكة</h1>
            <p className="text-gray-600 mt-1">تصفح شبكة شركائنا من أفضل الشركات في المنطقة</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              size="sm"
            >
              <Building2 className="h-4 w-4 ml-2" />
              عرض الشبكة
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              size="sm"
            >
              <Map className="h-4 w-4 ml-2" />
              عرض الخريطة
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الشركاء</p>
                  <p className="text-2xl font-bold text-blue-600">{partners.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوظائف المنشورة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {partners.reduce((sum, partner) => sum + partner.stats.jobsPosted, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المرشحون المعينون</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {partners.reduce((sum, partner) => sum + partner.stats.candidatesHired, 0)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">متوسط معدل النجاح</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(partners.reduce((sum, partner) => sum + partner.stats.successRate, 0) / partners.length)}%
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث في الشركات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع القطاعات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القطاعات</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع المواقع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواقع</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع أنواع الشراكة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع أنواع الشراكة</SelectItem>
                  {partnershipTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedIndustry("");
                  setSelectedLocation("");
                  setSelectedType("");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map(renderPartnerCard)}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">عرض الخريطة</h3>
                  <p className="text-gray-500">سيتم إضافة خريطة تفاعلية لعرض مواقع الشركاء</p>
                  <p className="text-sm text-gray-400 mt-2">يتطلب تكامل مع خدمة الخرائط مثل Google Maps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد شركات مطابقة</h3>
              <p className="text-gray-500">جرب تعديل معايير البحث أو الفلاتر</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Partners;