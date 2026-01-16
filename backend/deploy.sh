#!/bin/bash

# Deployment script for Reconciliation Engine Backend

set -e

echo "🚀 Starting Reconciliation Engine Backend Deployment..."

# Check if service .env files exist
if [ ! -f services/ingestion-service/.env ]; then
    echo "⚠️  ingestion-service/.env not found. Creating default .env file..."
    cat > services/ingestion-service/.env << 'EOF'
INGESTION_SERVICE_PORT=3002
KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=ingestion-service
AUTO_START=false
EOF
    echo "✅ Created ingestion-service/.env file. Please review and update if needed."
fi

if [ ! -f services/reconciliation-service/.env ]; then
    echo "⚠️  reconciliation-service/.env not found. Creating default .env file..."
    cat > services/reconciliation-service/.env << 'EOF'
RECONCILIATION_SERVICE_PORT=3001
KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=reconciliation-service
NODE_ENV=production
# DATABASE_URL=postgresql://user:password@host:5432/database
EOF
    echo "✅ Created reconciliation-service/.env file. Please review and update if needed."
    echo "⚠️  IMPORTANT: Update DATABASE_URL in reconciliation-service/.env if using an external database!"
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check ingestion service
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Ingestion service is healthy"
else
    echo "⚠️  Ingestion service health check failed"
fi

# Check reconciliation service
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Reconciliation service is healthy"
else
    echo "⚠️  Reconciliation service health check failed"
fi

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Services:"
echo "  - Ingestion Service: http://localhost:3002"
echo "  - Reconciliation Service: http://localhost:3001"
echo ""
echo "To start ingestion:"
echo "  curl -X POST http://localhost:3002/ingestion/start"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
