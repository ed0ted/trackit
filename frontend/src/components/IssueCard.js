import IssueTypeIcon from './IssueTypeIcon';
import PriorityIcon from './PriorityIcon';
import Avatar from './Avatar';

function IssueCard({ issue, provided, snapshot, onClick }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={'issue-card' + (snapshot.isDragging ? ' dragging' : '')}
      onClick={() => onClick(issue)}
    >
      <div className="issue-card-title">{issue.title}</div>
      <div className="issue-card-footer">
        <div className="issue-card-left">
          <IssueTypeIcon type={issue.type} />
          <span className={'issue-key' + (issue.status === 'DONE' ? ' done' : '')}>{issue.key}</span>
        </div>
        <div className="issue-card-right">
          {issue.storyPoints != null && <span className="story-points">{issue.storyPoints}</span>}
          <PriorityIcon priority={issue.priority} />
          <Avatar user={issue.assignee} size={24} />
        </div>
      </div>
    </div>
  );
}

export default IssueCard;
