import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>FeatureFlow</h1>
        </Link>
        <nav>
          <Link to="/">Features</Link>
          <Link to="/features/new">New Feature</Link>
          <span style={{ color: '#6b7280' }}>|</span>
          <span style={{ color: '#6b7280' }}>{user?.username}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
