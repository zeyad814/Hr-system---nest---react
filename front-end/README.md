# HR Sales Connect

نظام إدارة الموارد البشرية والمبيعات المتكامل

## وصف المشروع

HR Sales Connect هو نظام شامل لإدارة الموارد البشرية والمبيعات يجمع بين وظائف CRM و ATS في منصة واحدة. يدعم النظام عدة أنواع من المستخدمين ويوفر أدوات متقدمة لإدارة العملاء والمرشحين والعقود.

## المميزات الرئيسية

### أنواع المستخدمين
- **المدير (Admin)**: إدارة شاملة للنظام والمستخدمين
- **الموارد البشرية (HR)**: إدارة المرشحين والمقابلات والتوظيف
- **المبيعات (Sales)**: إدارة العملاء والعقود والإيرادات
- **العميل (Client)**: عرض المرشحين وإدارة الطلبات
- **مقدم الطلب (Applicant)**: تصفح الوظائف والتقديم

### الوظائف الأساسية
- 📊 لوحات تحكم تفاعلية لكل نوع مستخدم
- 👥 إدارة شاملة للمرشحين والعملاء
- 💼 نظام إدارة الوظائف والعقود
- 📈 تقارير وإحصائيات مفصلة
- 💬 تكامل WhatsApp للتواصل
- 🎯 نظام Timeline لتتبع حالة المرشحين
- 💰 إدارة الإيرادات والمدفوعات
- 🔔 نظام إشعارات متقدم

## التقنيات المستخدمة

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Query
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: Date-fns

## متطلبات التشغيل

- Node.js 18+ 
- npm أو yarn

## التثبيت والتشغيل

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-username/hr-sales-connect.git
cd hr-sales-connect
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **تشغيل الخادم المحلي**
```bash
npm run dev
```

4. **فتح المتصفح**
```
http://localhost:5173
```

## البناء للإنتاج

```bash
npm run build
```

## هيكل المشروع

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── ui/             # مكونات واجهة المستخدم الأساسية
│   └── layout/         # مكونات التخطيط
├── pages/              # صفحات التطبيق
│   ├── admin/          # صفحات المدير
│   ├── hr/             # صفحات الموارد البشرية
│   ├── sales/          # صفحات المبيعات
│   ├── client/         # صفحات العميل
│   ├── applicant/      # صفحات مقدم الطلب
│   └── auth/           # صفحات المصادقة
├── lib/                # المكتبات والأدوات المساعدة
└── hooks/              # React Hooks المخصصة
```

## الصفحات المتاحة

### صفحات عامة
- `/` - الصفحة الرئيسية
- `/login` - تسجيل الدخول وإنشاء الحساب
- `/partners` - الشركاء

### لوحات التحكم
- `/admin` - لوحة تحكم المدير
- `/hr` - لوحة تحكم الموارد البشرية
- `/sales` - لوحة تحكم المبيعات
- `/client` - لوحة تحكم العميل
- `/applicant` - لوحة تحكم مقدم الطلب

### صفحات متخصصة
- `/candidate-timeline` - خط زمني للمرشحين
- `/contract-management` - إدارة العقود
- `/whatsapp-integration` - تكامل WhatsApp

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للحصول على الدعم، يرجى فتح issue في GitHub أو التواصل مع فريق التطوير.

---

**تم تطوير هذا المشروع بواسطة فريق HR Sales Connect**