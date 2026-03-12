import axios from 'axios';

describe('@featureflag Feature Flag Service', () => {
  const url = 'http://localhost:3004';

  test('default flags available', async () => {
    const res = await axios.get(`${url}/flags`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('newDashboard');
    expect(typeof res.data.newDashboard).toBe('boolean');
  });

  test('can toggle a flag', async () => {
    const res1 = await axios.post(`${url}/flags/newDashboard`, { enabled: true });
    expect(res1.status).toBe(200);
    expect(res1.data.enabled).toBe(true);

    const res2 = await axios.get(`${url}/flags`);
    expect(res2.data.newDashboard).toBe(true);
  });
});