import { STATUS_LABELS } from '../utils/helpers';

function StatusBadge({ status }) {
  return <span className={'status-badge status-' + status.toLowerCase()}>{STATUS_LABELS[status]}</span>;
}

export default StatusBadge;
