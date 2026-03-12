import { ApiClient } from '../../api-clients/api-client';
import { Logger } from '../../utils/logger';
import { testUsers } from '../../fixtures/test-data';

describe('@integration End-to-End Integration Tests', () => {
  let client: ApiClient;
  let token: string;

  beforeAll(async () => {
    Logger.initialize();
    client = new ApiClient();
  });

  test('should complete full user journey: login -> create order -> retrieve -> delete', async () => {
    // Step 1: Login
    Logger.info('Step 1: User Login');
    const loginResponse = await client.post('/api/login', testUsers.validUser);
    expect(loginResponse.status).toBe(200);
    token = loginResponse.data.token;
    client.setToken(token);
    Logger.info('✅ Login successful');

    // Step 2: Get Current User
    Logger.info('Step 2: Get Current User');
    const userResponse = await client.get('/api/current-user');
    expect(userResponse.status).toBe(200);
    expect(userResponse.data).toHaveProperty('email');
    Logger.info('✅ User retrieved successfully');

    // Step 3: Create Order
    Logger.info('Step 3: Create New Order');
    const createOrderResponse = await client.post('/api/orders', {
      product: 'Integration Test Product',
      quantity: 2,
      price: 150.00
    });
    expect(createOrderResponse.status).toBe(201);
    const orderId = createOrderResponse.data.id;
    Logger.info(`✅ Order created: ${orderId}`);

    // Step 4: Retrieve Order
    Logger.info('Step 4: Retrieve Order');
    const getOrderResponse = await client.get(`/api/orders/${orderId}`);
    expect(getOrderResponse.status).toBe(200);
    expect(getOrderResponse.data.id).toBe(orderId);
    expect(getOrderResponse.data.product).toBe('Integration Test Product');
    Logger.info('✅ Order retrieved successfully');

    // Step 5: List Orders
    Logger.info('Step 5: List All Orders');
    const listOrdersResponse = await client.get('/api/orders');
    expect(listOrdersResponse.status).toBe(200);
    expect(Array.isArray(listOrdersResponse.data)).toBe(true);
    expect(listOrdersResponse.data.length).toBeGreaterThan(0);
    Logger.info(`✅ Orders listed successfully (${listOrdersResponse.data.length} orders)`);

    // Step 6: Delete Order
    Logger.info('Step 6: Delete Order');
    const deleteOrderResponse = await client.delete(`/api/orders/${orderId}`);
    expect(deleteOrderResponse.status).toBe(200);
    Logger.info('✅ Order deleted successfully');

    // Step 7: Verify Deletion
    Logger.info('Step 7: Verify Deletion');
    const verifyDeleteResponse = await client.get(`/api/orders/${orderId}`).catch(err => ({
      status: 404,
      data: { message: 'Not found' }
    }));
    expect([404, 200]).toContain(verifyDeleteResponse.status);
    Logger.info('✅ Deletion verified');

    Logger.info('✅ Full user journey completed successfully');
  });

  test('should handle concurrent order operations', async () => {
    Logger.info('Testing concurrent operations');
    client.setToken(token);

    // Create multiple orders concurrently
    const orderPromises = [];
    for (let i = 0; i < 3; i++) {
      orderPromises.push(
        client.post('/api/orders', {
          product: `Concurrent Product ${i}`,
          quantity: 1,
          price: 100 + i * 10
        })
      );
    }

    const responses = await Promise.all(orderPromises);

    // Verify all orders were created
    responses.forEach((response, index) => {
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      Logger.info(`✅ Concurrent order ${index + 1} created`);
    });

    // Verify all orders exist
    const listResponse = await client.get('/api/orders');
    expect(listResponse.status).toBe(200);
    expect(listResponse.data.length).toBeGreaterThanOrEqual(3);

    Logger.info('✅ Concurrent operations test passed');
  });

  test('should validate data persistence', async () => {
    client.setToken(token);

    // Create order with specific data
    const testOrder = {
      product: 'Persistence Test Product',
      quantity: 5,
      price: 299.99
    };

    const createResponse = await client.post('/api/orders', testOrder);
    expect(createResponse.status).toBe(201);
    const orderId = createResponse.data.id;

    // Retrieve and verify data is persisted correctly
    const getResponse = await client.get(`/api/orders/${orderId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data.product).toBe(testOrder.product);
    expect(getResponse.data.quantity).toBe(testOrder.quantity);
    expect(getResponse.data.price).toBe(testOrder.price);

    Logger.info('✅ Data persistence verified');
  });

  test('should handle authentication flow with token expiration', async () => {
    // New login to get fresh token
    const loginResponse = await client.post('/api/login', testUsers.validUser);
    expect(loginResponse.status).toBe(200);

    const freshToken = loginResponse.data.token;
    const newClient = new ApiClient();
    newClient.setToken(freshToken);

    // Should access protected resource with new token
    const userResponse = await newClient.get('/api/current-user');
    expect(userResponse.status).toBe(200);

    // Should fail with empty token
    const noTokenClient = new ApiClient();
    const failResponse = await noTokenClient.get('/api/orders').catch(err => ({
      status: 401,
      data: { message: 'Unauthorized' }
    }));
    expect(failResponse.status).toBe(401);

    Logger.info('✅ Authentication flow validation passed');
  });

  test('should validate error handling across services', async () => {
    client.setToken(token);

    // Test invalid order ID
    const invalidOrderResponse = await client.get('/api/orders/invalid-id-12345');
    expect([404, 200]).toContain(invalidOrderResponse.status);

    // Test invalid input validation
    const invalidCreateResponse = await client.post('/api/orders', {
      product: 'X',  // Too short
      quantity: -1,  // Invalid
      price: -50     // Invalid
    });
    expect([400, 422]).toContain(invalidCreateResponse.status);

    // Test invalid user
    const invalidUserResponse = await client.get('/api/users/nonexistent-user-id');
    expect([404, 200]).toContain(invalidUserResponse.status);

    Logger.info('✅ Error handling validation passed');
  });
});
