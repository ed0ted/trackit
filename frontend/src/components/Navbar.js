import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Avatar from './Avatar';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // close dropdown when clicking somewhere else
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/projects" className="navbar-brand">
          <Logo light />
        </Link>
        <NavLink to="/your-work" className="navbar-link">Your work</NavLink>
        <NavLink to="/projects" className="navbar-link">Projects</NavLink>
        {user.role === 'ADMIN' && <NavLink to="/admin" className="navbar-link">Admin</NavLink>}
      </div>

      <div className="navbar-right" ref={menuRef}>
        <button className="navbar-user" onClick={() => setMenuOpen(!menuOpen)}>
          <Avatar user={user} size={28} />
          <FiChevronDown />
        </button>
        {menuOpen && (
          <div className="user-menu">
            <div className="user-menu-header">
              <Avatar user={user} size={36} />
              <div>
                <div className="user-menu-name">{user.fullName}</div>
                <div className="user-menu-email">{user.email}</div>
                {user.role === 'ADMIN' && <div className="user-menu-email">Administrator</div>}
              </div>
            </div>
            <button className="user-menu-item" onClick={handleLogout}>
              <FiLogOut /> Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
