FROM node:20-alpine

# تحديد مسار العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الحزم لتثبيتها أولاً (للاستفادة من الكاش)
COPY package*.json ./

# تثبيت المكتبات (نسخة الإنتاج فقط)
RUN npm install --production

# نسخ باقي ملفات المشروع
COPY . .

# فتح البورت الذي سيعمل عليه السيرفر
EXPOSE 3000

# أمر تشغيل السيرفر
CMD ["node", "server.js"]
