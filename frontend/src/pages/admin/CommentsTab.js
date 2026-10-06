import { useEffect, useState } from 'react';
import api from '../../api/api';
import { formatDate, getErrorMessage } from '../../utils/helpers';

function CommentsTab({ onChange }) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  const loadComments = () => {
    api.get('/admin/comments')
      .then((res) => setComments(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    loadComments();
  }, []);

  const deleteComment = async (c) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/admin/comments/${c.id}`);
      setComments(comments.filter((x) => x.id !== c.id));
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}
      {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
      {comments.length > 0 && (
        <table className="table admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Author</th>
              <th>Comment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.issueKey}</td>
                <td>{c.authorUsername}</td>
                <td className="cell-truncate" style={{ maxWidth: 500 }} title={c.content}>{c.content}</td>
                <td>{formatDate(c.createdAt)}</td>
                <td className="actions">
                  <button className="btn btn-link danger" onClick={() => deleteComment(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CommentsTab;
