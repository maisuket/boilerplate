# Stage 1: Dependencies
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev && \
    npm install --save-dev prisma && \
    npx prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=development --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main"]
