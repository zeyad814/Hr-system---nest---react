FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

RUN echo "=== Checking build output ===" && \
    ls -la && \
    echo "=== dist folder ===" && \
    ls -la dist/ && \
    echo "=== dist contents ===" && \
    find dist -type f

RUN npm prune --production

EXPOSE 3000

ENV NODE_ENV=production

# ✅ المسار الصحيح
CMD ["npm", "run", "start:prod"]
