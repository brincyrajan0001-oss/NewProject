# Patient Management API Makefile

.PHONY: help install up down logs seed test clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install    - Install dependencies"
	@echo "  up         - Start services with Docker Compose"
	@echo "  down       - Stop services"
	@echo "  logs       - Show logs from all services"
	@echo "  seed       - Seed database with sample data"
	@echo "  test       - Run tests"
	@echo "  clean      - Clean up containers and volumes"

# Install dependencies
install:
	npm install

# Start services
up:
	docker-compose up -d
	@echo "Services started. API available at http://localhost:8080"

# Stop services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Seed database
seed:
	docker-compose exec api npm run seed

# Run tests
test:
	npm test

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Development commands
dev:
	npm run dev

# Migration
migrate:
	npm run migrate

# Health check
health:
	curl -f http://localhost:8080/healthz || echo "Health check failed"

# Ready check
ready:
	curl -f http://localhost:8080/readyz || echo "Readiness check failed"
