import { useState, useEffect } from 'react';
import { getProjectDetails, ProjectDetails } from '../api/projects';

export const useProjectDetails = (projectId: string) => {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await getProjectDetails(projectId);
        console.log('Fetched project details:', data);
        console.log('Services in response:', data?.services, 'Count:', data?.services?.length);
        setProjectDetails(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  return { projectDetails, loading, error, refetch: async () => {
    try {
      setLoading(true);
      const data = await getProjectDetails(projectId);
      setProjectDetails(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  } };
};

