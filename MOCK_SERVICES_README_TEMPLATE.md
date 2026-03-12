# E2E Mock Services

[![License](https://img.shields.io/github/license/yourusername/e2e-mock-services)](LICENSE)

A collection of **mock microservices** designed to support comprehensive end-to-end testing. These services provide realistic interfaces for testing UI automation, API contracts, event streaming, and distributed system patterns.

> **Primary Repository:** This is a supporting repository. For the complete test automation framework, see:
> 
> 👉 [enterprise-e2e-test-platform](https://github.com/yourusername/enterprise-e2e-test-platform)

---

## 📦 Services Included

### 1. Frontend UI (Port 3000)
React-based web application with authentication and data management.

**Pages:**
- Login page with JWT authentication
- Dashboard (authenticated)
- Orders management (CRUD operations)

**Technology:** Node.js, Express, HTML/CSS/JavaScript

---

### 2. Mock API Service (Port 3001)
RESTful API providing authentication, user, and order management endpoints.

**Key Endpoints:**
```
POST   /api/login                # User authentication (returns JWT)
GET    /api/users                # List all users
GET    /api/current-user         # Get authenticated user
GET    /api/orders               # List orders (paginated)
POST   /api/orders               # Create new order
PUT    /api/orders/:id           # Update order
DELETE /api/orders/:id           # Delete order
GET    /health                   # Health check
GET    /metrics                  # Prometheus metrics
```

**Features:**
- JWT token authentication
- Request validation (Joi schemas)
- Error handling
- Prometheus metrics export
- Health check endpoint

**Technology:** Node.js, Express, SQLite (in-memory)

---

### 3. Kafka Event Service (Port 3003)
Event streaming service for publishing and consuming business events.

**Topics:**
- `order.created` – When a new order is placed
- `order.updated` – When an order is modified
- `order.deleted` – When an order is cancelled

**Endpoints:**
```
POST   /events/publish           # Publish an event
GET    /events                   # List all published events
GET    /events/:id               # Get specific event
GET    /topics                   # List all topics
GET    /topics/:topic/events     # Events for a topic
GET    /health                   # Health check
```

**Features:**
- In-memory event storage
- Event schema validation
- Topic management
- Event replay capability

**Technology:** Node.js, Express, KafkaJS

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
```

### Option 2: Local Development
```bash
# Install dependencies
npm install

# Terminal 1: Frontend UI
npm run start:ui

# Terminal 2: Mock API
npm run start:api

# Terminal 3: Kafka Service
npm run start:kafka
```

### Verify Services
```bash
curl http://localhost:3000          # Frontend UI
curl http://localhost:3001/health   # Mock API
curl http://localhost:3003/health   # Kafka Service
```

---

## 🧪 Testing These Services

Complete automated testing framework is available in the enterprise-e2e-test-platform repository:

```bash
# Clone test framework repo
git clone https://github.com/yourusername/enterprise-e2e-test-platform
cd enterprise-e2e-test-platform

# Follow setup instructions in that repo's README
```

---

## 📁 Directory Structure

```
e2e-mock-services/
├── apps/
│   ├── frontend-ui/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── mock-api-service/
│       ├── server.js
│       ├── package.json
│       └── Dockerfile
├── services/
│   └── kafka/
│       ├── server.js
│       ├── package.json
│       └── Dockerfile
├── docker/
│   └── docker-compose.yml
├── package.json
└── README.md
```

---

## 🐳 Docker Compose

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

---

## 📊 Service Dependencies

```
┌──────────────────┐
│  Frontend UI     │
│   (Port 3000)    │
└────────┬─────────┘
         │ HTTP
┌────────▼─────────┐
│   Mock API       │
│   (Port 3001)    │
└────────┬─────────┘
         │ HTTP Events
┌────────▼──────────┐
│  Kafka Service    │
│  (Port 3003)      │
└───────────────────┘
```

---

## 🔐 Authentication

### Getting a Token
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'

# Response:
# {
#   "token": "eyJhbGc...",
#   "user": { "id": "1", "email": "user@test.com" }
# }
```

### Using the Token
```bash
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 📝 Example Requests

### Create Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRD001",
    "quantity": 2,
    "totalPrice": 99.99
  }'
```

### Publish Event
```bash
curl -X POST http://localhost:3003/events/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "order.created",
    "event": {
      "orderId": "ORD123",
      "userId": "USR456",
      "totalPrice": 99.99,
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }'
```

---

## 🛠️ Configuration

### Environment Variables
```bash
# Frontend UI
FRONTEND_PORT=3000

# Mock API
API_PORT=3001
KAFKA_URL=http://localhost:3003
SECRET_KEY=test-secret-key

# Kafka Service
KAFKA_PORT=3003
```

See `.env.example` for all available options.

---

## 🔄 Service Communication Flow

```
1. User logs in via Frontend UI
   ↓
2. Frontend sends credentials to Mock API /api/login
   ↓
3. Mock API returns JWT token
   ↓
4. Frontend stores token, redirects to dashboard
   ↓
5. User creates order via Frontend UI
   ↓
6. Frontend sends order to Mock API with JWT
   ↓
7. Mock API validates order and publishes event to Kafka
   ↓
8. Kafka Service stores event and broadcasts it
   ↓
9. Event is available for consumption at /topics/order.created/events
```

---

## 📊 Metrics

Mock API exposes Prometheus-compatible metrics:

```bash
curl http://localhost:3001/metrics
```

Available metrics:
- `api_requests_total` – Total API requests
- `api_request_duration_seconds` – Request latency histogram
- `api_errors_total` – Error count
- `http_requests_by_endpoint` – Requests per endpoint

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

### Services Won't Start
```bash
# Clean Docker
docker system prune -a
docker-compose down
docker-compose up -d
```

### Authentication Failures
```bash
# Verify token format
Authorization: Bearer <token>

# Ensure token is not expired
# Check /api/current-user endpoint
```

---

## 📚 Related Repositories

- [enterprise-e2e-test-platform](https://github.com/yourusername/enterprise-e2e-test-platform) – Comprehensive test automation framework for these services

---

## 📄 License

MIT License

---

**Version:** 1.0.0  
**Status:** Stable

---

> ℹ️ These mock services are designed primarily for testing and demonstration purposes. For production use, implement proper authentication, database persistence, and security hardening.
