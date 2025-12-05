# 🐳 تشغيل Docker بدون قاعدة بيانات

## 📋 التغييرات المطبقة

تم إزالة خدمة PostgreSQL من `docker-compose.yml` و `docker-compose-fixed.yml`.

الآن يمكنك:
- ✅ تشغيل Backend و Frontend فقط في Docker
- ✅ استخدام قاعدة بيانات خارجية (محلية أو على سيرفر آخر)
- ✅ تخصيص `DATABASE_URL` من متغيرات البيئة

## 🚀 كيفية الاستخدام

### 1. إعداد قاعدة البيانات الخارجية

#### خيار أ: قاعدة بيانات محلية على الجهاز
```bash
# تأكد من أن PostgreSQL يعمل على الجهاز المحلي
# Port: 5432 (افتراضي)
```

#### خيار ب: قاعدة بيانات على سيرفر بعيد
```bash
# استخدم عنوان IP أو اسم النطاق للسيرفر
```

### 2. إعداد متغيرات البيئة

#### إنشاء ملف `.env` في المجلد الرئيسي:
```env
# قاعدة البيانات المحلية
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrdb?schema=public

# أو قاعدة بيانات على سيرفر بعيد
# DATABASE_URL=postgresql://user:password@your-server.com:5432/hrdb?schema=public

JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 3. تشغيل الخدمات

```bash
# تشغيل Backend و Frontend فقط
docker-compose up -d

# أو تشغيل خدمة واحدة
docker-compose up -d backend
docker-compose up -d frontend
```

### 4. التحقق من الحالة

```bash
# عرض الحاويات
docker-compose ps

# عرض الـ logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔧 إعدادات DATABASE_URL

### للاتصال بقاعدة بيانات محلية من Docker:

**على Windows/Mac:**
```env
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/hrdb?schema=public
```

**على Linux:**
```env
# استخدم IP الخاص بالجهاز أو network_mode: "host"
DATABASE_URL=postgresql://postgres:postgres@172.17.0.1:5432/hrdb?schema=public
```

### للاتصال بقاعدة بيانات على سيرفر بعيد:
```env
DATABASE_URL=postgresql://username:password@server-ip-or-domain:5432/hrdb?schema=public
```

## 📝 ملاحظات مهمة

### 1. **host.docker.internal**
- يعمل على Windows و Mac
- على Linux قد تحتاج لإضافة `extra_hosts` في docker-compose.yml

### 2. **على Linux - إضافة extra_hosts**
إذا كنت على Linux وتواجه مشاكل في الاتصال، أضف هذا في `docker-compose.yml`:

```yaml
backend:
  # ... باقي الإعدادات
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

### 3. **Firewall**
تأكد من أن PostgreSQL يسمح بالاتصالات من Docker:
- في `postgresql.conf`: `listen_addresses = '*'`
- في `pg_hba.conf`: أضف قاعدة للسماح بالاتصال من Docker network

### 4. **المنفذ**
- تأكد من أن المنفذ 5432 (أو المنفذ الذي تستخدمه) مفتوح ومتاح

## 🛠️ استكشاف الأخطاء

### المشكلة: Backend لا يتصل بقاعدة البيانات

**الحل:**
1. تحقق من أن قاعدة البيانات تعمل:
   ```bash
   # على Windows/Mac
   psql -h localhost -U postgres -d hrdb
   
   # أو استخدم أي PostgreSQL client
   ```

2. تحقق من `DATABASE_URL`:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

3. تحقق من الـ logs:
   ```bash
   docker-compose logs backend
   ```

4. على Linux، أضف `extra_hosts`:
   ```yaml
   backend:
     extra_hosts:
       - "host.docker.internal:host-gateway"
   ```

### المشكلة: Connection refused

**الحل:**
- تأكد من أن PostgreSQL يستمع على `0.0.0.0` وليس فقط `localhost`
- تحقق من `pg_hba.conf` للسماح بالاتصالات من Docker network
- على Linux، قد تحتاج لاستخدام `network_mode: "host"` (لكن هذا يزيل عزل الشبكة)

## 🔄 العودة لاستخدام PostgreSQL في Docker

إذا أردت العودة لاستخدام PostgreSQL في Docker:

1. أعد إضافة خدمة `postgres` في `docker-compose.yml`
2. أعد إضافة `depends_on` في `backend`
3. غيّر `DATABASE_URL` إلى: `postgresql://postgres:postgres@postgres:5432/hrdb`

## ✅ Checklist

- [ ] تم إزالة خدمة PostgreSQL من docker-compose.yml
- [ ] تم إزالة depends_on من backend
- [ ] تم إعداد DATABASE_URL في ملف .env
- [ ] تم التحقق من أن قاعدة البيانات الخارجية تعمل
- [ ] تم اختبار الاتصال من Backend
- [ ] تم فحص الـ logs للتأكد من عدم وجود أخطاء

---

**تم تحديث الإعدادات لاستخدام قاعدة بيانات خارجية** 🎉
