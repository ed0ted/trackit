import { useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { getErrorMessage } from '../utils/helpers';

// wraps all the /projects/:projectId/* pages, loads the project and shows the sidebar
function ProjectLayout() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');

  const loadProject = () => {
    api.get(`/projects/${projectId}`)
      .then((res) => setProject(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    setProject(null);
    setError('');
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (error) {
    return (
      <div className="page">
        <div className="alert-error">{error}</div>
        <Link to="/projects">Back to projects</Link>
      </div>
    );
  }

  if (!project) return <div className="page">Loading...</div>;

  return (
    <div className="project-layout">
      <Sidebar project={project} />
      <div className="project-content">
        <Outlet context={{ project, setProject, reloadProject: loadProject }} />
      </div>
    </div>
  );
}

export default ProjectLayout;
