import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../api/api';
import IssueTypeIcon from '../components/IssueTypeIcon';
import PriorityIcon from '../components/PriorityIcon';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import IssueModal from '../components/IssueModal';
import { COLUMNS, PRIORITIES, capitalize, formatDate } from '../utils/helpers';

// list view of all the issues in the project (kind of like the backlog)
function IssuesPage() {
  const { project } = useOutletContext();
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('key');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadIssues = () => {
    api.get(`/projects/${project.id}/issues`)
      .then((res) => setIssues(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const compare = (a, b) => {
    let res = 0;
    if (sortBy === 'key') {
      res = Number(a.key.split('-')[1]) - Number(b.key.split('-')[1]);
    } else if (sortBy === 'title') {
      res = a.title.localeCompare(b.title);
    } else if (sortBy === 'status') {
      res = COLUMNS.findIndex((c) => c.id === a.status) - COLUMNS.findIndex((c) => c.id === b.status);
    } else if (sortBy === 'priority') {
      res = PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
    } else if (sortBy === 'updated') {
      res = new Date(a.updatedAt) - new Date(b.updatedAt);
    }
    return sortAsc ? res : -res;
  };

  const visible = issues
    .filter((i) => !statusFilter || i.status === statusFilter)
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.key.toLowerCase().includes(search.toLowerCase()))
    .sort(compare);

  const SortHeader = ({ field, children, width }) => (
    <th style={{ width, cursor: 'pointer' }} onClick={() => handleSort(field)}>
      {children} {sortBy === field ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Issues</h1>
      </div>

      <div className="board-toolbar" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search issues" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <span className="text-muted" style={{ fontSize: 13 }}>{visible.length} issues</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>T</th>
            <SortHeader field="key" width={90}>Key</SortHeader>
            <SortHeader field="title">Summary</SortHeader>
            <th style={{ width: 170 }}>Assignee</th>
            <SortHeader field="priority" width={110}>Priority</SortHeader>
            <SortHeader field="status" width={130}>Status</SortHeader>
            <SortHeader field="updated" width={120}>Updated</SortHeader>
          </tr>
        </thead>
        <tbody>
          {visible.map((issue) => (
            <tr key={issue.id} className="clickable" onClick={() => setSelectedId(issue.id)}>
              <td><IssueTypeIcon type={issue.type} /></td>
              <td className="text-subtle">{issue.key}</td>
              <td>{issue.title}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar user={issue.assignee} size={22} />
                  <span className={issue.assignee ? '' : 'text-muted'}>
                    {issue.assignee ? issue.assignee.fullName : 'Unassigned'}
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PriorityIcon priority={issue.priority} /> {capitalize(issue.priority)}
                </div>
              </td>
              <td><StatusBadge status={issue.status} /></td>
              <td className="text-subtle">{formatDate(issue.updatedAt)}</td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr><td colSpan="7" className="text-muted">No issues found</td></tr>
          )}
        </tbody>
      </table>

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

export default IssuesPage;
