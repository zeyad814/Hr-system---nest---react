# 🌱 كيفية تشغيل Database Seeder

## طرق تشغيل الـ Seeder

### ✅ الطريقة 1: من داخل Docker Container (موصى بها)

افتح PowerShell أو CMD وشغل الأمر التالي:

```bash
docker exec hr-backend npm run seed
```

أو:

```bash
docker-compose exec backend npm run seed
```

---

### ✅ الطريقة 2: باستخدام الـ Script الجاهز

شغل الملف:

```bash
run-seeder.bat
```

---

### ✅ الطريقة 3: محلياً (إذا كنت تشغل Backend خارج Docker)

```bash
cd back-end\server
npm run seed
```

---

## 📝 البيانات التي سيتم إنشاؤها:

| الدور | البريد الإلكتروني | كلمة المرور | الاسم |
|------|------------------|------------|-------|
| ADMIN | admin@test.com | Pass123! | مدير النظام |
| HR | hr@test.com | Pass123! | موظف الموارد البشرية |
| SALES | sales@test.com | Pass123! | موظف المبيعات |
| CLIENT | client@test.com | Pass123! | عميل تجريبي |
| APPLICANT | applicant@test.com | Pass123! | متقدم للوظيفة |

---

## ✅ التحقق من نجاح التنفيذ:

بعد تشغيل الـ Seeder، يجب أن ترى الرسائل التالية:

```
🌱 Starting seed...
✅ Created user: مدير النظام (admin@test.com)
✅ Created user: موظف الموارد البشرية (hr@test.com)
✅ Created user: موظف المبيعات (sales@test.com)
✅ Created user: عميل تجريبي (client@test.com)
✅ Created client profile for: عميل تجريبي
✅ Created user: متقدم للوظيفة (applicant@test.com)
✅ Created applicant profile for: متقدم للوظيفة
🎉 Seed completed successfully!
```

---

## ⚠️ في حالة ظهور رسالة "User already exists":

هذا يعني أن البيانات موجودة بالفعل في قاعدة البيانات. لا داعي للقلق!

إذا كنت تريد إعادة تشغيل الـ Seeder من جديد:

### خيار 1: حذف المستخدمين الحاليين من قاعدة البيانات

```bash
docker exec hr-backend npx prisma studio
```

ثم احذف المستخدمين يدوياً من الـ UI.

### خيار 2: إعادة تشغيل قاعدة البيانات من الصفر

```bash
docker-compose down -v
docker-compose up -d
```

**⚠️ تحذير:** هذا سيحذف جميع البيانات في قاعدة البيانات!

---

## 🧪 تجربة تسجيل الدخول:

بعد تشغيل الـ Seeder، افتح المتصفح:

```
http://localhost:8080/login
```

جرب تسجيل الدخول بأي من الحسابات المذكورة أعلاه:
- البريد: `admin@test.com`
- كلمة المرور: `Pass123!`

---

## 📞 في حالة المشاكل:

### المشكلة: "Cannot connect to database"
**الحل:**
```bash
docker-compose ps
```
تأكد أن container `hrdb` يعمل بحالة `healthy`.

### المشكلة: "Prisma not found"
**الحل:**
```bash
docker exec hr-backend npm install
docker exec hr-backend npx prisma generate
```

### المشكلة: "bcrypt error"
**الحل:**
```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

---

✅ **الآن جاهز لتشغيل الـ seeder!** 🚀
