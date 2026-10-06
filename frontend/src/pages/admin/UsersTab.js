import { useEffect, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const emptyUser = { username: '', email: '', fullName: '', password: '', role: 'USER' };

function UsersTab({ onChange }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadUsers = () => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/users', newUser);
      setNewUser(emptyUser);
      setShowAdd(false);
      loadUsers();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ email: u.email, fullName: u.fullName, role: u.role, password: '' });
    setError('');
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, editForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user ${u.username}? Their comments will be deleted and issues unassigned.`)) return;
    setError('');
    try {
      await api.delete(`/admin/users/${u.id}`);
      loadUsers();
      onChange();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      {error && <div className="alert-error">{error}</div>}

      <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ marginBottom: 12 }}>
        {showAdd ? 'Cancel' : 'Add user'}
      </button>

      {showAdd && (
        <form className="admin-form" onSubmit={createUser}>
          <input type="text" placeholder="Username" value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
          <input type="email" placeholder="Email" value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
          <input type="text" placeholder="Full name" value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <table className="table admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>New password</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) =>
            editingId === u.id ? (
              <tr key={u.id} className="editing">
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td><input type="text" value={editForm.fullName || ''} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} /></td>
                <td><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                <td>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td><input type="password" placeholder="(unchanged)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></td>
                <td>{formatDate(u.createdAt)}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => saveEdit(u.id)}>Save</button>
                  <button className="btn btn-link" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.role === 'ADMIN' ? <b>ADMIN</b> : 'USER'}</td>
                <td className="text-muted">-</td>
                <td>{formatDate(u.createdAt)}</td>
                <td className="actions">
                  <button className="btn btn-link" onClick={() => startEdit(u)}>Edit</button>
                  {u.id !== me.id && (
                    <button className="btn btn-link danger" onClick={() => deleteUser(u)}>Delete</button>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTab;
