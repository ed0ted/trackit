import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus } from 'react-icons/fi';
import IssueCard from './IssueCard';

function Column({ column, issues, onIssueClick, onCreateClick }) {
  return (
    <div className="board-column">
      <div className="column-header">
        {column.title} <span className="column-count">{issues.length}</span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={'column-body' + (snapshot.isDraggingOver ? ' drag-over' : '')}
          >
            {issues.map((issue, index) => (
              <Draggable key={issue.id} draggableId={String(issue.id)} index={index}>
                {(provided, snapshot) => (
                  <IssueCard issue={issue} provided={provided} snapshot={snapshot} onClick={onIssueClick} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <button className="column-create-btn" onClick={() => onCreateClick(column.id)}>
              <FiPlus /> Create issue
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;
