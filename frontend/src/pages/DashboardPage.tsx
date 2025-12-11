import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import FilterBar from '../components/FilterBar';
import { getSummary, Summary } from '../api/summary';
import { useEffect } from 'react';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<{
    status?: string;
    lifecycleStage?: string;
    priority?: string;
    tag?: string;
  }>({});
  const { projects, loading, error } = useProjects(filters);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Project Ops Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {summary && (
        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Projects</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{summary.projects.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.projects.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.projects.live}</span>
                <span className="stat-label">Live</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.projects.inDevelopment}</span>
                <span className="stat-label">In Development</span>
              </div>
            </div>
          </div>
          <div className="summary-card">
            <h3>Services</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{summary.services.total}</span>
                <span className="stat-label">Total</span>
              </div>
              {Object.entries(summary.services.byStatus).map(([status, count]) => (
                <div key={status} className="stat">
                  <span className="stat-value">{count}</span>
                  <span className="stat-label">{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-card">
            <h3>Work Items</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{summary.workItems.total}</span>
                <span className="stat-label">Total</span>
              </div>
              {Object.entries(summary.workItems.byStatus).map(([status, count]) => (
                <div key={status} className="stat">
                  <span className="stat-value">{count}</span>
                  <span className="stat-label">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <FilterBar onFilterChange={setFilters} />

        {loading && <div className="loading">Loading projects...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && !error && projects.length === 0 && (
          <div className="empty-state">No projects found</div>
        )}
        {!loading && !error && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

