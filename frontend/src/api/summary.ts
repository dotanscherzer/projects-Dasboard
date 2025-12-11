import apiClient from './client';

export interface Summary {
  projects: {
    total: number;
    active: number;
    live: number;
    inDevelopment: number;
  };
  services: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  workItems: {
    total: number;
    byStatus: Record<string, number>;
  };
  highPriorityProjects: any[];
  failingServices: any[];
}

export const getSummary = async (): Promise<Summary> => {
  const response = await apiClient.get('/api/summary');
  return response.data;
};

