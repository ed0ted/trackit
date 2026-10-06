import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import UsersTab from './UsersTab';
import ProjectsTab from './ProjectsTab';
import IssuesTab from './IssuesTab';
import CommentsTab from './CommentsTab';
import './Admin.css';

const TABS = ['Users', 'Projects', 'Issues', 'Comments'];

function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Users');
  const [stats, setStats] = useState(null);

  const loadStats = () => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch((err) => console.log(err));
  };

  useEffect(() => {
    if (user.role === 'ADMIN') loadStats();
  }, [user.role]);

  if (user.role !== 'ADMIN') {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>Admin panel</h1>
      </div>

      {stats && (
        <div className="admin-stats">
          <div><b>{stats.users}</b> users</div>
          <div><b>{stats.projects}</b> projects</div>
          <div><b>{stats.issues}</b> issues</div>
          <div><b>{stats.comments}</b> comments</div>
        </div>
      )}

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* onChange reloads the numbers on top after something is created/deleted */}
      {tab === 'Users' && <UsersTab onChange={loadStats} />}
      {tab === 'Projects' && <ProjectsTab onChange={loadStats} />}
      {tab === 'Issues' && <IssuesTab onChange={loadStats} />}
      {tab === 'Comments' && <CommentsTab onChange={loadStats} />}
    </div>
  );
}

export default AdminPage;
