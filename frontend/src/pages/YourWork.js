import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import IssueTypeIcon from '../components/IssueTypeIcon';
import PriorityIcon from '../components/PriorityIcon';
import StatusBadge from '../components/StatusBadge';
import IssueModal from '../components/IssueModal';
import { timeAgo } from '../utils/helpers';

function YourWork() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadIssues = () => {
    api.get('/users/me/issues')
      .then((res) => setIssues(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const visible = issues
    .filter((i) => showDone || i.status !== 'DONE')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1>Your work</h1>
      </div>
      <p className="text-subtle" style={{ marginTop: -8 }}>Hi {user.fullName}, here are the issues assigned to you.</p>

      <div className="tabs">
        <button className={'tab' + (!showDone ? ' active' : '')} onClick={() => setShowDone(false)}>Open</button>
        <button className={'tab' + (showDone ? ' active' : '')} onClick={() => setShowDone(true)}>All</button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && visible.length === 0 && (
        <div className="empty-state">
          <h3>Nothing here</h3>
          <p>You don't have any open issues assigned to you.</p>
        </div>
      )}

      <div className="work-list">
        {visible.map((issue) => (
          <div key={issue.id} className="work-item" onClick={() => setSelectedId(issue.id)}>
            <IssueTypeIcon type={issue.type} />
            <div className="work-item-main">
              <div className="work-item-title">{issue.title}</div>
              <div className="work-item-sub">{issue.key} · updated {timeAgo(issue.updatedAt)}</div>
            </div>
            <PriorityIcon priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
        ))}
      </div>

      {selectedId && (
        <IssueModal
          issueId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={loadIssues}
          onDeleted={loadIssues}
        />
      )}
    </div>
  );
}

export default YourWork;
