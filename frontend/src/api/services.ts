import apiClient from './client';
import { Service } from './projects';

export const getServices = async (filters?: {
  projectId?: string;
  type?: string;
  provider?: string;
  status?: string;
}): Promise<Service[]> => {
  const params = new URLSearchParams();
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.provider) params.append('provider', filters.provider);
  if (filters?.status) params.append('status', filters.status);

  const response = await apiClient.get(`/api/services?${params.toString()}`);
  return response.data;
};

export const getService = async (id: string): Promise<Service> => {
  const response = await apiClient.get(`/api/services/${id}`);
  return response.data;
};

export const createService = async (data: Partial<Service>): Promise<Service> => {
  const response = await apiClient.post('/api/services', data);
  return response.data;
};

export const updateService = async (id: string, data: Partial<Service>): Promise<Service> => {
  const response = await apiClient.put(`/api/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/services/${id}`);
};

