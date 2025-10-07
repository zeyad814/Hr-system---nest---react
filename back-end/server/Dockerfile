# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت dependencies (including dev)
RUN npm ci

# نسخ الكود
COPY . .

# توليد Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

# Environment
ENV NODE_ENV=production

# نسخ ملفات package
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت production dependencies فقط
RUN npm ci --omit=dev && npm cache clean --force

# توليد Prisma Client
RUN npx prisma generate

# نسخ الكود المبني
COPY --from=builder /app/dist ./dist

# إنشاء user non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# تعريف المنفذ
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command - مهم جداً!
CMD ["node", "dist/main"]