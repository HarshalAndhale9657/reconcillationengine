# Docker Deployment Guide

This guide explains how to deploy the Reconciliation Engine backend using Docker.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM

## Quick Start

1. **Create environment files for each service:**

   Create `services/ingestion-service/.env`:
   ```bash
   # Ingestion Service Configuration
   INGESTION_SERVICE_PORT=3002
   KAFKA_BROKERS=kafka:29092
   KAFKA_CLIENT_ID=ingestion-service
   AUTO_START=false
   ```

   Create `services/reconciliation-service/.env`:
   ```bash
   # Reconciliation Service Configuration
   RECONCILIATION_SERVICE_PORT=3001
   KAFKA_BROKERS=kafka:29092
   KAFKA_CLIENT_ID=reconciliation-service
   NODE_ENV=production
   # DATABASE_URL=postgresql://user:password@host:5432/database  # If using external database
   ```

2. **Update environment variables** in each service's `.env` file as needed (especially `DATABASE_URL` if using an external database)

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f ingestion-service
   docker-compose logs -f reconciliation-service
   ```

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### Ingestion Service
- **Port:** 3002 (configurable via `INGESTION_SERVICE_PORT`)
- **Health Check:** `http://localhost:3002/health`
- **Start Ingestion:** `POST http://localhost:3002/ingestion/start`
- **Stop Ingestion:** `POST http://localhost:3002/ingestion/stop`
- **Status:** `GET http://localhost:3002/ingestion/status`

### Reconciliation Service
- **Port:** 3001 (configurable via `RECONCILIATION_SERVICE_PORT` in service's `.env`)
- **Health Check:** `http://localhost:3001/health`
- **Note:** Database connection should be configured in the service's `.env` file

### Kafka
- **Port:** 9092 (configurable via `KAFKA_PORT`)

## Starting Ingestion Service from Outside

The ingestion service can be started/stopped via HTTP endpoints without SSH access:

```bash
# Start ingestion
curl -X POST http://localhost:3002/ingestion/start

# Stop ingestion
curl -X POST http://localhost:3002/ingestion/stop

# Check status
curl http://localhost:3002/ingestion/status
```

## Environment Variables

Each service uses its own `.env` file:

**Ingestion Service** (`services/ingestion-service/.env`):
- `INGESTION_SERVICE_PORT`: Service port (default: 3002)
- `KAFKA_BROKERS`: Kafka broker addresses (default: kafka:29092)
- `KAFKA_CLIENT_ID`: Kafka client ID
- `AUTO_START`: Set to `true` to automatically start ingestion when the service starts

**Reconciliation Service** (`services/reconciliation-service/.env`):
- `RECONCILIATION_SERVICE_PORT`: Service port (default: 3001)
- `DATABASE_URL`: Database connection string (if using external database)
- `KAFKA_BROKERS`: Kafka broker addresses (default: kafka:29092)
- `KAFKA_CLIENT_ID`: Kafka client ID
- `NODE_ENV`: Environment (production/development)

## Building Images

To rebuild the Docker images:

```bash
docker-compose build
```

To rebuild a specific service:

```bash
docker-compose build ingestion-service
docker-compose build reconciliation-service
```

## Database Migrations

If you need to run database migrations manually:

```bash
docker-compose exec reconciliation-service npx prisma migrate deploy --schema=./prisma/schema.prisma
```

Or run migrations locally if you have the database configured in your local `.env`.

## Troubleshooting

1. **Services won't start:**
   - Check logs: `docker-compose logs`
   - Ensure ports are not already in use
   - Verify Docker has enough resources allocated

2. **Database connection issues:**
   - Check `DATABASE_URL` in `services/reconciliation-service/.env`
   - Ensure your external database is accessible from the container

3. **Kafka connection issues:**
   - Ensure Kafka is healthy: `docker-compose ps kafka`
   - Check `KAFKA_BROKERS` in `.env`

4. **Ingestion service not responding:**
   - Check health endpoint: `curl http://localhost:3002/health`
   - View logs: `docker-compose logs ingestion-service`

## Production Deployment

For production deployment:

1. Use strong passwords for PostgreSQL
2. Set `NODE_ENV=production`
3. Use environment-specific Kafka brokers
4. Consider using Docker secrets for sensitive data
5. Set up proper networking and firewall rules
6. Use a reverse proxy (nginx/traefik) for SSL termination
