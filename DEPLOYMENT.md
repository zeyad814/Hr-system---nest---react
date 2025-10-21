# 🚀 دليل رفع المشروع على Railway

## 📋 المشكلة الحالية

عند رفع المشروع على السيرفر، الحاجات الجديدة مثل:
- الأهداف الشهرية (Monthly Targets)
- الباكجات (Skill Packages)
- قوالب الوظائف (Job Templates)
- المقابلات (Interviews)

بتظهر خطأ في التحميل بسبب أن الـ migrations الجديدة لم يتم تطبيقها على قاعدة بيانات السيرفر.

## ✅ الحل

### الطريقة الأولى: التطبيق التلقائي (الأفضل)

تم تحديث ملف `package.json` لتطبيق migrations تلقائياً عند كل deploy:

```json
"start:prod": "prisma migrate deploy && node dist/src/main"
```

### الطريقة الثانية: التطبيق اليدوي

إذا كنت تريد تطبيق migrations يدوياً على Railway:

#### 1️⃣ من Railway Dashboard:

1. اذهب إلى project الخاص بك على Railway
2. اختر service الخاص بالـ backend
3. اذهب إلى تبويب **Settings**
4. في قسم **Deploy**، تأكد من أن الـ **Start Command** هو:
   ```bash
   npm run start:prod
   ```

#### 2️⃣ تطبيق Migrations من الـ Railway CLI:

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# الربط بالـ project
railway link

# تطبيق migrations
railway run npm run prisma:migrate:deploy
```

#### 3️⃣ إعادة Deploy المشروع:

بعد تطبيق الـ migrations، يجب إعادة deploy للتأكد من تطبيق كل التغييرات:

1. من Railway Dashboard:
   - اذهب إلى service الخاص بك
   - اضغط على **Deployments**
   - اضغط على **Redeploy** للـ deployment الأخير

2. أو باستخدام Git:
   ```bash
   git add .
   git commit -m "fix: add migration deployment to production"
   git push
   ```

## 🗄️ Migrations الجديدة

الـ migrations التي تحتاج للتطبيق على السيرفر:

### 1. Monthly Targets (الأهداف الشهرية)
```sql
-- Migration: 20251020212658_add_monthly_target_model
CREATE TABLE "MonthlyTarget" (...)
```

### 2. Job Templates (قوالب الوظائف)
```sql
-- Migration: 20251020231712_add_job_templates
CREATE TABLE "job_templates" (...)
CREATE TYPE "TemplateCategory" AS ENUM (...)
```

### 3. Skill Packages (باكجات المهارات)
```sql
-- Migration: 20250120130000_add_skill_packages
CREATE TABLE "skill_packages" (...)
CREATE TYPE "PackageCategory" AS ENUM (...)
```

## 🔍 التحقق من نجاح التطبيق

بعد تطبيق migrations، تحقق من:

1. **الـ Logs على Railway:**
   ```
   ✓ prisma migrate deploy
   ✓ Applied migrations successfully
   ```

2. **زيارة الصفحات المتأثرة:**
   - https://your-app.railway.app/admin/monthly-targets
   - https://your-app.railway.app/admin/skill-packages
   - https://your-app.railway.app/admin/job-templates
   - https://your-app.railway.app/admin/interviews

3. **فحص قاعدة البيانات:**
   ```bash
   railway run npx prisma studio
   ```

## ⚠️ ملاحظات مهمة

1. **DATABASE_URL**: تأكد من أن متغير البيئة `DATABASE_URL` موجود في Railway settings
2. **Build Command**: يجب أن يكون `npm run build`
3. **Start Command**: يجب أن يكون `npm run start:prod`
4. **Node Version**: تأكد من استخدام Node.js 18 أو أحدث

## 📝 متغيرات البيئة المطلوبة

تأكد من وجود هذه المتغيرات في Railway:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
```

## 🔧 استكشاف الأخطاء

### مشكلة: "Table does not exist"
**الحل**: تطبيق migrations باستخدام `prisma migrate deploy`

### مشكلة: "Migration failed"
**الحل**:
1. تحقق من الـ logs
2. تأكد من صحة DATABASE_URL
3. تأكد من وجود صلاحيات الكتابة على قاعدة البيانات

### مشكلة: "Type does not exist"
**الحل**: تطبيق migrations بالترتيب باستخدام `prisma migrate deploy`

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من logs على Railway Dashboard
2. راجع ملف `.env` للتأكد من صحة البيانات
3. تحقق من أن جميع migrations موجودة في مجلد `prisma/migrations`
