import * as fs from 'fs';
import * as path from 'path';

export interface Environment {
  UI_URL: string;
  API_BASE_URL: string;
  KAFKA_URL: string;
  GRAFANA_URL: string;
  PROMETHEUS_URL: string;
  API_TIMEOUT: number;
  RETRY_COUNT: number;
  RETRY_DELAY: number;
  PARALLEL_TEST_WORKERS: number;
}

export class ConfigLoader {
  static loadConfig(): Environment {
    const env = process.env.TEST_ENV || 'local';
    const configPath = path.join(__dirname, `../config/${env}.json`);
    
    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return { ...this.getDefaults(), ...fileConfig };
    }
    
    return this.getDefaults();
  }

  private static getDefaults(): Environment {
    return {
      UI_URL: process.env.UI_URL || 'http://localhost:3000',
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
      KAFKA_URL: process.env.KAFKA_URL || 'http://localhost:3003',
      GRAFANA_URL: process.env.GRAFANA_URL || 'http://localhost:3000',
      PROMETHEUS_URL: process.env.PROMETHEUS_URL || 'http://localhost:9090',
      API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
      RETRY_COUNT: parseInt(process.env.RETRY_COUNT || '3'),
      RETRY_DELAY: parseInt(process.env.RETRY_DELAY || '1000'),
      PARALLEL_TEST_WORKERS: parseInt(process.env.PARALLEL_TEST_WORKERS || '4')
    };
  }
}

export const config = ConfigLoader.loadConfig();
