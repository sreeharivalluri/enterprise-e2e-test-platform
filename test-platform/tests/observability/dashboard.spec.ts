import axios from 'axios';
import { config } from '../../config/config';

describe('@observability Dashboard Tests', () => {
  const grafana = axios.create({
    baseURL: config.GRAFANA_URL,
    timeout: 10000
  });

  const prometheus = axios.create({
    baseURL: config.PROMETHEUS_URL,
    timeout: 10000
  });

  test('Grafana server should be reachable', async () => {
    const response = await grafana.get('/api/health');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('database');
    expect(response.data).toHaveProperty('version');
  });

  test('Grafana should list dashboards', async () => {
    const response = await grafana.get('/api/search', { params: { query: '' } });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Prometheus should accept a simple query', async () => {
    const response = await prometheus.get('/api/v1/query', { params: { query: 'up' } });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.data).toHaveProperty('result');
  });
});
