# 📖 الدليل الهندسي الشامل: بناء وتشغيل قاعدة بيانات سحابية (PostgreSQL) على Hostinger VPS من الصفر

هذا الدليل هو مرجعك الكامل والمغلق خطوة بخطوة، مصمم لكي ينقلك من نقطة الصفر وحتى يكون لديك **سيرفر قاعدة بيانات سحابي خاص بك للأبد** (بديل كامل لـ Supabase)، بدون أن ترفع كود واجهة موقعك، وبمساحة 50GB+ وتكلفة أقل من 7$ شهرياً، مع كل خطأ محتمل وطريقة حله فوراً.

---

## 🧭 الفكرة باختصار (قبل أن تبدأ)
1. **أنت لا ترفع كود الموقع إلى السيرفر.** (HTML, CSS, JS تظل على جهازك أو Vercel أو استضافة مجانية).
2. **أنت تستخدم سيرفر هوستنجر كمخزن سحابي فقط (Cloud Database).**
3. السيرفر سيشغل 3 خدمات داخل حاويات معزولة وخفيفة جداً (Docker):
   * **PostgreSQL 15:** محرك قاعدة البيانات لحفظ الجداول والدرجات.
   * **PostgREST:** محول ذكي يحول قاعدة البيانات إلى REST API فوراً وبنفس دوال سوبابيز.
   * **Caddy:** لتوليد وتجديد شهادة الأمان HTTPS المشفرة مجاناً وتوجيه الرابط.

---

## 🛒 المرحلة 1: شراء وإعداد السيرفر في هوستنجر (Hostinger)

1. ادخل على [Hostinger.com](https://hostinger.com) واختر **VPS Hosting**.
2. اختر خطة **KVM 1 VPS** (سعرها بحدود 5.49$ إلى 6$ شهرياً).
3. في شاشة إعداد السيرفر (Setup Wizard):
   * **الموقع (Location):** اختر الأقرب للمنطقة (مثلاً: فرنسا France أو ألمانيا Germany).
   * **نظام التشغيل (Operating System):** **[نقطة حرجة]** اختر:
     `Plain OS` -> `Ubuntu 22.04 64bit`
     *(لا تختر أنظمة معها لوحات تحكم مثل CyberPanel أو Docker Template مسبق التثبيت؛ اختر نظاماً نقياً Plain OS لتفادي حجز المنافذ).*
   * **كلمة مرور الـ Root:** استخدم كلمة مرورك الموحدة: `akram@198@H2009` (واحتفظ بها بأمان).
4. بعد اكتمال التثبيت، ستظهر لك لوحة السيرفر وبها **عنوان الآي بي (IP Address)** الخاص بسيرفرك، انسخه.

---

## 🌐 المرحلة 2: ضبط الدومين المجاني (DuckDNS)

1. ادخل على حسابك في [DuckDNS.org](https://www.duckdns.org).
2. في قائمة الدومينات لديك الدومين: `trackingprogramforakram`.
3. احذف الـ IP القديم، وضع **الـ IP الجديد** الخاص بسيرفر هوستنجر الذي نسخته من الخطوة السابقة.
4. اضغط زر **Update IP**. *(الآن أي شخص يزور هذا الرابط سيتوجه لسيرفرك مباشرة).*

---

## 💻 المرحلة 3: الدخول وتجهيز السيرفر (أوامر سريعة)

افتح موجه الأوامر على جهازك (PowerShell أو Terminal) واكتب:

### 1. الدخول عبر SSH:
```bash
ssh root@IP_السيرفر_الجديد
```
*(سيطلب منك كتابة `yes` لأول مرة، ثم تدخل كلمة المرور).*

### 2. تثبيت البرامج الأساسية وضمان خلو المنافذ:
انسخ هذه الأوامر دفعة واحدة والصقها في شاشة السيرفر:
```bash
# تحديث السيرفر
apt update -y && apt upgrade -y

# تثبيت دوكر وأدوات النقل
apt install -y docker.io docker-compose-v2 git curl lsof

# إيقاف أي خدمة افتراضية قد تحجز المنفذ 80 أو 443
systemctl stop apache2 nginx 2>/dev/null
systemctl disable apache2 nginx 2>/dev/null

# إنشاء مجلد السيرفر
mkdir -p /root/server
```

---

## 📂 المرحلة 4: رفع ملفات التشغيل من جهازك إلى السيرفر

افتح **نافذة PowerShell جديدة على جهازك الشخصي** داخل مسار مشروعك:
`c:\Users\akram\OneDrive\Desktop\appsakramakl\Tracking program - All App\tracking program for akram`

نفذ هذا الأمر لنقل ملفات مجلد `server` بالكامل إلى السيرفر:
```powershell
scp -r ".\server\*" root@IP_السيرفر_الجديد:/root/server/
```
*(خلال 10 ثوانٍ ستكون كل الملفات: docker-compose, init.sql, Caddyfile, .env فوق السيرفر).*

---

## 🚀 المرحلة 5: إطلاق السيرفر وتشغيله

ارجع لشاشة السيرفر (SSH) ونفذ الأمرين التاليين:
```bash
cd /root/server
docker compose up -d
```

**مبروك!** الآن:
* أنشأ السيرفر قاعدة بيانات PostgreSQL كاملة بجميع جداول تطبيق التحفيظ من ملف `init.sql`.
* أطلق محرك PostgREST لخدمة الـ API.
* أصدر Caddy شهادة SSL خضراء وآمنة للرابط: `https://trackingprogramforakram.duckdns.org`.

---

## 🔄 المرحلة 6: نقل البيانات القديمة من سوبابيز (إن وجدت)

إذا كان لديك طلاب ودرجات قديمة في سوبابيز وتريد نقلها:
1. في سوبابيز: اذهب إلى **Project Settings** -> **Database** -> انسخ رابط الاتصال **URI Connection String**.
2. من شاشة السيرفر نفذ:
```bash
# سحب البيانات فقط في ملف data.sql
pg_dump "رابط_سوبابيز_الذي_نسخته" --data-only --schema=public > /root/server/data.sql

# حقن البيانات في قاعدة بيانات السيرفر
docker exec -i quran_postgres psql -U postgres -d postgres < /root/server/data.sql
```

---

## 🏢 المرحلة 7: كيف تضيف مشروعاً جديداً كلياً مستقبلاً دون أي تضارب؟

إذا أردت إنشاء تطبيق جديد تماماً على نفس السيرفر (مثل متجر أو تطبيق لجهة أخرى):

1. **أنشئ قاعدة بيانات معزولة له على نفس السيرفر:**
   ```bash
   docker exec -it quran_postgres psql -U postgres -c "CREATE DATABASE project2_db;"
   ```
2. **احجز دومين فرعي مجاني جديد في DuckDNS:**
   * مثلاً: `project2akram.duckdns.org` واربطه بنفس آي بي السيرفر.
3. **أضف التوجيه في ملف `Caddyfile`:**
   افتح ملف Caddyfile:
   ```bash
   nano /root/server/Caddyfile
   ```
   وأضف تحته:
   ```caddyfile
   project2akram.duckdns.org {
       reverse_proxy postgrest2:3001
   }
   ```
   ثم أعد تشغيل Caddy:
   ```bash
   docker compose restart caddy
   ```
*بهذه الطريقة كل مشروع له قاعدة بياناته المعزولة ورابطه المشفر الخاص دون أي تداخل في الجداول أو الأسماء.*

---

## ⚠️ الأخطاء المحتملة وطرق حلها الفورية الحاسمة

### الخطأ 1: `Bind for 0.0.0.0:80 failed: port is already allocated`
* **السبب:** عملية بالنظام (مثل سيرفر ويب افتراضي) استولت على المنفذ 80 قبل دوكر.
* **الحل الفوري:**
  ```bash
  kill -9 $(lsof -t -i:80) 2>/dev/null || fuser -k 80/tcp
  systemctl stop apache2 nginx httpd 2>/dev/null
  systemctl disable apache2 nginx httpd 2>/dev/null
  cd /root/server && docker compose up -d
  ```

---

### الخطأ 2: الموقع يظهر `Connection Refused` أو لا يفتح
* **السبب:** جدار الحماية (Firewall) في السيرفر يغلق المنافذ الخارجية.
* **الحل:**
  ```bash
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 22/tcp
  ufw reload
  ```

---

### الخطأ 3: شهادة الأمان (SSL) لا تصدر أو المتصفح يقول `Not Secure`
* **السبب:** الدومين في DuckDNS لم يتم تحديثه بالـ IP الجديد للسيرفر بعد.
* **الحل:**
  1. تأكد من تحديث الـ IP في موقع DuckDNS واضغط Update IP.
  2. اعرض سبب الخطأ من Caddy لمعرفته:
     ```bash
     docker logs quran_caddy --tail 50
     ```

---

### الخطأ 4: انقطاع الكهرباء أو إعادة تشغيل السيرفر (Server Reboot)
* **هل أحتاج لإعادة كتابة أوامر؟**
* **لا نهائياً!** قمنا بوضع تعليمة `restart: always` في `docker-compose.yml`، وهذا يعني أن السيرفر بمجرد أن يقلع سيعيد تشغيل قاعدة البيانات والـ API والشهادة تلقائياً في الخلفية.

---

### الخطأ 5: كيف آخذ نسخة احتياطية من كل بياناتي (Backup) على جهازي؟
* من داخل السيرفر:
  ```bash
  docker exec -t quran_postgres pg_dump -U postgres postgres > /root/server/backup_$(date +%F).sql
  ```
* لتنزيل الملف إلى جهازك الشخصي عبر PowerShell:
  ```powershell
  scp root@IP_السيرفر:/root/server/backup_*.sql ./
  ```

---

## 🛠️ بطاقة الأوامر السريعة اليومية

| الإجراء | الأمر |
| :--- | :--- |
| **تشغيل الخدمات** | `cd /root/server && docker compose up -d` |
| **إيقاف الخدمات** | `cd /root/server && docker compose down` |
| **فحص حالة الحاويات** | `docker ps` |
| **عرض سجلات قاعدة البيانات** | `docker logs quran_postgres -f` |
| **فحص المساحة الفارغة** | `df -h` |
| **فحص استهلاك الرام** | `free -m` |
