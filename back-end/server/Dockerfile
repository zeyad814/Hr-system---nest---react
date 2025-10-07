# استخدام Node.js 22 كـ base image
FROM node:22-alpine AS builder

WORKDIR /app

# نسخ package files
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت dependencies
RUN npm ci --include=dev

# نسخ الكود
COPY . .

# Build التطبيق
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# نسخ package files
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت production dependencies فقط
RUN npm ci --omit=dev

# نسخ الكود المبني
COPY --from=builder /app/dist ./dist

# تشغيل prisma generate
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]