# Patient Management API

A secure Node.js API for managing patient records with PHI (Protected Health Information) encryption.

## Features

- 🔐 **PHI Encryption**: Phone and email data encrypted using PostgreSQL's pgcrypto
- 🛡️ **Security**: API key authentication, rate limiting, CORS protection
- 📊 **Audit Logging**: Complete audit trail for all patient operations
- 🔄 **Optimistic Concurrency**: ETag-based conflict resolution
- 📝 **Validation**: Comprehensive input validation with Zod
- 🏥 **Healthcare Standards**: MRN generation, proper data validation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database:**
   ```bash
   # Make sure PostgreSQL is running
   createdb demo
   
   # Run migrations
   npm run migrate
   
   # Seed with sample data
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Docker Setup

1. **Start all services:**
   ```bash
   make up
   ```

2. **Seed database:**
   ```bash
   make seed
   ```

3. **Check health:**
   ```bash
   make health
   make ready
   ```

## API Endpoints

### Base URL: `http://localhost:8080/api/v1`

All endpoints require the `x-api-key` header.

### Patients

- `POST /patients` - Create a new patient
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient (requires If-Match header)
- `GET /patients` - Search patients with pagination

### Health Checks

- `GET /healthz` - Basic health check
- `GET /readyz` - Readiness check (database + pgcrypto)

## Example Usage

### Create a Patient

```bash
curl -X POST http://localhost:8080/api/v1/patients \
  -H "x-api-key: change-me-secure-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-01",
    "sex": "male",
    "phone": "+1234567890",
    "email": "john.doe@email.com",
    "addressLine1": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "countryCode": "US"
  }'
```

### Get a Patient

```bash
curl -X GET http://localhost:8080/api/v1/patients/{patient-id} \
  -H "x-api-key: change-me-secure-api-key-here"
```

### Search Patients

```bash
curl -X GET "http://localhost:8080/api/v1/patients?search=Smith&limit=10" \
  -H "x-api-key: change-me-secure-api-key-here"
```

## Environment Variables

```env
# Database
DATABASE_URL=postgres://postgres:123brinz@localhost:5432/demo
DB_HOST=localhost
DB_PORT=5432
DB_NAME=demo
DB_USER=postgres
DB_PASSWORD=123brinz

# API Security
API_KEY=change-me-secure-api-key-here
CRYPTO_KEY=change-me-min-32-chars-encryption-key

# CORS
WEB_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=60
```

## Database Schema

### Patients Table
- `id` (ULID) - Primary key
- `mrn` (HOS-YYYYNNNN) - Medical Record Number
- `first_name`, `last_name` - Patient names
- `dob` - Date of birth
- `sex` - Gender (male/female/other/unknown)
- `phone`, `email` - Encrypted PHI data
- `address_line1`, `city`, `postal_code`, `country_code` - Address
- `created_at`, `updated_at` - Timestamps

### Audit Log Table
- `id` - Auto-increment primary key
- `at` - Timestamp
- `actor` - Who performed the action
- `action` - CREATE_PATIENT or UPDATE_PATIENT
- `patient_id` - Reference to patient
- `ip`, `user_agent` - Request metadata
- `diff` - JSON of changed fields

## Security Features

- **PHI Encryption**: Phone and email encrypted with pgcrypto
- **API Key Authentication**: Required for all endpoints
- **Rate Limiting**: 60 requests per 5 minutes
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Comprehensive validation with Zod
- **Audit Logging**: Complete audit trail
- **ETag Support**: Optimistic concurrency control

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Available Commands

```bash
make help      # Show available commands
make install   # Install dependencies
make up        # Start services
make down      # Stop services
make logs      # Show logs
make seed      # Seed database
make test      # Run tests
make clean     # Clean up
```

## Error Codes

- `VALIDATION_FAILED` - Input validation failed
- `CONFLICT` - Resource already exists
- `NOT_FOUND` - Resource not found
- `PRECONDITION_REQUIRED` - If-Match header required
- `PRECONDITION_FAILED` - ETag mismatch
- `RATE_LIMITED` - Too many requests
- `UNAUTHORIZED` - Invalid or missing API key

## Development Notes

- The application uses ULID for patient IDs (not UUID)
- MRN format: HOS-YYYYNNNN (e.g., HOS-20251234)
- Phone numbers must be in E.164 format
- Country codes must be ISO-3166-1 alpha-2
- All timestamps are in UTC
- ETags are SHA256 hashes of canonical JSON
