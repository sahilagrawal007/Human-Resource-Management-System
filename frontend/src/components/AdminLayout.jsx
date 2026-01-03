import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { employeeAPI } from '../api/api';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
        setUsername(profile.fullName.split(' ').map(n => n[0]).join('').toLowerCase() || 'admin');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setUsername('admin');
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
    { path: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/attendance', label: 'Attendance', icon: '🕐' },
    { path: '/admin/leave-management', label: 'Leave Management', icon: '📄' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-logo">
            <span className="admin-logo-icon">⚡</span>
            <span className="admin-logo-text">flow</span>
          </div>
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {location.pathname === item.path && <span className="admin-nav-arrow">→</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-info">
            <span className="admin-user-icon">👤</span>
            <div className="admin-user-details">
              <div className="admin-username">{username}</div>
              <div className="admin-user-role">Admin</div>
            </div>
          </div>
          <button className="admin-sign-out-btn" onClick={handleSignOut}>
            <span>Sign Out</span>
            <span className="admin-sign-out-icon">→</span>
          </button>
        </div>
      </aside>
      <main className="admin-main-content">{children}</main>
    </div>
  );
};

export default AdminLayout;

