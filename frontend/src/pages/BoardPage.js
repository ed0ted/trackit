import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { FiSearch, FiPlus } from 'react-icons/fi';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Column from '../components/Column';
import Avatar from '../components/Avatar';
import CreateIssueModal from '../components/CreateIssueModal';
import IssueModal from '../components/IssueModal';
import { COLUMNS, ISSUE_TYPES, capitalize } from '../utils/helpers';
import './Board.css';

const byPosition = (a, b) => a.position - b.position;

function BoardPage() {
  const { project } = useOutletContext();
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const [createStatus, setCreateStatus] = useState(null); // which column "create" was clicked in
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const loadIssues = async () => {
    try {
      const res = await api.get(`/projects/${project.id}/issues`);
      setIssues(res.data);
    } catch (err) {
      console.log('failed to load issues', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const filteredIssues = issues.filter((issue) => {
    if (search) {
      const s = search.toLowerCase();
      if (!issue.title.toLowerCase().includes(s) && !issue.key.toLowerCase().includes(s)) return false;
    }
    if (onlyMine && (!issue.assignee || issue.assignee.id !== user.id)) return false;
    if (selectedUsers.length > 0) {
      const assigneeId = issue.assignee ? issue.assignee.id : 'none';
      if (!selectedUsers.includes(assigneeId)) return false;
    }
    if (typeFilter && issue.type !== typeFilter) return false;
    return true;
  });

  const hasFilters = search || onlyMine || selectedUsers.length > 0 || typeFilter;

  const toggleUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedUsers([]);
    setOnlyMine(false);
    setTypeFilter('');
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const issueId = Number(draggableId);
    const moved = issues.find((i) => i.id === issueId);
    const oldStatus = moved.status;
    const newStatus = destination.droppableId;

    // when filters are on, the index from the board is not the real index in the column
    // so find the position using the card that is currently at that spot
    const targetColumn = issues.filter((i) => i.status === newStatus && i.id !== issueId).sort(byPosition);
    const visibleColumn = filteredIssues.filter((i) => i.status === newStatus && i.id !== issueId).sort(byPosition);
    let newPosition = targetColumn.length;
    if (destination.index < visibleColumn.length) {
      newPosition = targetColumn.findIndex((i) => i.id === visibleColumn[destination.index].id);
    }

    // update the state right away so the card doesn't jump back while waiting for the server
    targetColumn.splice(newPosition, 0, { ...moved, status: newStatus });
    const changed = {};
    targetColumn.forEach((issue, idx) => {
      changed[issue.id] = { ...issue, position: idx };
    });
    if (oldStatus !== newStatus) {
      issues
        .filter((i) => i.status === oldStatus && i.id !== issueId)
        .sort(byPosition)
        .forEach((issue, idx) => {
          changed[issue.id] = { ...issue, position: idx };
        });
    }
    setIssues(issues.map((i) => changed[i.id] || i));

    api.patch(`/issues/${issueId}/move`, { status: newStatus, position: newPosition })
      .catch((err) => {
        console.log(err);
        alert('Could not move the issue, reloading board');
        loadIssues();
      });
  };

  const handleCreated = (issue) => {
    setIssues([...issues, issue]);
    setCreateStatus(null);
  };

  const handleUpdated = (updated) => {
    // status may have changed from the modal so positions in other cards could change too, just reload
    if (issues.find((i) => i.id === updated.id).status !== updated.status) {
      loadIssues();
    } else {
      setIssues(issues.map((i) => (i.id === updated.id ? updated : i)));
    }
  };

  const handleDeleted = (id) => {
    setIssues(issues.filter((i) => i.id !== id));
  };

  return (
    <div className="board-page">
      <div className="breadcrumbs">
        <Link to="/projects">Projects</Link> <span>/</span> <span>{project.name}</span>
      </div>
      <div className="board-header">
        <h1>{project.projectKey} board</h1>
        <button className="btn btn-primary" onClick={() => setCreateStatus('TODO')}>
          <FiPlus style={{ marginRight: 4, verticalAlign: -2 }} />
          Create issue
        </button>
      </div>

      <div className="board-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search this board" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="avatar-filter">
          {project.members.map((m) => (
            <Avatar
              key={m.id}
              user={m}
              size={32}
              className={'avatar-filter-item' + (selectedUsers.includes(m.id) ? ' selected' : '')}
              onClick={() => toggleUser(m.id)}
            />
          ))}
          <Avatar
            user={null}
            size={32}
            title="Unassigned"
            className={'avatar-filter-item' + (selectedUsers.includes('none') ? ' selected' : '')}
            onClick={() => toggleUser('none')}
          />
        </div>

        <button className={'btn btn-subtle' + (onlyMine ? ' btn-toggled' : '')} onClick={() => setOnlyMine(!onlyMine)}>
          Only my issues
        </button>

        <select className="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Type: All</option>
          {ISSUE_TYPES.map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
        </select>

        {hasFilters && (
          <button className="btn btn-link" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {loading ? (
        <p>Loading board...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board-columns">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                column={col}
                issues={filteredIssues.filter((i) => i.status === col.id).sort(byPosition)}
                onIssueClick={(issue) => setSelectedIssueId(issue.id)}
                onCreateClick={(status) => setCreateStatus(status)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {createStatus && (
        <CreateIssueModal
          project={project}
          defaultStatus={createStatus}
          onClose={() => setCreateStatus(null)}
          onCreated={handleCreated}
        />
      )}

      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

export default BoardPage;
