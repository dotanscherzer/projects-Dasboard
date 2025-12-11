import apiClient from './client';

export interface Metric {
  _id: string;
  serviceId: string;
  metricName: string;
  metricValue: string | number | object;
  collectedAt: string;
}

export const getMetricsByService = async (serviceId: string, metricName?: string): Promise<Metric[]> => {
  const params = new URLSearchParams();
  params.append('serviceId', serviceId);
  if (metricName) params.append('metricName', metricName);

  const response = await apiClient.get(`/api/metrics?${params.toString()}`);
  return response.data;
};

