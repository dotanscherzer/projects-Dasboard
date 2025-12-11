import { Link } from 'react-router-dom';
import { Project } from '../api/projects';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'deprecated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case 'live':
        return '#10b981';
      case 'in_development':
        return '#3b82f6';
      case 'ready_for_deploy':
        return '#8b5cf6';
      case 'maintenance':
        return '#f59e0b';
      case 'on_hold':
        return '#ef4444';
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

  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <span className="project-code">{project.code}</span>
      </div>
      {project.description && <p className="project-description">{project.description}</p>}
      <div className="project-meta">
        <div className="project-badges">
          <span
            className="badge status-badge"
            style={{ backgroundColor: getStatusColor(project.status) }}
          >
            {project.status}
          </span>
          <span
            className="badge lifecycle-badge"
            style={{ backgroundColor: getLifecycleColor(project.lifecycleStage) }}
          >
            {project.lifecycleStage.replace('_', ' ')}
          </span>
          <span
            className="badge priority-badge"
            style={{ backgroundColor: getPriorityColor(project.priority) }}
          >
            {project.priority}
          </span>
        </div>
        <div className="project-info">
          <span className="project-owner">Owner: {project.owner}</span>
        </div>
      </div>
      {project.nextAction && (
        <div className="project-next-action">
          <strong>Next:</strong> {project.nextAction}
        </div>
      )}
      {project.tags && project.tags.length > 0 && (
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

export default ProjectCard;

