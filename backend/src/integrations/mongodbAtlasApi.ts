import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';

class MongoDBAtlasAPI {
  private client: AxiosInstance;
  private publicKey: string;
  private privateKey: string;
  private projectId: string;

  constructor() {
    this.publicKey = config.mongodbAtlasApiPublicKey;
    this.privateKey = config.mongodbAtlasApiPrivateKey;
    this.projectId = config.mongodbAtlasProjectId;

    this.client = axios.create({
      baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generateAuthHeader(method: string, path: string, body: string = ''): string {
    const timestamp = Date.now();
    const stringToSign = `${method}\n${path}\n${timestamp}\n${body}`;
    const signature = crypto
      .createHmac('sha256', this.privateKey)
      .update(stringToSign)
      .digest('base64');

    return `Digest username="${this.publicKey}", realm="MMS Public API", nonce="${timestamp}", uri="${path}", response="${signature}", opaque=""`;
  }

  async getClusterHealth(clusterName: string, projectId?: string): Promise<any> {
    try {
      // Use provided projectId or fall back to instance projectId (from env var)
      const targetProjectId = projectId || this.projectId;
      if (!targetProjectId) {
        throw new Error('MongoDB Atlas project ID is required');
      }
      
      const path = `/groups/${targetProjectId}/clusters/${clusterName}/status`;
      const method = 'GET';
      const authHeader = this.generateAuthHeader(method, path);

      const response = await this.client.get(path, {
        headers: {
          Authorization: authHeader,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching MongoDB Atlas cluster health for ${clusterName} in project ${projectId || this.projectId}:`, error.message);
      throw error;
    }
  }

  async getAllClusters(projectId?: string): Promise<any[]> {
    try {
      // Use provided projectId or fall back to instance projectId (from env var)
      const targetProjectId = projectId || this.projectId;
      if (!targetProjectId) {
        throw new Error('MongoDB Atlas project ID is required');
      }
      
      const path = `/groups/${targetProjectId}/clusters`;
      const method = 'GET';
      const authHeader = this.generateAuthHeader(method, path);

      const response = await this.client.get(path, {
        headers: {
          Authorization: authHeader,
        },
      });

      return response.data.results || [];
    } catch (error: any) {
      console.error(`Error fetching all MongoDB Atlas clusters for project ${projectId || this.projectId}:`, error.message);
      throw error;
    }
  }
}

export default new MongoDBAtlasAPI();

