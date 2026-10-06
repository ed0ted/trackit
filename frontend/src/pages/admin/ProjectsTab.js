import { useEffect, useState } from 'react';
import api from '../../api/api';
import { getErrorMessage } from '../../utils/helpers';

const emptyProject = { name: '', projectKey: '', description: '', ownerId: '' };

function ProjectsTab({ onChange }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadProjects = () => {
    api.get('/admin/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    loadProjects();
    api.get('/admin/users').then((res) => setUsers(res.data));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/projects', {
        ...newProject,
        ownerId: newProject.ownerId ? Number(newProject.ownerId) : null,
      });
      setNewProject(emptyProject);
      setShowAdd(false);
      loadProjects();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, description: p.description || '', ownerId: p.owner.id });
    setError('');
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/projects/${id}`, { ...editForm, ownerId: Number(editForm.ownerId) });
      setEditingId(null);
      loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete project ${p.projectKey} and all its ${p.issueCount} issues?`)) return;
    try {
      await api.delete(`/admin/projects/${p.id}`);
      loadProjects();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ marginBottom: 12 }}>
        {showAdd ? 'Cancel' : 'Add project'}
      </button>

      {showAdd && (
        <form className="admin-form" onSubmit={createProject}>
          <input type="text" placeholder="Name" value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
          <input type="text" placeholder="Key (e.g. ABC)" value={newProject.projectKey} maxLength={10}
            onChange={(e) => setNewProject({ ...newProject, projectKey: e.target.value.toUpperCase() })} required />
          <input type="text" placeholder="Description" value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
          <select value={newProject.ownerId} onChange={(e) => setNewProject({ ...newProject, ownerId: e.target.value })}>
            <option value="">Owner: me</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <table className="table admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Key</th>
            <th>Name</th>
            <th>Description</th>
            <th>Owner</th>
            <th>Members</th>
            <th>Issues</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) =>
            editingId === p.id ? (
              <tr key={p.id} className="editing">
                <td>{p.id}</td>
                <td>{p.projectKey}</td>
                <td><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                <td><input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></td>
                <td>
                  <select value={editForm.ownerId} onChange={(e) => setEditForm({ ...editForm, ownerId: e.target.value })}>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </td>
                <td>{p.members.length}</td>
                <td>{p.issueCount}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="btn btn-link" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.projectKey}</td>
                <td>{p.name}</td>
                <td className="text-subtle cell-truncate" title={p.description}>{p.description}</td>
                <td>{p.owner.username}</td>
                <td title={p.members.map((m) => m.username).join(', ')}>{p.members.length}</td>
                <td>{p.issueCount}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-link danger" onClick={() => deleteProject(p)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectsTab;
