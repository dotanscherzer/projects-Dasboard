import { useState } from 'react';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: {
    status?: string;
    lifecycleStage?: string;
    priority?: string;
    tag?: string;
  }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState<string>('');
  const [lifecycleStage, setLifecycleStage] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [tag, setTag] = useState<string>('');

  const handleFilterChange = () => {
    const filters: any = {};
    if (status) filters.status = status;
    if (lifecycleStage) filters.lifecycleStage = lifecycleStage;
    if (priority) filters.priority = priority;
    if (tag) filters.tag = tag;
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setStatus('');
    setLifecycleStage('');
    setPriority('');
    setTag('');
    onFilterChange({});
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="status-filter">Status:</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            handleFilterChange();
          }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="lifecycle-filter">Lifecycle:</label>
        <select
          id="lifecycle-filter"
          value={lifecycleStage}
          onChange={(e) => {
            setLifecycleStage(e.target.value);
            handleFilterChange();
          }}
        >
          <option value="">All</option>
          <option value="idea">Idea</option>
          <option value="planned">Planned</option>
          <option value="in_development">In Development</option>
          <option value="ready_for_deploy">Ready for Deploy</option>
          <option value="live">Live</option>
          <option value="maintenance">Maintenance</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priority-filter">Priority:</label>
        <select
          id="priority-filter"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            handleFilterChange();
          }}
        >
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="tag-filter">Tag:</label>
        <input
          id="tag-filter"
          type="text"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            handleFilterChange();
          }}
          placeholder="Filter by tag"
        />
      </div>

      <button className="clear-filters-btn" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;

