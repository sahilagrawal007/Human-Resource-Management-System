import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { employeeAPI } from '../api/api';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await employeeAPI.getProfile();
        setEmployee(profile);
        setUsername(profile.fullName.split(' ').map(n => n[0]).join('').toLowerCase() || 'user');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        const email = localStorage.getItem('email') || 'user';
        setUsername(email.split('@')[0]);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    navigate('/');
  };

  const navItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/employee/profile', label: 'My Profile', icon: '👤' },
    { path: '/employee/attendance', label: 'Attendance', icon: '🕐' },
    { path: '/employee/leave-requests', label: 'Leave Requests', icon: '📅' },
  ];

  // Check if current path matches attendance routes
  const isAttendanceActive = location.pathname.startsWith('/employee/attendance');

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">flow</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = item.path === '/employee/attendance' 
                ? isAttendanceActive 
                : location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {isActive && <span className="nav-arrow">→</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <div className="user-details">
              <div className="username">{username}</div>
              <div className="user-role">Employee</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>
            <span>Sign Out</span>
            <span className="sign-out-icon">→</span>
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;

