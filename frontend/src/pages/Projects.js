import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '../api/api';
import Avatar from '../components/Avatar';
import { getAvatarColor, getErrorMessage } from '../utils/helpers';
import '../components/Modal.css';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.projectKey.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create project</button>
      </div>

      <div className="search-box" style={{ marginBottom: 20 }}>
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h3>You don't have any projects yet</h3>
          <p>Create a project to start tracking your work.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create project</button>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 100 }}>Key</th>
              <th style={{ width: 160 }}>Type</th>
              <th style={{ width: 220 }}>Lead</th>
              <th style={{ width: 80 }}>Issues</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}/board`)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="project-icon small" style={{ backgroundColor: getAvatarColor(p.projectKey) }}>
                      {p.projectKey.charAt(0)}
                    </div>
                    <Link to={`/projects/${p.id}/board`} onClick={(e) => e.stopPropagation()}>{p.name}</Link>
                  </div>
                </td>
                <td>{p.projectKey}</td>
                <td className="text-subtle">Kanban project</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={p.owner} size={24} />
                    {p.owner.fullName}
                  </div>
                </td>
                <td>{p.issueCount}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="text-muted">No projects match "{search}"</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(p) => navigate(`/projects/${p.id}/board`)}
        />
      )}
    </div>
  );
}

// only used here so I left it in the same file
function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // generate key from the name like jira does ("My Cool Project" -> "MCP")
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!keyTouched) {
      const words = value.trim().split(/\s+/).filter((w) => /^[a-zA-Z]/.test(w));
      let generated = words.length > 1 ? words.map((w) => w[0]).join('') : (words[0] || '').substring(0, 3);
      setKey(generated.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 10));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name, projectKey: key, description });
      onCreated(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" style={{ width: 520 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create project</h2>
          <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" value={name} onChange={handleNameChange} autoFocus required />
            </div>
            <div className="form-group" style={{ width: 200 }}>
              <label>Key <span className="required">*</span></label>
              <input
                type="text"
                value={key}
                maxLength={10}
                onChange={(e) => {
                  setKeyTouched(true);
                  setKey(e.target.value.toUpperCase());
                }}
                required
              />
              <small className="text-muted">Used as prefix for issues, e.g. {key || 'KEY'}-1</small>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-subtle" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Projects;
