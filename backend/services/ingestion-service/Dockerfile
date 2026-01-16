# Multi-stage build for ingestion service
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/common ./packages/common
COPY services/ingestion-service ./services/ingestion-service

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build common package
WORKDIR /app/packages/common
RUN pnpm build

# Build ingestion service
WORKDIR /app/services/ingestion-service
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
COPY services/ingestion-service ./services/ingestion-service

# Install all dependencies (needed for workspace packages)
RUN pnpm install --frozen-lockfile

# Copy built files
COPY --from=base /app/packages/common/dist ./packages/common/dist
COPY --from=base /app/services/ingestion-service/dist ./services/ingestion-service/dist

# Set working directory to service
WORKDIR /app/services/ingestion-service

# Expose port
EXPOSE 3002

# Start the service
CMD ["node", "dist/server.js"]
