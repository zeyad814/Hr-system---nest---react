# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

# نسخ package files
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت جميع dependencies
RUN npm ci

# توليد Prisma Client
RUN npx prisma generate

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# نسخ dependencies من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# نسخ الكود المصدري
COPY . .

# Build التطبيق
RUN npm run build

# تحقق من وجود dist folder
RUN ls -la /app/dist && echo "✓ dist folder exists" || (echo "✗ dist folder missing!" && exit 1)

# ==========================================
# Stage 3: Production
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# نسخ package files
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# توليد Prisma Client
RUN npx prisma generate

# نسخ dist من builder
COPY --from=builder /app/dist ./dist

# تحقق من نسخ dist بنجاح
RUN ls -la /app/dist && echo "✓ dist copied successfully"

# إنشاء non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main"]