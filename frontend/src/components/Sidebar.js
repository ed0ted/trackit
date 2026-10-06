import { NavLink } from 'react-router-dom';
import { BsKanban } from 'react-icons/bs';
import { FiList, FiSettings } from 'react-icons/fi';
import { getAvatarColor } from '../utils/helpers';

function Sidebar({ project }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-project">
        <div className="project-icon" style={{ backgroundColor: getAvatarColor(project.projectKey) }}>
          {project.projectKey.charAt(0)}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="sidebar-project-name" title={project.name}>{project.name}</div>
          <div className="sidebar-project-type">Kanban project</div>
        </div>
      </div>

      <div className="sidebar-section-title">Planning</div>
      <NavLink to={`/projects/${project.id}/board`} className="sidebar-link">
        <BsKanban /> Board
      </NavLink>
      <NavLink to={`/projects/${project.id}/issues`} className="sidebar-link">
        <FiList /> Issues
      </NavLink>

      <div className="sidebar-divider" />
      <NavLink to={`/projects/${project.id}/settings`} className="sidebar-link">
        <FiSettings /> Project settings
      </NavLink>
    </aside>
  );
}

export default Sidebar;
