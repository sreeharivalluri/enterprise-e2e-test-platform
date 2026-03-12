import { orderEventSchema } from '../../contracts/events/order.schema';
import { KafkaClient } from '../../kafka-clients/kafka-client';

describe('@contracts Kafka Event Contract Tests', () => {
  let kafka: KafkaClient;

  beforeAll(() => {
    kafka = new KafkaClient();
  });

  test('order.created event schema', async () => {
    const event = {
      id: 'evt-123',
      traceId: 'trace-abc',
      topic: 'order.created',
      timestamp: new Date().toISOString(),
      data: {
        id: 'order-1',
        userId: 'user-1',
        product: 'Widget',
        quantity: 2,
        price: 100,
        status: 'created'
      }
    };

    const { error } = orderEventSchema.validate(event);
    expect(error).toBeUndefined();
  });

  test('publish and validate real event', async () => {
    const order = {
      product: 'Gadget',
      quantity: 1,
      price: 50
    };

    // publish using kafka client and then retrieve from service
    await kafka.publish('order.created', { ...order, id: 'order-2', userId: 'user-2', status: 'created' });
    const events = await kafka.getEvents('order.created');
    expect(events.length).toBeGreaterThan(0);
    const { error } = orderEventSchema.validate(events[events.length - 1]);
    expect(error).toBeUndefined();
  });
});