import { FiChevronsUp, FiChevronUp, FiChevronDown, FiChevronsDown } from 'react-icons/fi';
import { FaEquals } from 'react-icons/fa';
import { capitalize } from '../utils/helpers';

function PriorityIcon({ priority, size = 16 }) {
  const title = capitalize(priority) + ' priority';
  switch (priority) {
    case 'HIGHEST':
      return <FiChevronsUp size={size} color="#d9362b" title={title} className="priority-icon" />;
    case 'HIGH':
      return <FiChevronUp size={size} color="#e05a2b" title={title} className="priority-icon" />;
    case 'LOW':
      return <FiChevronDown size={size} color="#2f8a57" title={title} className="priority-icon" />;
    case 'LOWEST':
      return <FiChevronsDown size={size} color="#2f8a57" title={title} className="priority-icon" />;
    default:
      return <FaEquals size={size - 4} color="#e0952b" title={title} className="priority-icon" style={{ margin: '0 2px' }} />;
  }
}

export default PriorityIcon;
