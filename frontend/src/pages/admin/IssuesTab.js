import { useEffect, useState } from 'react';
import api from '../../api/api';
import { COLUMNS, PRIORITIES, ISSUE_TYPES, capitalize, getErrorMessage } from '../../utils/helpers';

const emptyIssue = { projectId: '', title: '', type: 'TASK', priority: 'MEDIUM', status: 'TODO' };

function IssuesTab({ onChange }) {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newIssue, setNewIssue] = useState(emptyIssue);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadIssues = () => {
    api.get('/admin/issues')
      .then((res) => setIssues(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    loadIssues();
    api.get('/admin/projects').then((res) => setProjects(res.data));
  }, []);

  const getProject = (id) => projects.find((p) => p.id === id);

  const createIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.projectId) {
      setError('Choose a project');
      return;
    }
    setError('');
    try {
      const { projectId, ...body } = newIssue;
      await api.post(`/admin/projects/${projectId}/issues`, body);
      setNewIssue({ ...emptyIssue, projectId: newIssue.projectId });
      setShowAdd(false);
      loadIssues();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (issue) => {
    setEditingId(issue.id);
    setEditForm({
      title: issue.title,
      type: issue.type,
      status: issue.status,
      priority: issue.priority,
      storyPoints: issue.storyPoints,
      assigneeId: issue.assignee ? issue.assignee.id : '',
    });
    setError('');
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/issues/${id}`, {
        ...editForm,
        assigneeId: editForm.assigneeId ? Number(editForm.assigneeId) : null,
      });
      setEditingId(null);
      loadIssues();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteIssue = async (issue) => {
    if (!window.confirm(`Delete ${issue.key}?`)) return;
    try {
      await api.delete(`/admin/issues/${issue.id}`);
      loadIssues();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const visible = issues.filter((i) => {
    if (projectFilter && i.projectId !== Number(projectFilter)) return false;
    if (search && !(i.title + ' ' + i.key).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add issue'}
        </button>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.projectKey} - {p.name}</option>)}
        </select>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="text-muted">{visible.length} issues</span>
      </div>

      {showAdd && (
        <form className="admin-form" onSubmit={createIssue}>
          <select value={newIssue.projectId} onChange={(e) => setNewIssue({ ...newIssue, projectId: e.target.value })}>
            <option value="">Project...</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.projectKey}</option>)}
          </select>
          <input type="text" placeholder="Summary" value={newIssue.title} style={{ minWidth: 260 }}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} required />
          <select value={newIssue.type} onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
          </select>
          <select value={newIssue.status} onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <select value={newIssue.priority} onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <table className="table admin-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Summary</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Points</th>
            <th>Assignee</th>
            <th>Reporter</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map((issue) =>
            editingId === issue.id ? (
              <tr key={issue.id} className="editing">
                <td>{issue.key}</td>
                <td><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></td>
                <td>
                  <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                    {ISSUE_TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
                  </select>
                </td>
                <td>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </td>
                <td>
                  <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" min="0" style={{ width: 60 }} value={editForm.storyPoints ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, storyPoints: e.target.value === '' ? null : Number(e.target.value) })} />
                </td>
                <td>
                  <select value={editForm.assigneeId} onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {(getProject(issue.projectId)?.members || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </td>
                <td>{issue.reporter ? issue.reporter.username : '-'}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => saveEdit(issue.id)}>Save</button>
                  <button className="btn btn-link" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={issue.id}>
                <td>{issue.key}</td>
                <td className="cell-truncate" title={issue.title}>{issue.title}</td>
                <td>{capitalize(issue.type)}</td>
                <td>{issue.status}</td>
                <td>{capitalize(issue.priority)}</td>
                <td>{issue.storyPoints ?? '-'}</td>
                <td>{issue.assignee ? issue.assignee.username : <span className="text-muted">-</span>}</td>
                <td>{issue.reporter ? issue.reporter.username : <span className="text-muted">-</span>}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => startEdit(issue)}>Edit</button>
                  <button className="btn btn-link danger" onClick={() => deleteIssue(issue)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IssuesTab;
