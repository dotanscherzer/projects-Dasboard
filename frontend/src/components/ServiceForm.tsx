import { useState } from 'react';
import { Service } from '../api/projects';
import './ServiceForm.css';

interface ServiceFormProps {
  serviceType: 'backend' | 'frontend' | 'db' | 'automation';
  service?: Partial<Service>;
  onSave: (service: Partial<Service>) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceType, service, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    name: service?.name || '',
    provider: service?.provider || (serviceType === 'backend' ? 'render' : serviceType === 'frontend' ? 'netlify' : serviceType === 'db' ? 'mongodb_atlas' : 'make'),
    providerInternalId: service?.providerInternalId || '',
    mongodbAtlasProjectId: service?.mongodbAtlasProjectId || '',
    url: service?.url || '',
    dashboardUrl: service?.dashboardUrl || '',
    region: service?.region || '',
    notes: service?.notes || '',
    expectedFrequencyMinutes: service?.expectedFrequencyMinutes || undefined,
  });

  const getProviderOptions = () => {
    switch (serviceType) {
      case 'backend':
        return ['render', 'netlify', 'other'];
      case 'frontend':
        return ['netlify', 'render', 'other'];
      case 'db':
        return ['mongodb_atlas', 'supabase', 'other'];
      case 'automation':
        return ['make', 'other'];
      default:
        return ['other'];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.provider || !formData.providerInternalId) {
      return;
    }
    onSave({
      ...formData,
      type: serviceType,
    });
  };

  const handleChange = (field: keyof Service, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to get provider-specific field labels and placeholders
  const getProviderFieldInfo = () => {
    switch (formData.provider) {
      case 'render':
        return {
          label: 'Render Service ID',
          placeholder: 'e.g., srv-d4qcccjuibrs73dj64d0',
          helpText: 'Find this in your Render dashboard under the service settings'
        };
      case 'netlify':
        return {
          label: 'Netlify Site ID',
          placeholder: 'e.g., a8ee0591-35af-4cf6-9043-48ed21e1432e',
          helpText: 'Find this in your Netlify dashboard under Site settings → General'
        };
      case 'mongodb_atlas':
        return {
          label: 'Cluster Name',
          placeholder: 'e.g., Cluster0 or prodDB',
          helpText: 'The name of your MongoDB Atlas cluster (not the project ID). Find it in MongoDB Atlas → Your Project → Clusters'
        };
      default:
        return {
          label: 'Provider Internal ID',
          placeholder: 'e.g., service-id-123',
          helpText: ''
        };
    }
  };

  const providerFieldInfo = getProviderFieldInfo();

  return (
    <form className="service-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="provider">
          Provider <span className="required">*</span>
        </label>
        <select
          id="provider"
          value={formData.provider || ''}
          onChange={(e) => handleChange('provider', e.target.value as Service['provider'])}
          required
        >
          <option value="">Select provider</option>
          {getProviderOptions().map((provider) => (
            <option key={provider} value={provider}>
              {provider.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="providerInternalId">
          {providerFieldInfo.label} <span className="required">*</span>
        </label>
        <input
          type="text"
          id="providerInternalId"
          value={formData.providerInternalId || ''}
          onChange={(e) => handleChange('providerInternalId', e.target.value)}
          required
          placeholder={providerFieldInfo.placeholder}
        />
        {providerFieldInfo.helpText && (
          <small className="form-help">{providerFieldInfo.helpText}</small>
        )}
      </div>

      {formData.provider === 'mongodb_atlas' && (
        <div className="form-group mongodb-atlas-group">
          <div className="form-section-header">
            <h4>MongoDB Atlas Project</h4>
            <small className="form-section-subtitle">
              MongoDB Atlas organizes clusters within projects. Specify which project this cluster belongs to.
            </small>
          </div>
          <label htmlFor="mongodbAtlasProjectId">
            Project ID
          </label>
          <input
            type="text"
            id="mongodbAtlasProjectId"
            value={formData.mongodbAtlasProjectId || ''}
            onChange={(e) => handleChange('mongodbAtlasProjectId', e.target.value)}
            placeholder="e.g., 69355fb7e6c67808372d472a"
          />
          <small className="form-help">
            <strong>Optional:</strong> Only needed if this cluster is in a different MongoDB Atlas project than your default.
            <br />
            <strong>How to find it:</strong> MongoDB Atlas → Your Project → Settings → Project ID
            <br />
            If left empty, the system will use the <code>MONGODB_ATLAS_PROJECT_ID</code> environment variable.
          </small>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="url">URL</label>
        <input
          type="url"
          id="url"
          value={formData.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dashboardUrl">Dashboard URL</label>
        <input
          type="url"
          id="dashboardUrl"
          value={formData.dashboardUrl || ''}
          onChange={(e) => handleChange('dashboardUrl', e.target.value)}
          placeholder="https://dashboard.example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="region">Region</label>
        <input
          type="text"
          id="region"
          value={formData.region || ''}
          onChange={(e) => handleChange('region', e.target.value)}
          placeholder="e.g., us-east-1"
        />
      </div>

      {serviceType === 'automation' && (
        <div className="form-group">
          <label htmlFor="expectedFrequencyMinutes">Expected Frequency (minutes)</label>
          <input
            type="number"
            id="expectedFrequencyMinutes"
            value={formData.expectedFrequencyMinutes || ''}
            onChange={(e) => handleChange('expectedFrequencyMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
            min="1"
            placeholder="e.g., 60"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;

