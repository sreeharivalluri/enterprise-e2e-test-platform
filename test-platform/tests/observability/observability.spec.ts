import axios from 'axios';
import { config } from '../../config/config';

describe('@observability Observability Tests', () => {
  const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 10000
  });

  test('should expose metrics endpoint', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.status).toBe(200);
    expect(response.data).toContain('api_requests_total');
    expect(response.data).toContain('api_request_duration_seconds');
  });

  test('should have valid Prometheus metrics format', async () => {
    const response = await apiClient.get('/metrics');
    const lines = response.data.split('\n').filter((line: string) => !line.startsWith('#'));

    // Check for metric lines with values
    const metricLines = lines.filter((line: string) => line.trim().length > 0);
    expect(metricLines.length).toBeGreaterThan(0);

    // Each metric line should have name and value
    metricLines.forEach((line: string) => {
      expect(line).toMatch(/\w+.*?\d+/);
    });
  });

  test('should have counters in metrics', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.data).toContain('TYPE');
    expect(response.data).toContain('counter');
  });

  test('should have histograms in metrics', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.data).toContain('histogram');
    expect(response.data).toContain('_bucket{');
  });

  test('should track request latency', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.data).toContain('api_request_duration_seconds');
  });

  test('should track error rates', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.data).toContain('api_errors_total');
  });

  test('should expose health check endpoint', async () => {
    const response = await apiClient.get('/health');

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status');
    expect(response.data.status).toBe('ok');
  });

  test('health check should include service name', async () => {
    const response = await apiClient.get('/health');

    expect(response.data).toHaveProperty('service');
    expect(response.data.service).toBeDefined();
  });

  test('should record database queries', async () => {
    const response = await apiClient.get('/metrics');

    expect(response.data).toContain('db_queries_total');
  });

  // Service level objective validations
  test('error rate should be below 0.1%', async () => {
    const response = await apiClient.get('/metrics');
    const data = response.data;
    const errorsMatch = data.match(/api_errors_total\s+(\d+)/);
    const requestsMatch = data.match(/api_requests_total\s+(\d+)/);
    if (errorsMatch && requestsMatch) {
      const errors = parseInt(errorsMatch[1], 10);
      const reqs = parseInt(requestsMatch[1], 10);
      const rate = reqs > 0 ? (errors / reqs) : 0;
      expect(rate).toBeLessThan(0.001);
    }
  });

  test('p95 latency should be under 500ms', async () => {
    const response = await apiClient.get('/metrics');
    const bucketMatches = data.match(/api_request_duration_seconds_bucket\{le="0\.5"\}\s+(\d+)/);
    if (bucketMatches) {
      const countUnder500 = parseInt(bucketMatches[1], 10);
      const totalMatches = data.match(/api_request_duration_seconds_count\s+(\d+)/);
      if (totalMatches) {
        const total = parseInt(totalMatches[1], 10);
        const ratio = total > 0 ? countUnder500 / total : 1;
        expect(ratio).toBeGreaterThan(0.95);
      }
    }
  });
});
