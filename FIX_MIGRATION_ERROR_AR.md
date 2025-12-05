# 🔧 حل مشكلة Migration الفاشل

## 🚨 المشكلة

عند تشغيل `prisma migrate deploy`، تظهر رسالة خطأ:

```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `20251020212658_add_monthly_target_model` migration started at 2025-12-04 23:00:05.318299 UTC failed
```

## ✅ الحل

### الطريقة 1: استخدام Script (الأسهل)

#### على Windows:
```bash
cd back-end/server
fix-migration.bat 20251020212658_add_monthly_target_model
```

#### على Linux/Mac:
```bash
cd back-end/server
chmod +x fix-migration.sh
./fix-migration.sh 20251020212658_add_monthly_target_model
```

### الطريقة 2: حل يدوي

#### خيار أ: Mark as Rolled Back (إذا كان الـ migration لم يتم تطبيقه)
```bash
cd back-end/server
npx prisma migrate resolve --rolled-back 20251020212658_add_monthly_target_model
```

#### خيار ب: Mark as Applied (إذا كان الـ migration تم تطبيقه بالفعل)
```bash
cd back-end/server
npx prisma migrate resolve --applied 20251020212658_add_monthly_target_model
```

### الطريقة 3: من داخل Docker Container

```bash
# الدخول إلى Backend container
docker-compose exec backend sh

# حل المشكلة
npx prisma migrate resolve --rolled-back 20251020212658_add_monthly_target_model

# أو
npx prisma migrate resolve --applied 20251020212658_add_monthly_target_model

# الخروج
exit
```

## 🔍 كيف تعرف أي خيار تستخدم؟

### استخدم `--rolled-back` إذا:
- الـ migration لم يتم تطبيقه بالفعل
- الجداول/التغييرات غير موجودة في قاعدة البيانات
- تريد إعادة تطبيق الـ migration

### استخدم `--applied` إذا:
- الـ migration تم تطبيقه بالفعل
- الجداول/التغييرات موجودة في قاعدة البيانات
- تريد فقط إزالة السجل الفاشل

## 📋 خطوات كاملة

### 1. تحقق من حالة الـ migrations
```bash
cd back-end/server
npx prisma migrate status
```

### 2. حل المشكلة
```bash
# إذا كان الـ migration لم يتم تطبيقه
npx prisma migrate resolve --rolled-back 20251020212658_add_monthly_target_model

# أو إذا كان تم تطبيقه
npx prisma migrate resolve --applied 20251020212658_add_monthly_target_model
```

### 3. تحقق مرة أخرى
```bash
npx prisma migrate status
```

### 4. أعد تشغيل التطبيق
```bash
npm run start:prod
```

## 🐳 من داخل Docker

إذا كنت تستخدم Docker:

```bash
# 1. الدخول إلى Backend container
docker-compose exec backend sh

# 2. حل المشكلة
npx prisma migrate resolve --rolled-back 20251020212658_add_monthly_target_model

# 3. الخروج
exit

# 4. أعد تشغيل Backend
docker-compose restart backend
```

## ⚠️ ملاحظات مهمة

1. **Backup قاعدة البيانات**: قبل حل المشكلة، يُنصح بعمل backup:
   ```bash
   pg_dump -h localhost -p 5433 -U postgres -d hrdb > backup.sql
   ```

2. **فحص الجداول**: تحقق من وجود الجداول في قاعدة البيانات:
   ```sql
   -- في psql أو أي PostgreSQL client
   \dt
   SELECT * FROM "_prisma_migrations";
   ```

3. **إذا كان الـ migration معقد**: قد تحتاج لحذف السجل يدوياً من جدول `_prisma_migrations`:
   ```sql
   DELETE FROM "_prisma_migrations" 
   WHERE migration_name = '20251020212658_add_monthly_target_model';
   ```

## 🔄 بعد حل المشكلة

بعد حل المشكلة، يجب أن يعمل:
```bash
npm run start:prod
# أو
docker-compose up -d backend
```

يجب أن ترى:
```
✓ Applied X migrations
```

## ✅ Checklist

- [ ] تم تحديد اسم الـ migration الفاشل
- [ ] تم اختيار الخيار المناسب (`--rolled-back` أو `--applied`)
- [ ] تم تنفيذ الأمر لحل المشكلة
- [ ] تم التحقق من حالة الـ migrations
- [ ] تم إعادة تشغيل التطبيق
- [ ] تم التحقق من أن كل شيء يعمل

---

**تم إنشاء هذا الملف لمساعدتك في حل مشاكل Prisma Migrations** 🚀
