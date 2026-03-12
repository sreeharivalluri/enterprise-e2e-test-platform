import axios from 'axios';

export class KafkaClient {
  baseURL: string;

  constructor(baseURL: string = 'http://localhost:3003') {
    this.baseURL = baseURL;
  }

  async publish(topic: string, payload: any): Promise<void> {
    await axios.post(`${this.baseURL}/events/publish`, { topic, event: payload });
  }

  async getEvents(topic: string): Promise<any[]> {
    const res = await axios.get(`${this.baseURL}/topics/${topic}/events`);
    return res.data || [];
  }

  async clearEvents(): Promise<void> {
    await axios.delete(`${this.baseURL}/events/clear`);
  }
}
