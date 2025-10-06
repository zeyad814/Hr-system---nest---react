# نظام إدارة الموارد البشرية (HR Management System)

نظام شامل لإدارة الموارد البشرية مبني باستخدام NestJS للخادم الخلفي و React مع TypeScript للواجهة الأمامية.

## 📋 المحتويات

- [متطلبات النظام](#متطلبات-النظام)
- [هيكل المشروع](#هيكل-المشروع)
- [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
- [إعداد الخادم الخلفي](#إعداد-الخادم-الخلفي)
- [إعداد الواجهة الأمامية](#إعداد-الواجهة-الأمامية)
- [إنشاء المستخدمين](#إنشاء-المستخدمين)
- [تشغيل المشروع](#تشغيل-المشروع)
- [بيانات الاعتماد الافتراضية](#بيانات-الاعتماد-الافتراضية)

## 🔧 متطلبات النظام

قبل البدء، تأكد من تثبيت المتطلبات التالية:

- **Node.js** (الإصدار 18 أو أحدث)
- **npm** أو **yarn**
- **Docker** و **Docker Compose**
- **Git**

## 📁 هيكل المشروع

```
hr-project/
├── back-end/
│   └── server/
│       ├── src/                    # كود الخادم الخلفي
│       ├── prisma/                 # مخططات قاعدة البيانات
│       ├── docker-compose.yml      # إعداد Docker
│       ├── .env                    # متغيرات البيئة للخادم
│       ├── create_users.js         # سكريبت إنشاء المستخدمين
│       └── package.json
├── front-end/
│   ├── src/                        # كود الواجهة الأمامية
│   ├── .env                        # متغيرات البيئة للواجهة
│   └── package.json
└── README.md
```

## 🐳 إعداد قاعدة البيانات

### 1. تشغيل PostgreSQL باستخدام Docker

انتقل إلى مجلد الخادم الخلفي:

```bash
cd back-end/server
```

قم بتشغيل قاعدة البيانات:

```bash
docker-compose up -d postgres
```

هذا الأمر سيقوم بـ:
- تشغيل PostgreSQL على المنفذ `5432`
- إنشاء قاعدة بيانات باسم `hrdb`
- استخدام المعرف `postgres` وكلمة المرور `postgres`

### 2. التحقق من تشغيل قاعدة البيانات

```bash
docker ps
```

يجب أن ترى حاوية باسم `hrdb` في حالة تشغيل.

## ⚙️ إعداد الخادم الخلفي

### 1. تثبيت التبعيات

```bash
cd back-end/server
npm install
```

### 2. إعداد متغيرات البيئة

تأكد من وجود ملف `.env` مع المحتوى التالي:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrdb?schema=public"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. إعداد Prisma وقاعدة البيانات

إنشاء وتطبيق مخططات قاعدة البيانات:

```bash
# إنشاء عميل Prisma
npx prisma generate

# تطبيق المخططات على قاعدة البيانات
npx prisma migrate dev --name init

# (اختياري) فتح Prisma Studio لإدارة البيانات
npx prisma studio
```

### 4. تشغيل الخادم الخلفي

```bash
# للتطوير (مع إعادة التشغيل التلقائي)
npm run start:dev

# أو للإنتاج
npm run build
npm run start:prod
```

الخادم سيعمل على: `http://localhost:3000`

## 🎨 إعداد الواجهة الأمامية

### 1. تثبيت التبعيات

```bash
cd front-end
npm install
```

### 2. إعداد متغيرات البيئة

تأكد من وجود ملف `.env` مع المحتوى التالي:

```env
VITE_API_BASE = "http://localhost:3000/api"
```

### 3. تشغيل الواجهة الأمامية

```bash
# للتطوير
npm run dev

# أو للبناء والمعاينة
npm run build
npm run preview
```

الواجهة ستعمل على: `http://localhost:5173`

## 👥 إنشاء المستخدمين

بعد إعداد قاعدة البيانات والخادم الخلفي، قم بإنشاء المستخدمين الافتراضيين:

```bash
cd back-end/server
node create_users.js
```

هذا السكريبت سيقوم بإنشاء المستخدمين التاليين:

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| مدير النظام | admin@test.com | Pass123! |
| مدير الموارد البشرية | hr@test.com | Pass123! |
| مدير المبيعات | sales@test.com | Pass123! |
| عميل | client@test.com | Pass123! |
| متقدم للوظيفة | applicant@test.com | Pass123! |

## 🚀 تشغيل المشروع

### الطريقة السريعة (خطوة واحدة)

1. **تشغيل قاعدة البيانات:**
```bash
cd back-end/server
docker-compose up -d postgres
```

2. **إعداد وتشغيل الخادم الخلفي:**
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
node create_users.js
npm run start:dev
```

3. **في نافذة طرفية جديدة، تشغيل الواجهة الأمامية:**
```bash
cd front-end
npm install
npm run dev
```

### التحقق من التشغيل

- **قاعدة البيانات:** `docker ps` (يجب أن ترى حاوية hrdb)
- **الخادم الخلفي:** `http://localhost:3000/api` (يجب أن ترى رسالة API)
- **الواجهة الأمامية:** `http://localhost:5173` (يجب أن ترى صفحة تسجيل الدخول)

## 🔑 بيانات الاعتماد الافتراضية

يمكنك تسجيل الدخول باستخدام أي من الحسابات التالية:

### مدير النظام
- **البريد الإلكتروني:** admin@test.com
- **كلمة المرور:** Pass123!

### مدير الموارد البشرية
- **البريد الإلكتروني:** hr@test.com
- **كلمة المرور:** Pass123!

### مدير المبيعات
- **البريد الإلكتروني:** sales@test.com
- **كلمة المرور:** Pass123!

### عميل
- **البريد الإلكتروني:** client@test.com
- **كلمة المرور:** Pass123!

### متقدم للوظيفة
- **البريد الإلكتروني:** applicant@test.com
- **كلمة المرور:** Pass123!

## 🛠️ أوامر مفيدة

### إدارة قاعدة البيانات
```bash
# تشغيل قاعدة البيانات
docker-compose up -d postgres

# إيقاف قاعدة البيانات
docker-compose down

# عرض سجلات قاعدة البيانات
docker logs hrdb

# الدخول إلى قاعدة البيانات
docker exec -it hrdb psql -U postgres -d hrdb
```

### إدارة Prisma
```bash
# إنشاء عميل جديد
npx prisma generate

# تطبيق التغييرات على قاعدة البيانات
npx prisma migrate dev

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# فتح Prisma Studio
npx prisma studio
```

### إدارة الخادم الخلفي
```bash
# تشغيل في وضع التطوير
npm run start:dev

# بناء المشروع
npm run build

# تشغيل الاختبارات
npm run test

# فحص الكود
npm run lint
```

### إدارة الواجهة الأمامية
```bash
# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص الكود
npm run lint
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

1. **خطأ في الاتصال بقاعدة البيانات:**
   - تأكد من تشغيل Docker
   - تحقق من أن المنفذ 5432 غير مستخدم
   - تأكد من صحة `DATABASE_URL` في ملف `.env`

2. **خطأ في Prisma Migration:**
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

3. **المنفذ مستخدم:**
   - للخادم الخلفي: غيّر `PORT` في `.env`
   - للواجهة الأمامية: استخدم `npm run dev -- --port 3001`

4. **مشاكل في التبعيات:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 ملاحظات إضافية

- تأكد من تشغيل قاعدة البيانات قبل تشغيل الخادم الخلفي
- يجب تشغيل الخادم الخلفي قبل الواجهة الأمامية
- جميع كلمات المرور الافتراضية هي `Pass123!`
- يمكن تغيير إعدادات قاعدة البيانات من ملف `docker-compose.yml`
- لإيقاف جميع الخدمات: `docker-compose down` في مجلد الخادم الخلفي

## 🤝 المساهمة

لأي استفسارات أو مشاكل، يرجى إنشاء issue في المستودع أو التواصل مع فريق التطوير.