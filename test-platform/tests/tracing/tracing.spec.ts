import axios from 'axios';
import { KafkaClient } from '../../kafka-clients/kafka-client';

describe('@tracing Trace Propagation Tests', () => {
  const apiUrl = 'http://localhost:3001';
  const kafka = new KafkaClient();

  test('trace-id flows from API to Kafka event', async () => {
    // clear kafka events
    await kafka.clearEvents();

    const traceId = 'trace-' + Date.now();

    // make API request with trace header
    const loginRes = await axios.post(
      `${apiUrl}/api/login`,
      { email: 'user@test.com', password: 'password123' },
      { headers: { 'x-trace-id': traceId } }
    );

    const token = loginRes.data.token;

    // create order, header should propagate automatically
    await axios.post(
      `${apiUrl}/api/orders`,
      { product: 'TraceTest', quantity: 1, price: 10 },
      { headers: { Authorization: `Bearer ${token}`, 'x-trace-id': traceId } }
    );

    const events = await kafka.getEvents('order.created');
    expect(events.length).toBeGreaterThan(0);

    const last = events[events.length -1];
    expect(last.payload.traceId || last.traceId || last.payload.traceId).toBe(traceId);
  });
});