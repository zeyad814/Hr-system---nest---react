# 🔑 إعداد Google Meet API - دليل كامل

## 📋 الخطوات التفصيلية

### 1️⃣ إنشاء Google Cloud Project

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. سجل دخول بحساب Google
3. اضغط القائمة المنسدلة → **"NEW PROJECT"**
4. املأ البيانات:
   - **Project Name**: `HR Interview System`
   - **Location**: `No organization`
5. اضغط **"CREATE"**

---

### 2️⃣ تفعيل Google Calendar API

1. من القائمة الجانبية → **"APIs & Services"** → **"Library"**
2. ابحث عن: `Google Calendar API`
3. اضغط على النتيجة
4. اضغط **"ENABLE"**

---

### 3️⃣ إنشاء Service Account

1. من القائمة → **"APIs & Services"** → **"Credentials"**
2. اضغط **"CREATE CREDENTIALS"** → **"Service Account"**
3. املأ:
   - **Service account name**: `interview-scheduler`
   - **Service account ID**: `interview-scheduler`
   - **Description**: `Service account for scheduling interviews`
4. اضغط **"CREATE AND CONTINUE"**
5. في **"Grant access"**:
   - **Role**: اختر `Editor`
6. اضغط **"CONTINUE"** → **"DONE"**

---

### 4️⃣ تحميل Credentials JSON

1. في صفحة **Credentials**
2. تحت **"Service Accounts"** → اضغط على `interview-scheduler`
3. اضغط تبويب **"KEYS"**
4. اضغط **"ADD KEY"** → **"Create new key"**
5. اختر **JSON**
6. اضغط **"CREATE"**
7. **سيتم تحميل الملف تلقائياً** ✅

شكل الملف:
```json
{
  "type": "service_account",
  "project_id": "hr-interview-system-xxxxx",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "interview-scheduler@hr-interview-system.iam.gserviceaccount.com",
  "client_id": "123456789...",
  ...
}
```

---

### 5️⃣ إعداد Google Calendar

#### أ) إنشاء Calendar جديد

1. افتح [Google Calendar](https://calendar.google.com/)
2. من الجانب → اضغط **"+"** بجانب "Other calendars"
3. اختر **"Create new calendar"**
4. املأ:
   - **Name**: `HR Interviews`
   - **Description**: `Calendar for scheduling HR interviews`
   - **Time zone**: اختر منطقتك
5. اضغط **"Create calendar"**

#### ب) مشاركة Calendar مع Service Account

1. في قائمة Calendars → اضغط **"⋮"** بجانب "HR Interviews"
2. اختر **"Settings and sharing"**
3. اذهب **"Share with specific people"**
4. اضغط **"Add people"**
5. الصق الـ **client_email** من ملف JSON:
   ```
   interview-scheduler@hr-interview-system-xxxxx.iam.gserviceaccount.com
   ```
6. **Permissions**: اختر **"Make changes to events"**
7. اضغط **"Send"**

#### ج) الحصول على Calendar ID

1. في نفس صفحة Settings
2. قسم **"Integrate calendar"**
3. انسخ **"Calendar ID"**
   ```
   مثال: abc123xyz@group.calendar.google.com
   ```

---

### 6️⃣ إعداد المشروع

#### أ) حفظ ملف Credentials

1. انسخ ملف JSON المُحمل
2. ضعه في:
   ```
   back-end/server/config/google-credentials.json
   ```

#### ب) تحديث .env

افتح ملف `.env` وحدّث القيم:

```env
# Google Calendar API Configuration
GOOGLE_CALENDAR_ID="abc123xyz@group.calendar.google.com"
GOOGLE_CREDENTIALS_PATH="./config/google-credentials.json"
```

استبدل:
- `abc123xyz@group.calendar.google.com` بالـ Calendar ID الحقيقي

---

## ✅ التحقق من التثبيت

### 1️⃣ أعد تشغيل الـ Backend

```bash
cd back-end/server
npm run start:dev
```

### 2️⃣ ابحث في Logs عن:

```
✅ Google Calendar API initialized successfully
📅 Using Calendar ID: abc123xyz@group.calendar.google.com
```

إذا رأيت هذه الرسالة → **التثبيت نجح!** ✅

---

## 🧪 اختبار Google Meet

1. افتح الـ Frontend: http://localhost:8081/admin/interviews
2. اضغط **"جدولة مقابلة"**
3. املأ البيانات واختر **"Google Meet"**
4. احفظ المقابلة
5. **يجب أن ترى:**
   - ✅ زر "انضم للاجتماع"
   - ✅ اللينك يفتح Google Meet حقيقي
   - ✅ الـ meeting موجود في Google Calendar

---

## ⚠️ استكشاف الأخطاء

### ❌ "Google Meet credentials not configured"

**الحل:**
- تأكد من وجود ملف `config/google-credentials.json`
- تأكد من `.env` يحتوي على `GOOGLE_CREDENTIALS_PATH` و `GOOGLE_CALENDAR_ID`

### ❌ "Google credentials file not found"

**الحل:**
- تأكد من المسار صحيح: `./config/google-credentials.json`
- تأكد من وجود مجلد `config`

### ❌ "Failed to create Google Meet link"

**الحل:**
- تأكد من مشاركة Calendar مع Service Account
- تأكد من الـ Permissions: **"Make changes to events"**
- تأكد من تفعيل Google Calendar API

---

## 🔐 أمان

⚠️ **مهم جداً:**

1. **لا تشارك** ملف `google-credentials.json` أبداً
2. تأكد من إضافته لـ `.gitignore`:
   ```
   config/google-credentials.json
   ```
3. لا ترفع الملف على GitHub أو أي مكان عام

---

## 📚 مصادر إضافية

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Creating Google Meet Links](https://developers.google.com/calendar/api/guides/create-events#conferencing)

---

## 🆘 المساعدة

إذا واجهت أي مشاكل، تحقق من:
1. Backend logs: `back-end/server`
2. Google Cloud Console errors
3. Calendar sharing permissions
