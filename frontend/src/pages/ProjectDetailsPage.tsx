import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetails } from '../hooks/useProjectDetails';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import AutomationStatusList from '../components/AutomationStatusList';
import WorkItemList from '../components/WorkItemList';
import MetricsChart from '../components/MetricsChart';
import { getMetricsByService } from '../api/metrics';
import { useState, useEffect } from 'react';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projectDetails, loading, error } = useProjectDetails(id || '');
  const [metrics, setMetrics] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!projectDetails?.services) return;

      const metricsData: Record<string, any[]> = {};
      for (const service of projectDetails.services) {
        try {
          const serviceMetrics = await getMetricsByService(service._id);
          metricsData[service._id] = serviceMetrics;
        } catch (err) {
          console.error(`Failed to fetch metrics for service ${service._id}:`, err);
        }
      }
      setMetrics(metricsData);
    };

    fetchMetrics();
  }, [projectDetails]);

  if (loading) {
    return <div className="project-details-loading">Loading project details...</div>;
  }

  if (error || !projectDetails) {
    return (
      <div className="project-details-error">
        <p>Error: {error || 'Project not found'}</p>
        <button onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const { project, services = [], workItems = [] } = projectDetails;

  // Debug logging
  console.log('ProjectDetails:', { project, servicesCount: services?.length, services });

  return (
    <div className="project-details-page">
      <header className="project-details-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>{project.name}</h1>
        <div className="project-header-info">
          <span className="project-code">{project.code}</span>
          <span className="project-owner">Owner: {project.owner}</span>
        </div>
      </header>

      <div className="project-details-content">
        <div className="project-info-section">
          <h2>Project Information</h2>
          <div className="project-info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span>{project.status}</span>
            </div>
            <div className="info-item">
              <label>Lifecycle Stage:</label>
              <span>{project.lifecycleStage.replace('_', ' ')}</span>
            </div>
            <div className="info-item">
              <label>Priority:</label>
              <span>{project.priority}</span>
            </div>
            {project.targetReleaseDate && (
              <div className="info-item">
                <label>Target Release Date:</label>
                <span>{new Date(project.targetReleaseDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="info-item full-width">
              <label>Next Action:</label>
              <span>{project.nextAction || '—'}</span>
            </div>
            {project.description && (
              <div className="info-item full-width">
                <label>Description:</label>
                <span>{project.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="services-section">
          <h2>Services {services && services.length > 0 && `(${services.length})`}</h2>
          {!services || services.length === 0 ? (
            <div className="empty-state">No services found</div>
          ) : (
            <div className="services-list">
              {services.map((service) => {
                if (!service || !service._id) {
                  console.warn('Invalid service:', service);
                  return null;
                }
                return (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h3>{service.name || 'Unnamed Service'}</h3>
                      <span className="service-type">{service.type}</span>
                      <span className="service-provider">{service.provider}</span>
                    </div>
                    <ServiceStatusBadge service={service} />
                    {service.url && (
                      <a href={service.url} target="_blank" rel="noopener noreferrer" className="service-link">
                        Visit Service
                      </a>
                    )}
                    {service.dashboardUrl && (
                      <a href={service.dashboardUrl} target="_blank" rel="noopener noreferrer" className="service-link" style={{ marginLeft: '0.5rem' }}>
                        Dashboard
                      </a>
                    )}
                    {metrics[service._id] && metrics[service._id].length > 0 && (
                      <div className="service-metrics">
                        {['health', 'response_time_ms', 'automation_status'].map((metricName) => {
                          const metricData = metrics[service._id].filter((m) => m.metricName === metricName);
                          if (metricData.length === 0) return null;
                          return (
                            <MetricsChart key={metricName} data={metricData} metricName={metricName} />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AutomationStatusList services={services} />

        <WorkItemList workItems={workItems} />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

