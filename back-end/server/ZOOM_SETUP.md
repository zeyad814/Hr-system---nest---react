# 🔑 إعداد Zoom API - دليل كامل

## 📋 الخطوات التفصيلية

### 1️⃣ إنشاء Zoom App في Zoom Marketplace

1. افتح [Zoom App Marketplace](https://marketplace.zoom.us/)
2. سجل دخول بحساب Zoom (يجب أن يكون لديك Zoom account)
3. اضغط على **"Develop"** في القائمة العلوية
4. اختر **"Build App"**
5. اختر **"Server-to-Server OAuth"** (موصى به للإنتاج)

---

### 2️⃣ إعداد Server-to-Server OAuth App

1. املأ معلومات التطبيق:
   - **App Name**: `HR Interview System`
   - **Company Name**: اسم الشركة
   - **Developer Email**: بريد المطور
   - **Description**: `Application for scheduling interviews`

2. اضغط **"Create"**

---

### 3️⃣ الحصول على Credentials

بعد إنشاء التطبيق، ستحتاج إلى:

1. **Account ID**:
   - من صفحة App Information
   - أو من **"Basic Information"** → **"Account ID"**
   - مثال: `abc123xyz`

2. **Client ID**:
   - من قسم **"App Credentials"**
   - انسخ **"Client ID"**

3. **Client Secret**:
   - من نفس قسم **"App Credentials"**
   - اضغط **"Show"** ثم انسخ **"Client Secret"**
   - ⚠️ **مهم**: احفظه في مكان آمن - لن تتمكن من رؤيته مرة أخرى!

4. **User ID** (اختياري):
   - يمكنك استخدام `me` (يعني المستخدم الحالي)
   - أو User ID محدد من Zoom Account

---

### 4️⃣ إعداد Scopes (الأذونات المطلوبة)

في صفحة التطبيق، اذهب إلى **"Scopes"** وأضف:

- ✅ `meeting:write` - لإنشاء وتحديث الاجتماعات
- ✅ `meeting:read` - لقراءة تفاصيل الاجتماعات
- ✅ `meeting:write:admin` - (إذا كنت تستخدم admin privileges)

---

### 5️⃣ إعداد المشروع

#### أ) تحديث .env

افتح ملف `.env` في `back-end/server/` وأضف:

```env
# Zoom API Configuration
ZOOM_ACCOUNT_ID="your-account-id"
ZOOM_CLIENT_ID="your-client-id"
ZOOM_CLIENT_SECRET="your-client-secret"
ZOOM_USER_ID="me"
```

استبدل:
- `your-account-id` بالـ Account ID الحقيقي
- `your-client-id` بالـ Client ID الحقيقي
- `your-client-secret` بالـ Client Secret الحقيقي
- `me` يمكن تغييره لـ User ID محدد

---

## ✅ التحقق من التثبيت

### 1️⃣ أعد تشغيل الـ Backend

```bash
cd back-end/server
npm run start:dev
```

### 2️⃣ ابحث في Logs عن:

```
✅ Zoom API client initialized successfully
```

إذا رأيت هذه الرسالة → **التثبيت نجح!** ✅

---

## 🧪 اختبار Zoom Integration

1. افتح الـ Frontend: http://localhost:8081/admin/interviews
2. اضغط **"جدولة مقابلة"**
3. املأ البيانات واختر **"Zoom"**
4. احفظ المقابلة
5. **يجب أن ترى:**
   - ✅ زر "Start Zoom Meeting" أو "Join Meeting"
   - ✅ اللينك يفتح Zoom meeting حقيقي
   - ✅ الـ meeting موجود في Zoom

---

## ⚠️ استكشاف الأخطاء

### ❌ "Zoom credentials not configured"

**الحل:**
- تأكد من وجود جميع المتغيرات في `.env`:
  - `ZOOM_ACCOUNT_ID`
  - `ZOOM_CLIENT_ID`
  - `ZOOM_CLIENT_SECRET`

### ❌ "Failed to get Zoom access token"

**الحل:**
- تأكد من صحة الـ Account ID
- تأكد من صحة Client ID و Client Secret
- تأكد من أن التطبيق نشط في Zoom Marketplace
- تحقق من Scopes المطلوبة

### ❌ "Failed to create Zoom meeting"

**الحل:**
- تأكد من أن Zoom API لديه الأذونات المطلوبة
- تحقق من الـ User ID (يجب أن يكون `me` أو ID صحيح)
- تأكد من صحة تنسيق التاريخ والوقت

### ❌ "Zoom API client not initialized"

**الحل:**
- تأكد من وجود جميع متغيرات البيئة
- أعد تشغيل الـ Backend

---

## 🔄 Fallback Mechanism

إذا فشل إنشاء اجتماع Zoom (لعدم التكوين أو خطأ)، النظام سيستخدم تلقائياً:
- **Jitsi Meet** كبديل مجاني ويعمل مباشرة

هذا يعني أن النظام سيعمل حتى بدون Zoom API credentials.

---

## 🔐 أمان

⚠️ **مهم جداً:**

1. **لا تشارك** الـ Client Secret أبداً
2. تأكد من إضافة `.env` لـ `.gitignore`
3. لا ترفع ملف `.env` على GitHub أو أي مكان عام
4. استخدم Environment Variables في Production

---

## 📚 مصادر إضافية

- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- [Server-to-Server OAuth](https://marketplace.zoom.us/docs/guides/auth/server-to-server-oauth)
- [Create Meeting API](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetingCreate)
- [OAuth Token Endpoint](https://marketplace.zoom.us/docs/guides/auth/server-to-server-oauth/getting-access-token)

---

## 🆘 المساعدة

إذا واجهت أي مشاكل، تحقق من:
1. Backend logs: `back-end/server`
2. Zoom App Dashboard في Zoom Marketplace
3. Zoom API Status Page
4. Scopes المطلوبة للتطبيق

---

## 📝 ملاحظات

- **Zoom Free Plan**: لديه قيود على عدد الاجتماعات ومدتها
- **Zoom Pro/Business**: موصى به للإنتاج
- **Test Mode**: يمكنك اختبار التكامل في Zoom Sandbox قبل الإنتاج

