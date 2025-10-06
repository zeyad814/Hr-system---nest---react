import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';

@Controller('activities')
export class ActivitiesController {
  @Get('recent')
  @Roles('CLIENT', 'ADMIN', 'HR', 'SALES')
  getRecentActivities() {
    return [
      {
        id: '1',
        type: 'job_posted',
        description: 'تم نشر وظيفة مطور تطبيقات موبايل',
        timestamp: new Date().toISOString(),
        details: { jobTitle: 'مطور تطبيقات موبايل' },
      },
      {
        id: '2',
        type: 'candidate_applied',
        description: 'تقدم مرشح جديد لوظيفة مصمم واجهات',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: { candidateName: 'أحمد محمد', jobTitle: 'مصمم واجهات' },
      },
      {
        id: '3',
        type: 'contract_signed',
        description: 'تم توقيع عقد جديد مع مهندس برمجيات',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        details: { candidateName: 'سارة أحمد', contractValue: '15000' },
      },
      {
        id: '4',
        type: 'interview_scheduled',
        description: 'تم جدولة مقابلة مع مرشح لوظيفة محلل بيانات',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          candidateName: 'محمد علي',
          jobTitle: 'محلل بيانات',
          interviewDate: '2024-01-15',
        },
      },
      {
        id: '5',
        type: 'job_closed',
        description: 'تم إغلاق وظيفة مدير مشروع بنجاح',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          jobTitle: 'مدير مشروع',
          reason: 'تم العثور على المرشح المناسب',
        },
      },
    ];
  }
}
