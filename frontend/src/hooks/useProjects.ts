import { useState, useEffect } from 'react';
import { getProjects, Project } from '../api/projects';

interface UseProjectsFilters {
  status?: string;
  lifecycleStage?: string;
  priority?: string;
  tag?: string;
}

export const useProjects = (filters?: UseProjectsFilters) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects(filters);
        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters?.status, filters?.lifecycleStage, filters?.priority, filters?.tag]);

  return { projects, loading, error, refetch: () => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects(filters);
        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  } };
};

