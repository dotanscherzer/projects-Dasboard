import { Service } from '../api/projects';
import ServiceStatusBadge from './ServiceStatusBadge';
import './AutomationStatusList.css';

interface AutomationStatusListProps {
  services: Service[];
}

const AutomationStatusList: React.FC<AutomationStatusListProps> = ({ services }) => {
  const automationServices = services.filter((s) => s.type === 'automation');

  if (automationServices.length === 0) {
    return <div className="automation-status-list-empty">No automation services found</div>;
  }

  return (
    <div className="automation-status-list">
      <h3>Automation Services</h3>
      <div className="automation-services-grid">
        {automationServices.map((service) => (
          <div key={service._id} className="automation-service-item">
            <div className="automation-service-header">
              <h4>{service.name}</h4>
              <span className="automation-provider">{service.provider}</span>
            </div>
            <ServiceStatusBadge service={service} />
            {service.expectedFrequencyMinutes && (
              <div className="automation-frequency">
                Expected frequency: {service.expectedFrequencyMinutes} minutes
              </div>
            )}
            {service.url && (
              <a href={service.url} target="_blank" rel="noopener noreferrer" className="automation-link">
                View Service
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationStatusList;

