# 🔧 استكشاف أخطاء Zoom API - دليل الحلول

## ❌ الخطأ: "Invalid Client ID or Client Secret (Status: 400)"

هذا الخطأ يعني أن Zoom API رفض الطلب بسبب بيانات اعتماد غير صحيحة.

---

## ✅ خطوات الحل

### 1️⃣ التحقق من Zoom Marketplace

1. **اذهب إلى**: https://marketplace.zoom.us/
2. **Develop** → **Your Apps** → اختر التطبيق
3. **تحقق من**:
   - التطبيق **مفعل** (Activated) وليس Inactive
   - Scopes موجودة: `meeting:write` و `meeting:read`

---

### 2️⃣ التحقق من Account ID

1. في صفحة التطبيق → **App Credentials**
2. ابحث عن **Account-Level Credentials**
3. **Account ID** يجب أن يكون مثل: `GyLGUy-UQlSQWG__F4E0Bw`
4. **⚠️ مهم**: تأكد من عدم وجود مسافات أو أخطاء

---

### 3️⃣ التحقق من Client ID و Client Secret

1. في نفس صفحة **App Credentials**
2. ابحث عن **Server-to-Server OAuth**
3. إذا لم يكن موجود، اضغط **"Create"**
4. **انسخ القيم الجديدة**:
   - Client ID
   - Client Secret (⚠️ انسخه فوراً - لن تراه مرة أخرى!)

---

### 4️⃣ تحديث ملف .env

افتح `back-end/server/.env` وتأكد من:

```env
ZOOM_ACCOUNT_ID="GyLGUy-UQlSQWG__F4E0Bw"
ZOOM_CLIENT_ID="nVSwWvjpRTObjFxvbjoK8w"
ZOOM_CLIENT_SECRET="ysi1OCwDdgo670iOyNSrZN9EX6Q52a16"
ZOOM_USER_ID="me"
```

**تأكد من**:
- ✅ لا توجد مسافات قبل/بعد القيم
- ✅ القيم بين علامات اقتباس `"`
- ✅ لا توجد أخطاء إملائية

---

### 5️⃣ إعادة إنشاء Client Secret (إذا لزم)

إذا نسيت أو أضاعت Client Secret:

1. في Zoom Marketplace → **App Credentials**
2. في قسم **Server-to-Server OAuth**
3. اضغط **"Delete"** على الـ Secret الحالي
4. اضغط **"Create"** لإنشاء واحد جديد
5. **انسخ القيم الجديدة فوراً**

---

### 6️⃣ التحقق من Scopes

1. في Zoom Marketplace → التطبيق → **Scopes**
2. تأكد من وجود:
   - ✅ `meeting:write`
   - ✅ `meeting:read`
3. إذا لم تكن موجودة، أضفها واضغط **"Save"**

---

### 7️⃣ التحقق من Zoom Plan

⚠️ **مهم**: Zoom Free Plan **لا يدعم** Server-to-Server OAuth!

- ✅ تحتاج **Zoom Pro** على الأقل ($14.99/شهر)
- ✅ أو **Zoom Business**
- ❌ Zoom Free لا يعمل مع API

---

### 8️⃣ إعادة تشغيل Backend

بعد تحديث `.env`:

```bash
cd back-end/server
# أوقف Backend (Ctrl+C)
npm run start:dev
```

---

## 🧪 اختبار سريع

بعد إعادة التشغيل، اختبر:

1. **Browser**: `http://localhost:3000/api/interviews/test-zoom`
2. **أو Terminal**: `curl http://localhost:3000/api/interviews/test-zoom`

---

## 📋 Checklist

- [ ] التطبيق مفعل في Zoom Marketplace
- [ ] Account ID صحيح وموجود في .env
- [ ] Client ID صحيح وموجود في .env
- [ ] Client Secret صحيح وموجود في .env
- [ ] Scopes موجودة (meeting:write, meeting:read)
- [ ] Zoom Plan هو Pro أو Business (ليس Free)
- [ ] Backend أعيد تشغيله بعد تحديث .env

---

## 🔍 رسائل الخطأ الشائعة

### "invalid_client"
- **السبب**: Client ID أو Client Secret غير صحيح
- **الحل**: تحقق من القيم في Zoom Marketplace و`.env`

### "invalid_account"
- **السبب**: Account ID غير صحيح
- **الحل**: تحقق من Account ID في Zoom Marketplace

### "insufficient_scope"
- **السبب**: Scopes غير كافية
- **الحل**: أضف `meeting:write` و `meeting:read`

---

## 🆘 إذا استمرت المشكلة

1. تحقق من Backend logs للأخطاء التفصيلية
2. تحقق من Zoom API Status: https://status.zoom.us/
3. راجع [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)

