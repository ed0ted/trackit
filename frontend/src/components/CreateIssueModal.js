import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { COLUMNS, PRIORITIES, ISSUE_TYPES, capitalize, getErrorMessage } from '../utils/helpers';
import './Modal.css';

function CreateIssueModal({ project, defaultStatus, onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    status: defaultStatus || 'TODO',
    assigneeId: '',
    storyPoints: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Summary is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        storyPoints: form.storyPoints !== '' ? Number(form.storyPoints) : null,
      };
      const res = await api.post(`/projects/${project.id}/issues`, body);
      onCreated(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} style={{ width: 600 }}>
        <div className="modal-header">
          <h2>Create issue</h2>
          <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label>Project</label>
              <input type="text" value={`${project.name} (${project.projectKey})`} disabled />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Issue type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  {ISSUE_TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Summary <span className="required">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} autoFocus />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assignee</label>
                <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {project.members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
                <button type="button" className="link-btn" onClick={() => setForm({ ...form, assigneeId: String(user.id) })}>
                  Assign to me
                </button>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ width: 120 }}>
              <label>Story points</label>
              <input type="number" name="storyPoints" min="0" value={form.storyPoints} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-subtle" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateIssueModal;
