import axios from 'axios';
import { Logger } from '../../utils/logger';
import { config } from '../../config/config';

describe('@kafka Event Testing', () => {
  const kafkaClient = axios.create({
    baseURL: config.KAFKA_URL,
    timeout: 10000
  });

  beforeAll(() => {
    Logger.initialize();
  });

  beforeEach(async () => {
    // Clear events before each test
    try {
      await kafkaClient.delete('/events/clear');
    } catch (error) {
      Logger.warn('Could not clear events before test');
    }
  });

  test('should publish order.created event', async () => {
    const event = {
      orderId: 'order-123',
      userId: 'user-1',
      product: 'Laptop',
      quantity: 1,
      price: 999.99,
      status: 'pending'
    };

    const response = await kafkaClient.post('/events/publish', {
      topic: 'order.created',
      event
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('eventId');
    expect(response.data.topic).toBe('order.created');
  });

  test('should validate event schema', async () => {
    const event = {
      orderId: 'order-123',
      userId: 'user-1',
      product: 'Laptop',
      quantity: 1,
      price: 999.99,
      status: 'pending'
    };

    const response = await kafkaClient.post('/events/publish', {
      topic: 'order.created',
      event
    });

    expect(response.status).toBe(201);
  });

  test('should fail with invalid event schema', async () => {
    const invalidEvent = {
      orderId: 'order-123'
      // Missing required fields
    };

    const response = await kafkaClient.post('/events/publish', {
      topic: 'order.created',
      event: invalidEvent
    }).catch(err => err.response);

    expect(response.status).toBe(400);
  });

  test('should retrieve published events', async () => {
    const event = {
      orderId: 'order-456',
      userId: 'user-1',
      product: 'Mouse',
      quantity: 2,
      price: 29.99,
      status: 'shipped'
    };

    await kafkaClient.post('/events/publish', {
      topic: 'order.updated',
      event
    });

    const response = await kafkaClient.get('/topics/order.updated/events');

    expect(response.status).toBe(200);
    expect(response.data.count).toBeGreaterThan(0);
    expect(response.data.events[0].topic).toBe('order.updated');
  });

  test('should list all topics', async () => {
    // Publish events to different topics
    await kafkaClient.post('/events/publish', {
      topic: 'order.created',
      event: {
        orderId: 'order-789',
        userId: 'user-1',
        product: 'Keyboard',
        quantity: 1,
        price: 79.99,
        status: 'pending'
      }
    });

    const response = await kafkaClient.get('/topics');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.topics)).toBe(true);
  });

  test('should get specific event by ID', async () => {
    const publishResponse = await kafkaClient.post('/events/publish', {
      topic: 'order.created',
      event: {
        orderId: 'order-999',
        userId: 'user-1',
        product: 'Monitor',
        quantity: 1,
        price: 299.99,
        status: 'pending'
      }
    });

    const eventId = publishResponse.data.eventId;

    const getResponse = await kafkaClient.get(`/events/${eventId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.data.id).toBe(eventId);
    expect(getResponse.data.topic).toBe('order.created');
  });
});
