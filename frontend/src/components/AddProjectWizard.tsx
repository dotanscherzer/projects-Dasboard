import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, Project, Service } from '../api/projects';
import { createService } from '../api/services';
import ServiceForm from './ServiceForm';
import './AddProjectWizard.css';

interface AddProjectWizardProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const AddProjectWizard: React.FC<AddProjectWizardProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project data
  const [projectData, setProjectData] = useState<Partial<Project>>({
    name: '',
    code: '',
    description: '',
    owner: '',
    status: 'active',
    lifecycleStage: 'idea',
    priority: 'medium',
    nextAction: '',
    targetReleaseDate: '',
    tags: [],
  });

  // Services data
  const [backendServices, setBackendServices] = useState<Partial<Service>[]>([]);
  const [frontendServices, setFrontendServices] = useState<Partial<Service>[]>([]);
  const [dbServices, setDbServices] = useState<Partial<Service>[]>([]);
  const [automationServices, setAutomationServices] = useState<Partial<Service>[]>([]);
  
  // Track which service forms are shown
  const [showServiceForms, setShowServiceForms] = useState({
    backend: false,
    frontend: false,
    db: false,
    automation: false,
  });


  const generateCode = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase().padEnd(3, 'X');
    }
    return words
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 10)
      .padEnd(3, 'X');
  };

  const handleProjectChange = (field: keyof Project, value: any) => {
    setProjectData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.code = generateCode(value);
      }
      return updated;
    });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !projectData.tags?.includes(tag)) {
      setProjectData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProjectData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const validateStep1 = (): boolean => {
    if (!projectData.name || !projectData.owner) {
      setError('Name and Owner are required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      setError(null);
      // Reset service form visibility when moving to next step
      setShowServiceForms({ backend: false, frontend: false, db: false, automation: false });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      setError(null);
    }
  };

  const handleAddService = (
    serviceType: 'backend' | 'frontend' | 'db' | 'automation',
    service: Partial<Service>
  ) => {
    switch (serviceType) {
      case 'backend':
        setBackendServices((prev) => [...prev, service]);
        break;
      case 'frontend':
        setFrontendServices((prev) => [...prev, service]);
        break;
      case 'db':
        setDbServices((prev) => [...prev, service]);
        break;
      case 'automation':
        setAutomationServices((prev) => [...prev, service]);
        break;
    }
  };

  const handleRemoveService = (
    serviceType: 'backend' | 'frontend' | 'db' | 'automation',
    index: number
  ) => {
    switch (serviceType) {
      case 'backend':
        setBackendServices((prev) => prev.filter((_, i) => i !== index));
        break;
      case 'frontend':
        setFrontendServices((prev) => prev.filter((_, i) => i !== index));
        break;
      case 'db':
        setDbServices((prev) => prev.filter((_, i) => i !== index));
        break;
      case 'automation':
        setAutomationServices((prev) => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create project
      const newProject = await createProject({
        ...projectData,
        code: projectData.code || generateCode(projectData.name || ''),
        targetReleaseDate: projectData.targetReleaseDate || undefined,
      });

      // Create all services
      const allServices = [
        ...backendServices.map((s) => ({ ...s, projectId: newProject._id, type: 'backend' as const })),
        ...frontendServices.map((s) => ({ ...s, projectId: newProject._id, type: 'frontend' as const })),
        ...dbServices.map((s) => ({ ...s, projectId: newProject._id, type: 'db' as const })),
        ...automationServices.map((s) => ({ ...s, projectId: newProject._id, type: 'automation' as const })),
      ];

      for (const service of allServices) {
        await createService(service);
      }

      if (onSuccess) {
        onSuccess();
      }
      navigate(`/projects/${newProject._id}`);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>Project Information</h2>
      <div className="form-group">
        <label htmlFor="name">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={projectData.name || ''}
          onChange={(e) => handleProjectChange('name', e.target.value)}
          required
          placeholder="Enter project name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="code">Code</label>
        <input
          type="text"
          id="code"
          value={projectData.code || ''}
          readOnly
          className="readonly"
          placeholder="Auto-generated"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={projectData.description || ''}
          onChange={(e) => handleProjectChange('description', e.target.value)}
          rows={3}
          placeholder="Enter project description"
        />
      </div>

      <div className="form-group">
        <label htmlFor="owner">
          Owner <span className="required">*</span>
        </label>
        <input
          type="text"
          id="owner"
          value={projectData.owner || ''}
          onChange={(e) => handleProjectChange('owner', e.target.value)}
          required
          placeholder="Enter owner name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={projectData.status || 'active'}
            onChange={(e) => handleProjectChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="lifecycleStage">Lifecycle Stage</label>
          <select
            id="lifecycleStage"
            value={projectData.lifecycleStage || 'idea'}
            onChange={(e) => handleProjectChange('lifecycleStage', e.target.value)}
          >
            <option value="idea">Idea</option>
            <option value="planned">Planned</option>
            <option value="in_development">In Development</option>
            <option value="ready_for_deploy">Ready for Deploy</option>
            <option value="live">Live</option>
            <option value="maintenance">Maintenance</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={projectData.priority || 'medium'}
            onChange={(e) => handleProjectChange('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="nextAction">Next Action</label>
        <input
          type="text"
          id="nextAction"
          value={projectData.nextAction || ''}
          onChange={(e) => handleProjectChange('nextAction', e.target.value)}
          placeholder="Enter next action (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="targetReleaseDate">Target Release Date</label>
        <input
          type="date"
          id="targetReleaseDate"
          value={projectData.targetReleaseDate || ''}
          onChange={(e) => handleProjectChange('targetReleaseDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="tags-input">
          <input
            type="text"
            id="tags"
            placeholder="Add a tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  handleAddTag(input.value.trim());
                  input.value = '';
                }
              }
            }}
          />
          <div className="tags-list">
            {projectData.tags?.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceStep = (
    title: string,
    serviceType: 'backend' | 'frontend' | 'db' | 'automation',
    services: Partial<Service>[],
    onAdd: (service: Partial<Service>) => void,
    onRemove: (index: number) => void
  ) => {
    const showForm = showServiceForms[serviceType];

    return (
      <div className="wizard-step">
        <h2>{title}</h2>
        <p className="step-description">Add services for this project. You can skip this step or add multiple services.</p>

        {services.length > 0 && (
          <div className="services-list">
            {services.map((service, index) => (
              <div key={index} className="service-item">
                <div className="service-item-header">
                  <h3>{service.name || `Service ${index + 1}`}</h3>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
                <div className="service-item-details">
                  <p>
                    <strong>Provider:</strong> {service.provider}
                  </p>
                  <p>
                    <strong>Provider ID:</strong> {service.providerInternalId}
                  </p>
                  {service.url && (
                    <p>
                      <strong>URL:</strong> {service.url}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!showForm ? (
          <div className="add-service-section">
            <button
              type="button"
              onClick={() => setShowServiceForms((prev) => ({ ...prev, [serviceType]: true }))}
              className="btn-primary"
            >
              + Add {title.replace(' Services', '')} Service
            </button>
          </div>
        ) : (
          <div className="add-service-section">
            <ServiceForm
              serviceType={serviceType}
              onSave={(service) => {
                onAdd(service);
                setShowServiceForms((prev) => ({ ...prev, [serviceType]: false }));
              }}
              onCancel={() => setShowServiceForms((prev) => ({ ...prev, [serviceType]: false }))}
            />
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="wizard-step">
      <h2>Review & Submit</h2>
      <div className="review-section">
        <h3>Project Information</h3>
        <div className="review-item">
          <strong>Name:</strong> {projectData.name}
        </div>
        <div className="review-item">
          <strong>Code:</strong> {projectData.code}
        </div>
        <div className="review-item">
          <strong>Owner:</strong> {projectData.owner}
        </div>
        <div className="review-item">
          <strong>Status:</strong> {projectData.status}
        </div>
        <div className="review-item">
          <strong>Lifecycle Stage:</strong> {projectData.lifecycleStage}
        </div>
        <div className="review-item">
          <strong>Priority:</strong> {projectData.priority}
        </div>
        {projectData.nextAction && (
          <div className="review-item">
            <strong>Next Action:</strong> {projectData.nextAction}
          </div>
        )}
        {projectData.description && (
          <div className="review-item">
            <strong>Description:</strong> {projectData.description}
          </div>
        )}
      </div>

      {backendServices.length > 0 && (
        <div className="review-section">
          <h3>Backend Services ({backendServices.length})</h3>
          {backendServices.map((service, index) => (
            <div key={index} className="review-item">
              {service.name} - {service.provider}
            </div>
          ))}
        </div>
      )}

      {frontendServices.length > 0 && (
        <div className="review-section">
          <h3>Frontend Services ({frontendServices.length})</h3>
          {frontendServices.map((service, index) => (
            <div key={index} className="review-item">
              {service.name} - {service.provider}
            </div>
          ))}
        </div>
      )}

      {dbServices.length > 0 && (
        <div className="review-section">
          <h3>Database Services ({dbServices.length})</h3>
          {dbServices.map((service, index) => (
            <div key={index} className="review-item">
              {service.name} - {service.provider}
            </div>
          ))}
        </div>
      )}

      {automationServices.length > 0 && (
        <div className="review-section">
          <h3>Automation Services ({automationServices.length})</h3>
          {automationServices.map((service, index) => (
            <div key={index} className="review-item">
              {service.name} - {service.provider}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const stepTitles = [
    'Project Information',
    'Backend Services',
    'Frontend Services',
    'Database Services',
    'Automation Services',
    'Review & Submit',
  ];

  return (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-header">
          <h1>Add New Project</h1>
          <button className="wizard-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="wizard-progress">
          {stepTitles.map((title, index) => (
            <div
              key={index + 1}
              className={`progress-step ${currentStep >= index + 1 ? 'active' : ''} ${currentStep === index + 1 ? 'current' : ''}`}
            >
              <div className="progress-number">{index + 1}</div>
              <div className="progress-title">{title}</div>
            </div>
          ))}
        </div>

        <div className="wizard-content">
          {error && <div className="error-message">{error}</div>}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 &&
            renderServiceStep(
              'Backend Services',
              'backend',
              backendServices,
              (service) => handleAddService('backend', service),
              (index) => handleRemoveService('backend', index)
            )}
          {currentStep === 3 &&
            renderServiceStep(
              'Frontend Services',
              'frontend',
              frontendServices,
              (service) => handleAddService('frontend', service),
              (index) => handleRemoveService('frontend', index)
            )}
          {currentStep === 4 &&
            renderServiceStep(
              'Database Services',
              'db',
              dbServices,
              (service) => handleAddService('db', service),
              (index) => handleRemoveService('db', index)
            )}
          {currentStep === 5 &&
            renderServiceStep(
              'Automation Services',
              'automation',
              automationServices,
              (service) => handleAddService('automation', service),
              (index) => handleRemoveService('automation', index)
            )}
          {currentStep === 6 && renderReviewStep()}
        </div>

        <div className="wizard-footer">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          {currentStep < 6 ? (
            <button type="button" onClick={handleNext} className="btn-primary">
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProjectWizard;

