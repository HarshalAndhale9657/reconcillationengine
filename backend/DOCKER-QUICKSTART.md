# Docker Quick Start

## One-Command Deployment

```bash
cd backend
./deploy.sh
```

Or manually:

```bash
cd backend

# Create .env files for each service (see README-DOCKER.md for template)
# Then:
docker-compose up -d
```

## Control Ingestion Service (No SSH Required)

### Start Ingestion
```bash
curl -X POST http://localhost:3002/ingestion/start
```

### Stop Ingestion
```bash
curl -X POST http://localhost:3002/ingestion/stop
```

### Check Status
```bash
curl http://localhost:3002/ingestion/status
```

## Service URLs

- **Ingestion Service:** http://localhost:3002
- **Reconciliation Service:** http://localhost:3001
- **Health Checks:**
  - http://localhost:3002/health
  - http://localhost:3001/health

## Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f ingestion-service
docker-compose logs -f reconciliation-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Check service status
docker-compose ps
```

## Environment Variables

Each service has its own `.env` file:
- `services/ingestion-service/.env` - Ingestion service configuration
- `services/reconciliation-service/.env` - Reconciliation service configuration

Key variables:
- `AUTO_START=true` - Auto-start ingestion on service start (in ingestion-service/.env)
- `KAFKA_BROKERS` - Kafka broker addresses
- `DATABASE_URL` - Database connection string (in reconciliation-service/.env, if using external DB)

See `.env.example` files in each service directory for all available options.
