# 🚀 تشغيل Backend محلياً (خارج Docker)

## الخطوات:

### الخطوة 1: إيقاف Backend Container

```bash
docker-compose stop backend
```

أو إذا كنت تريد حذفه تماماً:

```bash
docker-compose stop backend
docker-compose rm -f backend
```

---

### الخطوة 2: إبقاء Database شغال في Docker

```bash
docker-compose up -d postgres
```

تأكد أن Database شغال:

```bash
docker ps --filter "name=hrdb"
```

يجب أن ترى:
```
hrdb   Up (healthy)   0.0.0.0:5433->5432/tcp
```

---

### الخطوة 3: إعداد Backend للتشغيل المحلي

#### أ) انتقل لمجلد Backend:

```bash
cd back-end\server
```

#### ب) تحديث `.env` file

افتح `back-end/server/.env` وتأكد من:

```env
# Database URL - للاتصال بـ Docker database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/hrdb"

# JWT Secret
JWT_SECRET="your-jwt-secret-key"

# Node Environment
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:3000
```

**⚠️ مهم:** غيّر `@postgres:5432` إلى `@localhost:5433`

---

### الخطوة 4: تثبيت Dependencies

```bash
npm install
```

---

### الخطوة 5: Generate Prisma Client

```bash
npx prisma generate
```

---

### الخطوة 6: تطبيق Migrations (إذا لزم الأمر)

```bash
npx prisma migrate deploy
```

أو للـ reset:

```bash
npx prisma migrate reset --force
```

---

### الخطوة 7: تشغيل Backend

#### Development Mode (موصى به):

```bash
npm run start:dev
```

#### Production Mode:

```bash
npm run build
npm run start:prod
```

---

## ✅ التحقق من النجاح

### 1. يجب أن ترى في Terminal:

```
[Nest] INFO [NestApplication] Nest application successfully started +Xms
```

### 2. Backend يعمل على:

```
http://localhost:3000
```

### 3. اختبار API:

افتح المتصفح:

```
http://localhost:3000/api
```

يجب أن يظهر response من API.

---

## 🔄 الآن Frontend سيتصل بـ Backend المحلي

Frontend في Docker سيتصل تلقائياً بـ `localhost:3000`

إذا كان في مشكلة، تأكد من `.env` في Frontend:

```env
VITE_API_BASE=http://localhost:3000/api
```

---

## 📊 الحالة النهائية

- ✅ Database: شغال في Docker على port `5433`
- ✅ Backend: شغال محلياً على port `3000`
- ✅ Frontend: شغال في Docker على port `8080`

---

## 🔍 Debugging

### المشكلة: Cannot connect to database

**الحل:**

1. تأكد أن Database شغال:
```bash
docker ps --filter "name=hrdb"
```

2. تأكد من DATABASE_URL في `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/hrdb"
```

3. جرب الاتصال:
```bash
npx prisma studio
```

---

### المشكلة: Port 3000 already in use

**الحل:**

1. ابحث عن Process يستخدم port 3000:
```bash
netstat -ano | findstr :3000
```

2. اقتل الـ process:
```bash
taskkill /F /PID <PID>
```

---

## 🆘 العودة لـ Docker Mode

إذا كنت تريد تشغيل Backend في Docker مرة أخرى:

```bash
# Stop local backend (Ctrl+C in terminal)

# Start backend container
docker-compose up -d backend

# Update .env to use Docker database URL
# DATABASE_URL="postgresql://postgres:postgres@postgres:5432/hrdb"
```

---

## ✨ مميزات التشغيل المحلي

- ✅ Hot reload أسرع
- ✅ Debugging أسهل
- ✅ تعديل الكود مباشرة
- ✅ استخدام breakpoints
- ✅ Performance أفضل

---

**الآن Backend جاهز للتطوير المحلي!** 🚀
