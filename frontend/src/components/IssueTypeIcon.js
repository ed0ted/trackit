// small colored icons for task / bug / story
function IssueTypeIcon({ type, size = 16 }) {
  if (type === 'BUG') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" className="type-icon">
        <title>Bug</title>
        <rect width="16" height="16" rx="3" fill="#e0493a" />
        <circle cx="8" cy="8" r="3.5" fill="#fff" />
      </svg>
    );
  }
  if (type === 'STORY') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" className="type-icon">
        <title>Story</title>
        <rect width="16" height="16" rx="3" fill="#5aa832" />
        <path d="M5 3.5h6a.5.5 0 0 1 .5.5v8.6l-3.5-2.4-3.5 2.4V4a.5.5 0 0 1 .5-.5z" fill="#fff" />
      </svg>
    );
  }
  // default = task
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="type-icon">
      <title>Task</title>
      <rect width="16" height="16" rx="3" fill="#4189e8" />
      <path d="M4.5 8.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default IssueTypeIcon;
