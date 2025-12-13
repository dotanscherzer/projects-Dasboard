import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetails } from '../hooks/useProjectDetails';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import AutomationStatusList from '../components/AutomationStatusList';
import WorkItemList from '../components/WorkItemList';
import MetricsChart from '../components/MetricsChart';
import ServiceForm from '../components/ServiceForm';
import { getMetricsByService } from '../api/metrics';
import { updateService, deleteService } from '../api/services';
import { Service } from '../api/projects';
import { useState, useEffect } from 'react';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projectDetails, loading, error, refetch } = useProjectDetails(id || '');
  const [metrics, setMetrics] = useState<Record<string, any[]>>({});
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    if (!editingService) return;
    
    try {
      await updateService(editingService._id, serviceData);
      setEditingService(null);
      refetch(); // Refresh project details
    } catch (error: any) {
      console.error('Failed to update service:', error);
      alert(error.response?.data?.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    
    setIsDeleting(true);
    try {
      await deleteService(deletingService._id);
      setDeletingService(null);
      refetch(); // Refresh project details
    } catch (error: any) {
      console.error('Failed to delete service:', error);
      alert(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

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
          {!services || !Array.isArray(services) || services.length === 0 ? (
            <div className="empty-state">No services found</div>
          ) : (
            <div className="services-list">
              {services.map((service, index) => {
                if (!service || !service._id) {
                  console.warn('Invalid service:', service);
                  return null;
                }
                return (
                  <div key={service._id || `service-${index}`} className="service-card">
                    <div className="service-header">
                      <h3>{service.name || 'Unnamed Service'}</h3>
                      <span className="service-type">{service.type}</span>
                      <span className="service-provider">{service.provider}</span>
                      <div className="service-actions">
                        <button
                          onClick={() => handleEditService(service)}
                          className="btn-edit"
                          title="Edit service"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingService(service)}
                          className="btn-delete"
                          title="Delete service"
                        >
                          🗑️
                        </button>
                      </div>
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

      {/* Edit Service Modal */}
      {editingService && (
        <div className="modal-overlay" onClick={() => setEditingService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Service</h2>
              <button className="modal-close" onClick={() => setEditingService(null)}>×</button>
            </div>
            <ServiceForm
              serviceType={editingService.type as 'backend' | 'frontend' | 'db' | 'automation'}
              service={editingService}
              onSave={handleSaveService}
              onCancel={() => setEditingService(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <div className="modal-overlay" onClick={() => setDeletingService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Service</h2>
              <button className="modal-close" onClick={() => setDeletingService(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the service <strong>{deletingService.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeletingService(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteService}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;

