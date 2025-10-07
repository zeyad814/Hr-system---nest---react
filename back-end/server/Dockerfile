FROM node:22-alpine

WORKDIR /app

# نسخ package files أولاً للـ caching
COPY package*.json ./

# نسخ prisma schema
COPY prisma ./prisma/

# تثبيت كل dependencies (بما فيها dev)
RUN npm install

# توليد Prisma Client
RUN npx prisma generate

# نسخ كل الكود
COPY . .

# Build
RUN npm run build

# Debug: تحقق من dist
RUN echo "=== Checking build output ===" && \
    ls -la && \
    echo "=== dist folder ===" && \
    ls -la dist/ && \
    echo "=== dist contents ===" && \
    find dist -type f

# حذف dev dependencies لتقليل الحجم
RUN npm prune --production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]