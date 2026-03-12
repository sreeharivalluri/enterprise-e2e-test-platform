# API Documentation

## Mock API Service (http://localhost:3001)

### Authentication

All endpoints except `/health` and `/metrics` require JWT authentication.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Authentication

#### POST /api/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "user@test.com",
    "name": "Test User"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

#### GET /api/current-user
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "user-1",
  "email": "user@test.com",
  "name": "Test User"
}
```

---

### 2. Users Management

#### GET /api/users
List all users.

**Response (200):**
```json
[
  {
    "id": "user-1",
    "email": "user@test.com",
    "name": "Test User"
  }
]
```

---

#### GET /api/users/:id
Get specific user by ID.

**Parameters:**
- `id` (string, required) - User ID

**Response (200):**
```json
{
  "id": "user-1",
  "email": "user@test.com",
  "name": "Test User"
}
```

**Error (404):**
```json
{
  "message": "User not found"
}
```

---

### 3. Orders Management

#### GET /api/orders
List all orders for authenticated user.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-1",
    "product": "Laptop",
    "quantity": 1,
    "price": 999.99,
    "status": "pending",
    "createdAt": "2026-03-11T10:30:00Z"
  }
]
```

---

#### GET /api/orders/:id
Get specific order by ID.

**Parameters:**
- `id` (string, required) - Order ID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-1",
  "product": "Laptop",
  "quantity": 1,
  "price": 999.99,
  "status": "pending",
  "createdAt": "2026-03-11T10:30:00Z"
}
```

---

#### POST /api/orders
Create new order.

**Request:**
```json
{
  "product": "Laptop",
  "quantity": 1,
  "price": 999.99
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-1",
  "product": "Laptop",
  "quantity": 1,
  "price": 999.99,
  "status": "pending",
  "createdAt": "2026-03-11T10:30:00Z"
}
```

**Validation Rules:**
- `product`: String, minimum 3 characters (required)
- `quantity`: Integer, minimum 1 (required)
- `price`: Number, must be positive (required)

**Error (400):**
```json
{
  "message": "Validation failed: product length must be at least 3 characters"
}
```

---

#### DELETE /api/orders/:id
Delete order by ID.

**Parameters:**
- `id` (string, required) - Order ID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-1",
  "product": "Laptop",
  "quantity": 1,
  "price": 999.99,
  "status": "pending",
  "createdAt": "2026-03-11T10:30:00Z"
}
```

---

### 4. Observability

#### GET /health
Health check endpoint (no authentication required).

**Response (200):**
```json
{
  "status": "ok",
  "service": "mock-api-service",
  "timestamp": "2026-03-11T10:30:00Z"
}
```

---

#### GET /metrics
Prometheus metrics (no authentication required).

**Response (200):**
```
# HELP api_requests_total Total API requests
# TYPE api_requests_total counter
api_requests_total 1000

# HELP api_request_duration_seconds Request duration
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{le="0.1"} 800
api_request_duration_seconds_bucket{le="0.5"} 950
api_request_duration_seconds_bucket{le="1"} 1000

# HELP api_errors_total Total API errors
# TYPE api_errors_total counter
api_errors_total 5
```

---

## Kafka Service (http://localhost:3003)

### Event Topics

#### order.created
Published when a new order is created.

**Payload:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-1",
  "product": "Laptop",
  "quantity": 1,
  "price": 999.99,
  "status": "pending"
}
```

#### order.updated
Published when an order is updated.

**Payload:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "shipped"
}
```

#### order.deleted
Published when an order is deleted.

**Payload:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Kafka Endpoints

#### POST /events/publish
Publish event to Kafka topic.

**Request:**
```json
{
  "topic": "order.created",
  "event": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-1",
    "product": "Laptop",
    "quantity": 1,
    "price": 999.99,
    "status": "pending"
  }
}
```

**Response (201):**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "topic": "order.created",
  "message": "Event published"
}
```

---

#### GET /events
List all events with optional filtering.

**Query Parameters:**
- `topic` (string, optional) - Filter by topic

**Response (200):**
```json
{
  "count": 5,
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "topic": "order.created",
      "payload": { "..." },
      "timestamp": "2026-03-11T10:30:00Z",
      "partition": 0
    }
  ]
}
```

---

#### GET /events/:id
Get specific event by ID.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "topic": "order.created",
  "payload": { "..." },
  "timestamp": "2026-03-11T10:30:00Z",
  "partition": 0
}
```

---

#### GET /topics/:topic/events
Get all events for specific topic.

**Response (200):**
```json
{
  "topic": "order.created",
  "count": 3,
  "events": [...]
}
```

---

#### GET /topics
List all available topics.

**Response (200):**
```json
{
  "topics": ["order.created", "order.updated", "order.deleted"],
  "totalTopics": 3
}
```

---

#### DELETE /events/clear
Clear all events (for testing only).

**Response (200):**
```json
{
  "message": "Events cleared"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed: <details>"
}
```

### 401 Unauthorized
```json
{
  "message": "Missing token" or "Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'
```

**List Orders:**
```bash
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer <token>"
```

**Create Order:**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "product": "Laptop",
    "quantity": 1,
    "price": 999.99
  }'
```

### Using Postman

1. Import the requests above
2. Create a `token` variable
3. Run Login request first
4. Use token in subsequent requests
5. Test different scenarios

---

## Rate Limiting

Currently no rate limiting is implemented. In production, add:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## Pagination

Currently no pagination is implemented. In production, add query parameters:

```
GET /api/orders?page=1&limit=10
GET /api/users?page=1&limit=10
```

---

## Response Time

**Target SLA:**
- API endpoints: < 500ms
- Health check: < 100ms
- Metrics: < 200ms

---

**Last Updated:** March 2026
