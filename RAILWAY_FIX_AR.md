# 🔧 حل مشكلة الأخطاء على Railway

## 🚨 المشكلة

عند زيارة الصفحات الجديدة مثل:
- الأهداف الشهرية: `/admin/monthly-targets`
- الباكجات: `/admin/skill-packages`
- قوالب الوظائف: `/admin/job-templates`
- المقابلات: `/admin/interviews`

تظهر رسالة خطأ بسبب أن الجداول الجديدة غير موجودة في قاعدة البيانات على السيرفر.

## ✅ الحل السريع

### الطريقة 1️⃣: إعادة Deploy (الأسهل)

1. **افتح Railway Dashboard** على الرابط:
   - https://railway.app/

2. **اختر المشروع** الخاص بك

3. **اذهب للـ Backend Service**

4. **اذهب لـ Settings**

5. **تحقق من الإعدادات التالية:**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`

6. **اذهب لـ Deployments**

7. **اضغط Redeploy** على آخر deployment

8. **انتظر حتى ينتهي الـ deployment**

9. **تحقق من الـ Logs** - يجب أن ترى:
   ```
   ✓ prisma migrate deploy
   ✓ Applied X migrations
   ```

### الطريقة 2️⃣: من الكود

1. **تأكد من تحديث الكود:**
   ```bash
   git pull origin main
   ```

2. **ارفع التعديلات:**
   ```bash
   git add .
   git commit -m "fix: add auto migration deployment"
   git push origin main
   ```

3. **Railway سيعمل deploy تلقائياً**

### الطريقة 3️⃣: باستخدام Railway CLI

1. **ثبت Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **سجل دخول:**
   ```bash
   railway login
   ```

3. **اربط المشروع:**
   ```bash
   railway link
   ```

4. **طبق الـ migrations:**
   ```bash
   cd back-end/server
   railway run npm run prisma:migrate:deploy
   ```

## 🔍 كيف تتحقق من نجاح الحل؟

1. **تحقق من الـ Logs على Railway:**
   - اذهب لـ Deployments
   - اضغط على آخر deployment
   - ابحث عن رسالة: `Applied X migrations`

2. **جرب الصفحات:**
   - افتح: https://accomplished-simplicity-production.up.railway.app/admin/monthly-targets
   - يجب أن تعمل بدون أخطاء

3. **تحقق من قاعدة البيانات:**
   - من Railway Dashboard
   - اذهب لـ Database Service
   - اضغط على **Data**
   - يجب أن ترى الجداول الجديدة:
     - `MonthlyTarget`
     - `job_templates`
     - `skill_packages`

## 📋 Migrations المطلوبة

الـ migrations التي سيتم تطبيقها:

1. ✅ **MonthlyTarget** - جدول الأهداف الشهرية
2. ✅ **job_templates** - جدول قوالب الوظائف
3. ✅ **skill_packages** - جدول باكجات المهارات
4. ✅ **TemplateCategory** - enum لتصنيف القوالب
5. ✅ **PackageCategory** - enum لتصنيف الباكجات

## ⚠️ نصائح مهمة

1. **لا تحذف migrations القديمة** - Prisma يحتاجها لتتبع التغييرات

2. **تأكد من DATABASE_URL** - يجب أن يكون موجود في Railway Environment Variables

3. **Backup قاعدة البيانات** - قبل تطبيق migrations جديدة (اختياري ولكن مستحسن)

## 🆘 إذا لم يعمل الحل

1. **تحقق من الـ Logs:**
   ```
   railway logs
   ```

2. **تحقق من متغيرات البيئة:**
   - افتح Railway Dashboard
   - اذهب لـ Backend Service
   - Variables → تأكد من وجود `DATABASE_URL`

3. **أعد بناء المشروع:**
   - Settings → Build & Deploy
   - اضغط **Rebuild**

4. **اتصل بالدعم الفني** إذا استمرت المشكلة

## 📞 معلومات إضافية

- **Railway Docs**: https://docs.railway.app/
- **Prisma Migrations Docs**: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

**تم إنشاء هذا الملف لمساعدتك في حل مشكلة الـ migrations على Railway**
