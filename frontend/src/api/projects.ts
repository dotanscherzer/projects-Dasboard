import apiClient from './client';

export interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  owner: string;
  status: 'active' | 'paused' | 'deprecated';
  lifecycleStage: 'idea' | 'planned' | 'in_development' | 'ready_for_deploy' | 'live' | 'maintenance' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  nextAction?: string;
  targetReleaseDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails {
  project: Project;
  services: Service[];
  envVars: EnvVar[];
  workItems: WorkItem[];
}

export interface Service {
  _id: string;
  projectId: string;
  name: string;
  type: 'backend' | 'frontend' | 'db' | 'worker' | 'automation' | 'other';
  provider: 'render' | 'netlify' | 'mongodb_atlas' | 'make' | 'supabase' | 'other';
  providerInternalId: string;
  mongodbAtlasProjectId?: string;
  url?: string;
  dashboardUrl?: string;
  region?: string;
  status: 'unknown' | 'up' | 'down' | 'degraded' | 'ok' | 'failing' | 'stale';
  lastCheckedAt?: string;
  lastDeployAt?: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'error' | null;
  expectedFrequencyMinutes?: number;
  providerStatus?: any;
  notes?: string;
}

export interface EnvVar {
  _id: string;
  serviceId: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export interface WorkItem {
  _id: string;
  projectId: string;
  title: string;
  type: 'dev' | 'automation' | 'infra' | 'content' | 'other';
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  blockedBy?: string;
  tags: string[];
}

export const getProjects = async (filters?: {
  status?: string;
  lifecycleStage?: string;
  priority?: string;
  tag?: string;
}): Promise<Project[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.lifecycleStage) params.append('lifecycleStage', filters.lifecycleStage);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.tag) params.append('tag', filters.tag);

  const response = await apiClient.get(`/api/projects?${params.toString()}`);
  return response.data;
};

export const getProjectDetails = async (id: string): Promise<ProjectDetails> => {
  const response = await apiClient.get(`/api/projects/${id}`);
  return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
  const response = await apiClient.post('/api/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  const response = await apiClient.put(`/api/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/projects/${id}`);
};

