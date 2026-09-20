# دليل تشغيل خادم Microsoft SQL Server على Hostinger VPS
## منصة التحفيظ والمتابعة القرآنية

يحتوي هذا المجلد (`server/`) على خادم الـ API والـ Realtime Gateway المخصص للربط بين تطبيق المتصفح وقاعدة بيانات **Microsoft SQL Server** مع دعم الـ **Multi-Tenancy**.

---

### 1. المتطلبات على سيرفر Hostinger VPS:
- تثبيت **Node.js** (الإصدار 18 أو أحدث).
- تثبيت مدير العمليات **PM2**:
  ```bash
  npm install -g pm2
  ```

---

### 2. خطوات التثبيت والتشغيل:

#### الخطوة الأولى: رفع مجلد `server/` إلى الـ VPS:
يمكنك رفع المجلد إلى أي مسار في السيرفر (مثلاً: `/var/www/quran-api/` أو داخل مجلد موقعك).

#### الخطوة الثانية: تثبيت الحزم:
افتح الطرفية (Terminal / SSH) داخل مجلد `server/` ونفذ:
```bash
npm install
```

#### الخطوة الثالثة: التحقق من إعدادات ملف `.env`:
ملف `.env` جاهز ومضبوط مسبقاً ببيانات الاتصال:
```env
PORT=3000
DB_SERVER=168.231.78.55
DB_PORT=1434
DB_DATABASE=quran_groups
DB_USER=smartuser
DB_PASSWORD=Admin@3030!
DB_TRUST_SERVER_CERTIFICATE=true
DEFAULT_TENANT_ID=e8b0a943-2c1b-4f93-8f0a-1a8e9d6c7b5e
```

#### الخطوة الرابعة: إنشاء الجداول في SQL Server:
قم بفتح أداة **SQL Server Management Studio (SSMS)** أو تشغيل السكربت:
[`mssql_schema.sql`](../mssql_schema.sql)
داخل قاعدة البيانات `quran_groups` لإنشاء جميع الجداول والفهارس وحقول `tenantid`.

#### الخطوة الخامسة: نقل البيانات من Supabase إلى SQL Server (اختياري):
لنقل جميع الطلاب والحلقات والدرجات والخطط السابقة من Supabase إلى MS SQL Server تلقائياً مع ربطها بـ `tenantid`، نفذ الأمر التالي:
```bash
npm run migrate
```

#### الخطوة السادسة: تشغيل الخادم بشكل دائم عبر PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### 3. نقاط النهاية المتاحة (API Endpoints):
- `GET /health` : فحص حالة الخادم واتصاله بقاعدة البيانات.
- `POST /api/query` : الاستعلام مع الفلترة بـ `tenantid`.
- `POST /api/getDoc` : جلب سجل محدد بواسطة المعرف.
- `POST /api/addDoc` : إضافة سجل مع بث التحديث عبر WebSockets.
- `PUT /api/updateDoc` : تحديث سجل مع بث التحديث.
- `DELETE /api/deleteDoc` : حذف سجل مع بث التحديث.
- `POST /api/batch` : تنفيذ عمليات مجمعة داخل Transaction واحدة.
- `WS /` : اتصال Socket.io لبث التحديثات الحية لحظياً بين المعلمين والمشرفين.
