import axios from 'axios';

describe('@chaos Simulated Failure Tests', () => {
  const apiUrl = 'http://localhost:3001';

  test('service should fail when chaos mode enabled', async () => {
    // enable chaos
    await axios.post(`${apiUrl}/admin/chaos/enable`);

    try {
      await axios.get(`${apiUrl}/health`);
    } catch (err: any) {
      expect(err.response).toBeDefined();
      expect(err.response.status).toBe(500);
    }

    // disable chaos
    await axios.post(`${apiUrl}/admin/chaos/disable`);

    const res = await axios.get(`${apiUrl}/health`);
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });

  test('kafka broker outage simulation', async () => {
    const kafkaUrl = 'http://localhost:3003';
    // enable kafka chaos
    await axios.post(`${kafkaUrl}/admin/chaos/enable`);

    try {
      await axios.post(`${kafkaUrl}/events/publish`, { topic: 'order.created', event: { id: 'x' } });
    } catch (err: any) {
      expect(err.response.status).toBe(503);
    }

    // disable chaos
    await axios.post(`${kafkaUrl}/admin/chaos/disable`);
    const res = await axios.get(`${kafkaUrl}/health`);
    expect(res.status).toBe(200);
  });
});