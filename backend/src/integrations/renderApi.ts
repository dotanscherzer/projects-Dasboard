import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

class RenderAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.render.com/v1',
      headers: {
        Authorization: `Bearer ${config.renderApiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getServiceHealth(serviceId: string): Promise<any> {
    try {
      const response = await this.client.get(`/services/${serviceId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching Render service health for ${serviceId}:`, error.message);
      throw error;
    }
  }

  async getServiceDeploys(serviceId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/services/${serviceId}/deploys`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching Render service deploys for ${serviceId}:`, error.message);
      throw error;
    }
  }

  async getAllServices(): Promise<any[]> {
    try {
      const response = await this.client.get('/services');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all Render services:', error.message);
      throw error;
    }
  }
}

export default new RenderAPI();

