import { useEffect, useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import IssueTypeIcon from './IssueTypeIcon';
import PriorityIcon from './PriorityIcon';
import Avatar from './Avatar';
import { COLUMNS, PRIORITIES, ISSUE_TYPES, capitalize, timeAgo, formatDate, getErrorMessage } from '../utils/helpers';
import './Modal.css';

function IssueModal({ issueId, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  // close on escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !editingTitle && !editingDesc) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingTitle, editingDesc, onClose]);

  const loadIssue = async () => {
    try {
      const res = await api.get(`/issues/${issueId}`);
      setIssue(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description || '');

      const [projectRes, commentsRes] = await Promise.all([
        api.get(`/projects/${res.data.projectId}`),
        api.get(`/issues/${issueId}/comments`),
      ]);
      setMembers(projectRes.data.members);
      setComments(commentsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // sends the whole issue with the changed fields
  const saveIssue = async (changes) => {
    const updated = { ...issue, ...changes };
    const body = {
      title: updated.title,
      description: updated.description,
      type: updated.type,
      status: updated.status,
      priority: updated.priority,
      storyPoints: updated.storyPoints,
      assigneeId: updated.assignee ? updated.assignee.id : null,
    };
    try {
      const res = await api.put(`/issues/${issue.id}`, body);
      setIssue(res.data);
      setError('');
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveTitle = () => {
    setEditingTitle(false);
    if (title.trim() && title !== issue.title) {
      saveIssue({ title: title.trim() });
    } else {
      setTitle(issue.title);
    }
  };

  const saveDescription = () => {
    setEditingDesc(false);
    saveIssue({ description });
  };

  const handleAssigneeChange = (e) => {
    const id = e.target.value;
    const member = members.find((m) => String(m.id) === id);
    saveIssue({ assignee: member || null });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${issue.key}? This can't be undone.`)) return;
    try {
      await api.delete(`/issues/${issue.id}`);
      if (onDeleted) onDeleted(issue.id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/issues/${issue.id}/comments`, { content: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal issue-modal" onMouseDown={(e) => e.stopPropagation()}>
        {!issue ? (
          <div className="modal-body">{error ? <div className="alert-error">{error}</div> : 'Loading...'}</div>
        ) : (
          <>
            <div className="issue-modal-top">
              <div className="issue-modal-key">
                <IssueTypeIcon type={issue.type} />
                <span>{issue.key}</span>
              </div>
              <div>
                <button className="icon-btn" title="Delete issue" onClick={handleDelete}><FiTrash2 size={17} /></button>
                <button className="icon-btn" title="Close" onClick={onClose}><FiX size={20} /></button>
              </div>
            </div>

            {error && <div className="alert-error" style={{ margin: '0 24px' }}>{error}</div>}

            <div className="issue-modal-content">
              {/* LEFT SIDE */}
              <div className="issue-modal-main">
                {editingTitle ? (
                  <input
                    className="title-input"
                    value={title}
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                  />
                ) : (
                  <h1 className="issue-title" onClick={() => setEditingTitle(true)}>{issue.title}</h1>
                )}

                <h4 className="section-label">Description</h4>
                {editingDesc ? (
                  <div>
                    <textarea
                      className="desc-textarea"
                      rows="6"
                      value={description}
                      autoFocus
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" onClick={saveDescription}>Save</button>
                      <button
                        className="btn btn-subtle"
                        onClick={() => {
                          setEditingDesc(false);
                          setDescription(issue.description || '');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="issue-description" onClick={() => setEditingDesc(true)}>
                    {issue.description ? issue.description : <span className="placeholder">Add a description...</span>}
                  </div>
                )}

                <h4 className="section-label" style={{ marginTop: 28 }}>Comments</h4>
                <form className="comment-form" onSubmit={addComment}>
                  <Avatar user={user} size={32} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      placeholder="Add a comment..."
                      rows={newComment ? 3 : 1}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    {newComment && (
                      <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>Save</button>
                    )}
                  </div>
                </form>

                <div className="comment-list">
                  {comments.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No comments yet.</p>}
                  {comments
                    .slice()
                    .reverse()
                    .map((c) => (
                      <div key={c.id} className="comment">
                        <Avatar user={c.author} size={32} />
                        <div style={{ flex: 1 }}>
                          <div className="comment-meta">
                            <strong>{c.author.fullName}</strong>
                            <span className="text-muted">{timeAgo(c.createdAt)}</span>
                          </div>
                          <div className="comment-text">{c.content}</div>
                          {c.author.id === user.id && (
                            <button className="link-btn small" onClick={() => deleteComment(c.id)}>Delete</button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="issue-modal-side">
                <select
                  className={'status-select status-' + issue.status.toLowerCase()}
                  value={issue.status}
                  onChange={(e) => saveIssue({ status: e.target.value })}
                >
                  {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <div className="details-box">
                  <div className="details-title">Details</div>

                  <div className="detail-row">
                    <label>Assignee</label>
                    <div className="detail-value">
                      <Avatar user={issue.assignee} size={24} />
                      <select value={issue.assignee ? issue.assignee.id : ''} onChange={handleAssigneeChange}>
                        <option value="">Unassigned</option>
                        {members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Reporter</label>
                    <div className="detail-value">
                      <Avatar user={issue.reporter} size={24} />
                      <span style={{ paddingLeft: 6 }}>{issue.reporter ? issue.reporter.fullName : '-'}</span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Priority</label>
                    <div className="detail-value">
                      <PriorityIcon priority={issue.priority} />
                      <select value={issue.priority} onChange={(e) => saveIssue({ priority: e.target.value })}>
                        {PRIORITIES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Type</label>
                    <div className="detail-value">
                      <IssueTypeIcon type={issue.type} />
                      <select value={issue.type} onChange={(e) => saveIssue({ type: e.target.value })}>
                        {ISSUE_TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label>Story points</label>
                    <div className="detail-value">
                      <input
                        type="number"
                        min="0"
                        className="points-input"
                        defaultValue={issue.storyPoints != null ? issue.storyPoints : ''}
                        placeholder="None"
                        onBlur={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          if (val !== issue.storyPoints) saveIssue({ storyPoints: val });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="dates">
                  <div>Created {formatDate(issue.createdAt)}</div>
                  <div>Updated {timeAgo(issue.updatedAt)}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IssueModal;
