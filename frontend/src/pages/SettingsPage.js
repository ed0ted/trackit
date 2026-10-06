import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { getErrorMessage } from '../utils/helpers';

function SettingsPage() {
  const { project, setProject } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [newMember, setNewMember] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [memberError, setMemberError] = useState('');

  const isOwner = project.owner.id === user.id;

  useEffect(() => {
    // for the autocomplete in add member
    api.get('/users').then((res) => setAllUsers(res.data)).catch(() => {});
  }, []);

  const saveDetails = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/projects/${project.id}`, {
        name,
        description,
        projectKey: project.projectKey,
      });
      setProject(res.data);
      setMessage('Saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!newMember.trim()) return;
    setMemberError('');
    try {
      const res = await api.post(`/projects/${project.id}/members`, { username: newMember.trim() });
      setProject(res.data);
      setNewMember('');
    } catch (err) {
      setMemberError(getErrorMessage(err));
    }
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Remove ${member.fullName} from the project? Their issues will be unassigned.`)) return;
    try {
      const res = await api.delete(`/projects/${project.id}/members/${member.id}`);
      setProject(res.data);
    } catch (err) {
      setMemberError(getErrorMessage(err));
    }
  };

  const deleteProject = async () => {
    const typed = window.prompt(`This will delete the project and ALL its issues.\nType ${project.projectKey} to confirm:`);
    if (typed !== project.projectKey) return;
    try {
      await api.delete(`/projects/${project.id}`);
      navigate('/projects');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const notMembers = allUsers.filter((u) => !project.members.some((m) => m.id === u.id));

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1>Project settings</h1>
      </div>

      <section className="settings-section">
        <h3>Details</h3>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={saveDetails}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ width: 200 }}>
            <label>Key</label>
            <input type="text" value={project.projectKey} disabled />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
          {message && <span style={{ marginLeft: 10, color: '#2f8a57' }}>{message}</span>}
        </form>
      </section>

      <section className="settings-section">
        <h3>People</h3>
        {memberError && <div className="alert-error">{memberError}</div>}
        <form onSubmit={addMember} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            list="users-list"
            placeholder="Add by username"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <datalist id="users-list">
            {notMembers.map((u) => <option key={u.id} value={u.username}>{u.fullName}</option>)}
          </datalist>
          <button type="submit" className="btn btn-subtle">Add</button>
        </form>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: 90 }}>Role</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {project.members.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={m} size={28} />
                    <div>
                      <div>{m.fullName}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>@{m.username}</div>
                    </div>
                  </div>
                </td>
                <td className="text-subtle">{m.email}</td>
                <td>{m.id === project.owner.id ? 'Owner' : 'Member'}</td>
                <td>
                  {m.id !== project.owner.id && (
                    <button className="btn btn-link danger" onClick={() => removeMember(m)}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isOwner && (
        <section className="settings-section danger-zone">
          <h3>Delete project</h3>
          <p className="text-subtle">Once deleted, the project and all of its issues are gone forever.</p>
          <button className="btn btn-danger" onClick={deleteProject}>Delete project</button>
        </section>
      )}
    </div>
  );
}

export default SettingsPage;
