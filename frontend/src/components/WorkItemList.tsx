import { WorkItem } from '../api/projects';
import './WorkItemList.css';

interface WorkItemListProps {
  workItems: WorkItem[];
}

const WorkItemList: React.FC<WorkItemListProps> = ({ workItems }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'blocked':
        return '#ef4444';
      case 'todo':
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (workItems.length === 0) {
    return <div className="work-item-list-empty">No work items found</div>;
  }

  return (
    <div className="work-item-list">
      <h3>Work Items</h3>
      <div className="work-items-grid">
        {workItems.map((item) => (
          <div key={item._id} className="work-item-card">
            <div className="work-item-header">
              <h4>{item.title}</h4>
              <div className="work-item-badges">
                <span
                  className="badge status-badge"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {item.status.replace('_', ' ')}
                </span>
                <span
                  className="badge priority-badge"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                >
                  {item.priority}
                </span>
              </div>
            </div>
            <div className="work-item-meta">
              <span className="work-item-type">Type: {item.type}</span>
              {item.dueDate && (
                <span className="work-item-due">
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="work-item-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkItemList;

