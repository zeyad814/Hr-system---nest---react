# 🔧 حل مشاكل PostgreSQL مع Docker

## 🚨 المشاكل التي تم اكتشافها

### 1. **مشكلة `depends_on`**
المشكلة: الـ `depends_on` في docker-compose كان ينتظر فقط بدء الحاوية، وليس جاهزية قاعدة البيانات للاتصال.

**قبل الإصلاح:**
```yaml
depends_on:
  - postgres
```

**بعد الإصلاح:**
```yaml
depends_on:
  postgres:
    condition: service_healthy
```

### 2. **عدم وجود Healthcheck**
المشكلة: لم يكن هناك healthcheck لـ PostgreSQL، لذلك Docker لا يعرف متى تكون قاعدة البيانات جاهزة.

**الحل:** تم إضافة healthcheck:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d hrdb"]
  interval: 5s
  timeout: 5s
  retries: 5
  start_period: 10s
```

### 3. **مشكلة في syntax الأمر**
المشكلة: استخدام `command: >` مع أسطر متعددة قد يسبب مشاكل في بعض الحالات.

**قبل الإصلاح:**
```yaml
command: >
  postgres
  -c listen_addresses='*'
  -c password_encryption=scram-sha-256
```

**بعد الإصلاح:**
```yaml
command: postgres -c listen_addresses='*' -c password_encryption=scram-sha-256
```

## ✅ الحلول المطبقة

تم إصلاح الملفات التالية:
- ✅ `docker-compose.yml`
- ✅ `docker-compose-fixed.yml`

## 🚀 كيفية الاستخدام

### 1. إيقاف الحاويات الحالية (إن وجدت)
```bash
docker-compose down
```

### 2. حذف الحاويات القديمة (اختياري)
```bash
docker-compose down -v
```

### 3. تشغيل قاعدة البيانات فقط
```bash
docker-compose up -d postgres
```

### 4. التحقق من حالة قاعدة البيانات
```bash
docker-compose ps
```

يجب أن ترى `postgres` بحالة `healthy` ✅

### 5. تشغيل جميع الخدمات
```bash
docker-compose up -d
```

### 6. فحص الـ logs
```bash
# logs لـ PostgreSQL
docker-compose logs postgres

# logs لـ Backend
docker-compose logs backend
```

## 🔍 التحقق من الاتصال

### اختبار الاتصال من داخل Docker
```bash
docker-compose exec backend sh
# ثم داخل الحاوية:
npx prisma db pull
```

### اختبار الاتصال من خارج Docker
```bash
# على Windows (PowerShell)
$env:PGPASSWORD="postgres"; psql -h localhost -p 5433 -U postgres -d hrdb

# أو استخدام أي PostgreSQL client
# Host: localhost
# Port: 5433
# User: postgres
# Password: postgres
# Database: hrdb
```

## 📋 متغيرات البيئة المطلوبة

تأكد من أن ملف `.env` في `back-end/server/` يحتوي على:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/hrdb?schema=public"
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

**ملاحظة:** عند استخدام Docker Compose، الـ `DATABASE_URL` يجب أن يستخدم اسم الخدمة `postgres` وليس `localhost`.

## 🛠️ استكشاف الأخطاء

### المشكلة: Backend لا يتصل بقاعدة البيانات

**الحل:**
1. تحقق من أن PostgreSQL يعمل:
   ```bash
   docker-compose ps postgres
   ```
   يجب أن يكون `healthy` ✅

2. تحقق من الـ logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs backend
   ```

3. تأكد من `DATABASE_URL` في docker-compose.yml:
   ```yaml
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hrdb
   ```

### المشكلة: Port 5433 مستخدم بالفعل

**الحل:**
غيّر المنفذ في `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"  # بدلاً من 5433
```

### المشكلة: Volume قديم أو تالف

**الحل:**
```bash
# احذف الحاوية والـ volume
docker-compose down -v

# أعد التشغيل
docker-compose up -d postgres
```

## 📝 ملاحظات مهمة

1. **المنفذ الخارجي:** PostgreSQL يعمل على المنفذ `5433` على الجهاز المحلي، و `5432` داخل Docker.

2. **Healthcheck:** الآن Backend سينتظر حتى تصبح قاعدة البيانات جاهزة قبل المحاولة للاتصال.

3. **البيانات:** البيانات محفوظة في Docker volume اسمه `pgdata`، لذلك لن تفقد البيانات عند إعادة تشغيل الحاوية.

4. **الأمان:** في الإنتاج، يجب تغيير كلمة المرور الافتراضية `postgres`.

## ✅ Checklist

- [ ] تم تحديث `docker-compose.yml`
- [ ] تم إضافة healthcheck لـ PostgreSQL
- [ ] تم تحديث `depends_on` لاستخدام `service_healthy`
- [ ] تم إصلاح syntax الأمر
- [ ] تم اختبار تشغيل PostgreSQL
- [ ] تم التحقق من الاتصال من Backend
- [ ] تم فحص الـ logs للتأكد من عدم وجود أخطاء

---

**تم إنشاء هذا الملف لمساعدتك في حل مشاكل PostgreSQL مع Docker** 🐘
