# Finance Tracker App - Containerized with Podman

This repository contains a Finance Tracker application with a Spring Boot backend and React frontend, designed to run in containers with Podman.

## Project Structure

```
finance-tracker/
├── backend/           # Spring Boot backend application
├── frontend/          # React frontend application
├── docker-compose.yml # Compose file for orchestration
└── README.md          # This file
```

## Prerequisites

- [Podman](https://podman.io/getting-started/installation)
- [Podman Compose](https://github.com/containers/podman-compose#installation) (for easier orchestration)

## Running with Podman

### Method 1: Using Podman Compose

The easiest way to get started is using Podman Compose:

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker

# Start all services
podman-compose up -d

# View logs (optional)
podman-compose logs -f
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api

### Method 2: Using Plain Podman

If you don't have Podman Compose, you can use Podman directly:

1. Create a network:
```bash
podman network create finance-network
```

2. Run PostgreSQL:
```bash
podman run -d --name finance-postgres \
  --network finance-network \
  -e POSTGRES_DB=financedb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

3. Build and run the backend:
```bash
cd backend
podman build -t finance-backend .
podman run -d --name finance-backend \
  --network finance-network \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://finance-postgres:5432/financedb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -e APP_CORS_ALLOWED_ORIGINS=http://localhost:80,http://finance-frontend \
  -p 8080:8080 \
  finance-backend
```

4. Build and run the frontend:
```bash
cd ../frontend
podman build -t finance-frontend .
podman run -d --name finance-frontend \
  --network finance-network \
  -p 80:80 \
  finance-frontend
```

## Development Workflow

For development, you can make changes to the source code and rebuild the containers:

```bash
# Update backend
cd backend
podman build -t finance-backend .
podman stop finance-backend
podman rm finance-backend
# Run the container again as shown above

# Update frontend
cd ../frontend
podman build -t finance-frontend .
podman stop finance-frontend
podman rm finance-frontend
# Run the container again as shown above
```

With Podman Compose, you can rebuild and restart services more easily:

```bash
podman-compose up -d --build backend  # Rebuild only backend
podman-compose up -d --build frontend # Rebuild only frontend
podman-compose up -d --build          # Rebuild all services
```

## Accessing the Database

You can connect to the PostgreSQL database using:

```bash
podman exec -it finance-postgres psql -U postgres -d financedb
```

## Stopping the Application

```bash
# Using Podman Compose
podman-compose down

# To also remove the volumes (data will be lost!):
podman-compose down -v

# Using plain Podman
podman stop finance-frontend finance-backend finance-postgres
podman rm finance-frontend finance-backend finance-postgres
```

## Troubleshooting

1. If you get a "permission denied" error when mounting volumes, try running:
```bash
podman machine set --rootful
podman machine stop
podman machine start
```

2. Check container logs:
```bash
podman logs finance-backend
podman logs finance-frontend
podman logs finance-postgres
```

3. If the backend can't connect to the database, ensure that PostgreSQL is fully initialized before starting the backend.

## Security Notes

- The default JWT secret and database credentials are for development only. In production, use environment variables or secrets management to provide secure values.
- The default configuration exposes the PostgreSQL port to the host. In production, consider only exposing it within the container network.