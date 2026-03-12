import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as joi from 'joi';
import { Logger } from '../utils/logger';
import { config } from '../config/config';

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: any;
}

export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || config.API_BASE_URL,
      timeout: config.API_TIMEOUT,
      validateStatus: () => true
    });
  }

  async login(email: string, password: string): Promise<string> {
    Logger.info(`Attempting login with email: ${email}`);
    
    const response = await this.post('/api/login', { email, password });
    
    if (response.status === 200 && response.data.token) {
      this.token = response.data.token;
      Logger.info('Login successful');
      return response.data.token;
    }
    
    throw new Error(`Login failed: ${response.data.message}`);
  }

  setToken(token: string): void {
    this.token = token;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    requestConfig?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const headers: any = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      Logger.debug(`${method} ${url}`, { data });

      const response: AxiosResponse = await this.client.request({
        method,
        url,
        data,
        headers,
        ...requestConfig
      });

      Logger.debug(`Response received`, { status: response.status, data: response.data });

      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error: any) {
      Logger.error(`API request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  validateResponse<T>(response: ApiResponse<T>, schema: joi.Schema): T {
    const { error, value } = schema.validate(response.data);
    if (error) {
      throw new Error(`Response validation failed: ${error.message}`);
    }
    return value;
  }
}
