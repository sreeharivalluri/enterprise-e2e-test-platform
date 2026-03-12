import { ApiClient } from '../../api-clients/api-client';
import * as joi from 'joi';
import { loginRequestSchema, loginResponseSchema } from '../../contracts/api/login.schema';
import { userSchema, usersListSchema } from '../../contracts/api/user.schema';
import { orderSchema, ordersListSchema } from '../../contracts/api/order.schema';

describe('@contracts API Contract Tests', () => {
  let client: ApiClient;

  beforeAll(async () => {
    client = new ApiClient();
    await client.login('user@test.com', 'password123');
  });

  test('login request/response contract', async () => {
    const body = { email: 'user@test.com', password: 'password123' };
    const { error: reqErr } = loginRequestSchema.validate(body);
    expect(reqErr).toBeUndefined();

    const response = await client.post('/api/login', body);
    expect(response.status).toBe(200);
    const { error: resErr } = loginResponseSchema.validate(response.data);
    expect(resErr).toBeUndefined();
  });

  test('users list contract', async () => {
    const res = await client.get('/api/users');
    expect(res.status).toBe(200);
    const { error } = usersListSchema.validate(res.data);
    expect(error).toBeUndefined();
  });

  test('orders contract', async () => {
    const res = await client.get('/api/orders');
    expect(res.status).toBe(200);
    const { error } = ordersListSchema.validate(res.data);
    expect(error).toBeUndefined();
  });
});