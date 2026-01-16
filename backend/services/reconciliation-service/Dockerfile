# Multi-stage build for reconciliation service
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/common ./packages/common
COPY services/reconciliation-service ./services/reconciliation-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build common package
WORKDIR /app/packages/common
RUN pnpm build

# Generate Prisma client
WORKDIR /app/services/reconciliation-service
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build reconciliation service
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/common ./packages/common
COPY services/reconciliation-service ./services/reconciliation-service

# Install dependencies (including Prisma for migrations)
RUN pnpm install --frozen-lockfile

# Copy built files and Prisma generated files
COPY --from=base /app/packages/common/dist ./packages/common/dist
COPY --from=base /app/services/reconciliation-service/dist ./services/reconciliation-service/dist
COPY --from=base /app/services/reconciliation-service/generated ./services/reconciliation-service/generated
COPY --from=base /app/services/reconciliation-service/prisma ./services/reconciliation-service/prisma

# Set working directory to service
WORKDIR /app/services/reconciliation-service

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "dist/src/server.js"]
