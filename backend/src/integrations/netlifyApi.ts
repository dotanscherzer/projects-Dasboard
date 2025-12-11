import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';

class NetlifyAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.netlify.com/api/v1',
      headers: {
        Authorization: `Bearer ${config.netlifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getSiteStatus(siteId: string): Promise<any> {
    try {
      const response = await this.client.get(`/sites/${siteId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching Netlify site status for ${siteId}:`, error.message);
      throw error;
    }
  }

  async getSiteDeploys(siteId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/sites/${siteId}/deploys`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching Netlify site deploys for ${siteId}:`, error.message);
      throw error;
    }
  }

  async getAllSites(): Promise<any[]> {
    try {
      const response = await this.client.get('/sites');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all Netlify sites:', error.message);
      throw error;
    }
  }
}

export default new NetlifyAPI();

