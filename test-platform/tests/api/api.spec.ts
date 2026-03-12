import axios from 'axios';
import * as joi from 'joi';
import { ApiClient } from '../../api-clients/api-client';
import { loginResponseSchema, orderSchema } from '../../schemas/schemas';

describe('@api Login API Tests', () => {
  let client: ApiClient;
  let token: string;

  beforeAll(() => {
    client = new ApiClient();
  });

  test('should login successfully', async () => {
    const response = await client.post('/api/login', {
      email: 'user@test.com',
      password: 'password123'
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data.user).toHaveProperty('email');

    const validated = client.validateResponse(response, loginResponseSchema);
    token = validated.token;
    expect(token).toBeDefined();
  });

  test('should fail login with invalid credentials', async () => {
    const response = await client.post('/api/login', {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });

    expect(response.status).toBe(401);
    expect(response.data).toHaveProperty('message');
  });

  test('should fail login with missing email', async () => {
    const response = await client.post('/api/login', {
      password: 'password123'
    });

    expect(response.status).toBe(400);
  });
});

describe('@api Order API Tests', () => {
  let client: ApiClient;
  let token: string;

  beforeAll(async () => {
    client = new ApiClient();
    const response = await client.post('/api/login', {
      email: 'user@test.com',
      password: 'password123'
    });
    token = response.data.token;
    client.setToken(token);
  });

  test('should retrieve orders list', async () => {
    const response = await client.get('/api/orders');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    if (response.data.length > 0) {
      client.validateResponse(response, joi.array().items(orderSchema));
    }
  });

  test('should create new order', async () => {
    const response = await client.post('/api/orders', {
      product: 'Test Product',
      quantity: 1,
      price: 99.99
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.product).toBe('Test Product');
  });

  test('should fail creating order with invalid data', async () => {
    const response = await client.post('/api/orders', {
      product: 'P',
      quantity: 0,
      price: -10
    });

    expect([400, 422]).toContain(response.status);
  });

  test('should retrieve specific order', async () => {
    const listResponse = await client.get('/api/orders');
    if (listResponse.data.length > 0) {
      const orderId = listResponse.data[0].id;
      const response = await client.get(`/api/orders/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(orderId);
    }
  });

  test('should delete order', async () => {
    const createResponse = await client.post('/api/orders', {
      product: 'Delete Test',
      quantity: 1,
      price: 50
    });

    const orderId = createResponse.data.id;
    const deleteResponse = await client.delete(`/api/orders/${orderId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.id).toBe(orderId);
  });
});
