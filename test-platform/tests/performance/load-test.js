import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Ramp up
    { duration: '30s', target: 10 },  // Hold load
    { duration: '5s', target: 0 }     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1']
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  // Test login endpoint
  let loginRes = http.post(`${BASE_URL}/api/login`, {
    email: 'user@test.com',
    password: 'password123'
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login time < 500ms': (r) => r.timings.duration < 500,
    'login response has token': (r) => r.body.includes('token')
  });

  let token = '';
  try {
    token = JSON.parse(loginRes.body).token;
  } catch (e) {
    console.error('Failed to parse token');
  }

  // Test orders endpoint
  let ordersRes = http.get(`${BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  check(ordersRes, {
    'orders status is 200': (r) => r.status === 200,
    'orders time < 500ms': (r) => r.timings.duration < 500,
    'orders response is array': (r) => r.body.includes('[') || r.body.includes(']')
  });

  // Test create order
  let createRes = http.post(
    `${BASE_URL}/api/orders`,
    {
      product: 'Test Product',
      quantity: 1,
      price: 99.99
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'create time < 1000ms': (r) => r.timings.duration < 1000,
    'created order has id': (r) => r.body.includes('id')
  });

  sleep(1);
}
