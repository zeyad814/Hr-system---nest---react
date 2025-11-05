export type AppLanguage = 'ar' | 'en';

export function getContractTypeLabel(type: string, language: AppLanguage): string {
  const normalized = String(type).toUpperCase();
  const ar: Record<string, string> = {
    RECRUITMENT: 'توظيف',
    CONSULTING: 'استشارات',
    TRAINING: 'تدريب',
    RETAINER: 'مرابطة/احتفاظ',
    PROJECT_BASED: 'مشروع',
  };
  const en: Record<string, string> = {
    RECRUITMENT: 'Recruitment',
    CONSULTING: 'Consulting',
    TRAINING: 'Training',
    RETAINER: 'Retainer',
    PROJECT_BASED: 'Project-based',
  };

  return (language === 'ar' ? ar[normalized] : en[normalized]) || type;
}





