import { FiUser } from 'react-icons/fi';
import { getAvatarColor, getInitials } from '../utils/helpers';

function Avatar({ user, size = 24, className = '', onClick, title }) {
  const style = { width: size, height: size, fontSize: size * 0.4, lineHeight: size + 'px' };

  if (!user) {
    return (
      <span className={'avatar avatar-empty ' + className} style={style} title={title || 'Unassigned'} onClick={onClick}>
        <FiUser size={size * 0.55} />
      </span>
    );
  }

  return (
    <span
      className={'avatar ' + className}
      style={{ ...style, backgroundColor: getAvatarColor(user.username) }}
      title={title || user.fullName}
      onClick={onClick}
    >
      {getInitials(user.fullName || user.username)}
    </span>
  );
}

export default Avatar;
