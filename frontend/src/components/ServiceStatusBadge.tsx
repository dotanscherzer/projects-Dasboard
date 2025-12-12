import { Service } from '../api/projects';
import './ServiceStatusBadge.css';

interface ServiceStatusBadgeProps {
  service: Service;
}

const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({ service }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
      case 'ok':
        return '#10b981';
      case 'down':
      case 'failing':
        return '#ef4444';
      case 'degraded':
        return '#f59e0b';
      case 'stale':
        return '#ef4444';
      case 'unknown':
      default:
        return '#6b7280';
    }
  };

  const getRunStatusColor = (status?: string | null) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="service-status-badge">
      <div className="status-primary">
        <span
          className="status-dot"
          style={{ backgroundColor: getStatusColor(service.status) }}
        />
        <span className="status-text">{service.status}</span>
      </div>
      {service.type === 'automation' && service.lastRunStatus && (
        <div className="status-automation">
          <span className="automation-label">Last Run:</span>
          <span
            className="automation-status"
            style={{ color: getRunStatusColor(service.lastRunStatus) }}
          >
            {service.lastRunStatus}
          </span>
          {service.lastRunAt && (
            <span className="automation-time">
              {new Date(service.lastRunAt).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceStatusBadge;

