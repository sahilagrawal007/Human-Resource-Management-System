import { useEffect, useState } from 'react';
import { adminAPI, leaveAPI } from '../../api/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, weeklyData, deptData, leavesData, activityData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getWeeklyAttendance(),
        adminAPI.getDepartments(),
        leaveAPI.getPending(),
        adminAPI.getActivity(5),
      ]);
      setStats(statsData);
      setWeeklyData(weeklyData);
      setDepartments(deptData);
      setPendingLeaves(leavesData.slice(0, 2));
      setActivity(activityData);
      setUsername(localStorage.getItem('username') || 'Admin');
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leaveId, status) => {
    try {
      await leaveAPI.updateStatus(leaveId, status);
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave status');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getActivityIcon = (type) => {
    if (type === 'checkin') return '✓';
    if (type === 'leave') return '📅';
    return '•';
  };

  const getActivityColor = (type) => {
    if (type === 'checkin') return '#10b981';
    if (type === 'leave') return '#f59e0b';
    return '#64748b';
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading...</div>;
  }

  const maxPresent = Math.max(...weeklyData.map(d => d.present), 60);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {username}. Here's what's happening today.</p>
        </div>
      </div>

      <div className="admin-summary-cards">
        <div className="admin-summary-card">
          <div className="admin-card-icon green">👥</div>
          <div className="admin-card-content">
            <div className="admin-card-value">{stats.totalEmployees || 0}</div>
            <div className="admin-card-label">
              <span style={{ color: '#10b981' }}>{stats.growth || '+0%'}</span>
            </div>
            <div className="admin-card-title">Total Employees</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon green">✓</div>
          <div className="admin-card-content">
            <div className="admin-card-value">{stats.presentToday || 0}</div>
            <div className="admin-card-label">{stats.attendanceRate || 0}% attendance</div>
            <div className="admin-card-title">Present Today</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon orange">📅</div>
          <div className="admin-card-content">
            <div className="admin-card-value">{stats.onLeave || 0}</div>
            <div className="admin-card-title">On Leave</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-card-icon orange">🕐</div>
          <div className="admin-card-content">
            <div className="admin-card-value">{stats.pendingRequests || 0}</div>
            <div className="admin-card-label">Requires attention</div>
            <div className="admin-card-title">Pending Requests</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-chart-card">
          <h3>Weekly Attendance Overview</h3>
          <div className="chart-container">
            <div className="bar-chart">
              {weeklyData.map((day, index) => (
                <div key={index} className="bar-group">
                  <div className="bars">
                    <div 
                      className="bar present" 
                      style={{ height: `${(day.present / maxPresent) * 100}%` }}
                    ></div>
                    <div 
                      className="bar absent" 
                      style={{ height: `${(day.absent / maxPresent) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-label">{day.day}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot present"></span>
                <span>Present</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot absent"></span>
                <span>Absent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>Employees by Department</h3>
          <div className="chart-container">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="40"
                />
                {(() => {
                  let currentAngle = -90;
                  const colors = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
                  return departments.map((dept, index) => {
                    const percentage = parseFloat(dept.percentage);
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;
                    
                    const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={index}
                        d={`M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="40"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="donut-center">
                <div className="donut-total">{stats.totalEmployees || 0}</div>
                <div className="donut-label">Employees</div>
              </div>
            </div>
            <div className="department-legend">
              {departments.slice(0, 5).map((dept, index) => {
                const colors = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
                return (
                  <div key={index} className="dept-legend-item">
                    <span className="dept-dot" style={{ backgroundColor: colors[index % colors.length] }}></span>
                    <span>{dept.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-bottom">
        <div className="admin-pending-leaves-card">
          <div className="card-header">
            <h3>Pending Leave Requests</h3>
            <a href="/admin/leave-management" className="view-all-btn">View All</a>
          </div>
          <div className="leave-requests-list">
            {pendingLeaves.length === 0 ? (
              <div className="no-leaves">No pending requests</div>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="leave-request-card">
                  <div className="leave-card-header">
                    <div className="leave-user">
                      <span className="user-icon-small">👤</span>
                      <span>{leave.employee?.fullName || 'Employee'}</span>
                    </div>
                    <div className="leave-badges">
                      <span className={`badge ${leave.type.toLowerCase()}`}>{leave.type.replace('_', ' ')}</span>
                      <span className="badge pending">pending</span>
                    </div>
                  </div>
                  <div className="leave-details">
                    <div className="detail-item">
                      <span>📅</span>
                      <span>
                        {new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(leave.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>🕐</span>
                      <span>
                        Applied on{' '}
                        {new Date(leave.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {leave.reason && <div className="leave-reason">{leave.reason}</div>}
                  <div className="leave-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleStatusChange(leave.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleStatusChange(leave.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-activity-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="header-icon">🕐</span>
          </div>
          <div className="activity-list">
            {activity.length === 0 ? (
              <div className="no-activity">No recent activity</div>
            ) : (
              activity.map((item, index) => (
                <div key={index} className="activity-item">
                  <div 
                    className="activity-icon" 
                    style={{ backgroundColor: `${getActivityColor(item.type)}20`, color: getActivityColor(item.type) }}
                  >
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{item.employee}</strong> {item.message}
                    </div>
                    <div className="activity-time">{formatTime(item.time)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

