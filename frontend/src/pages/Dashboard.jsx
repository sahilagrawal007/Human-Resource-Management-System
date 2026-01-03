import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, leaveAPI, employeeAPI } from '../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ daysWorked: 0, hoursThisWeek: 0, attendanceRate: 0 });
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({ paid: { remaining: 12 }, sick: { remaining: 8 }, unpaid: { remaining: 5 } });
  const [leaves, setLeaves] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, todayData, balanceData, leavesData, profileData] = await Promise.all([
        attendanceAPI.getStats(),
        attendanceAPI.getToday(),
        leaveAPI.getBalance(),
        leaveAPI.getMyLeaves(),
        employeeAPI.getProfile(),
      ]);
      setStats(statsData);
      setTodayAttendance(todayData);
      setLeaveBalance(balanceData);
      setLeaves(leavesData.slice(0, 2));
      setEmployee(profileData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getLeaveStatusBadge = (leave) => {
    const typeColors = {
      PAID: { bg: '#d1fae5', text: '#065f46', label: 'paid' },
      SICK: { bg: '#fed7aa', text: '#9a3412', label: 'sick' },
      UNPAID: { bg: '#e5e7eb', text: '#374151', label: 'unpaid' },
    };
    const statusColors = {
      APPROVED: { bg: '#10b981', text: 'white', label: 'approved' },
      PENDING: { bg: '#f59e0b', text: 'white', label: 'pending' },
      REJECTED: { bg: '#ef4444', text: 'white', label: 'rejected' },
    };

    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            backgroundColor: typeColors[leave.type]?.bg || '#e5e7eb',
            color: typeColors[leave.type]?.text || '#374151',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'lowercase',
          }}
        >
          {typeColors[leave.type]?.label || leave.type.toLowerCase()}
        </span>
        <span
          style={{
            backgroundColor: statusColors[leave.status]?.bg || '#6b7280',
            color: statusColors[leave.status]?.text || 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'lowercase',
          }}
        >
          {statusColors[leave.status]?.label || leave.status.toLowerCase()}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const username = employee?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{getGreeting()}, {username}! 👋</h1>
          <p>Here's your work summary for today</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon green">📅</div>
          <div className="card-content">
            <div className="card-value">{stats.daysWorked}</div>
            <div className="card-label">This month</div>
            <div className="card-title">Days Worked</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon green">🕐</div>
          <div className="card-content">
            <div className="card-value">{stats.hoursThisWeek}</div>
            <div className="card-label">
              <span style={{ color: '#10b981' }}>+5%</span> 8h remaining
            </div>
            <div className="card-title">Hours This Week</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon orange">📈</div>
          <div className="card-content">
            <div className="card-value">{leaveBalance.paid?.remaining || 12}</div>
            <div className="card-label">Days remaining</div>
            <div className="card-title">Leave Balance</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon orange">🏅</div>
          <div className="card-content">
            <div className="card-value">{stats.attendanceRate}%</div>
            <div className="card-label">Last 30 days</div>
            <div className="card-title">Attendance Rate</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="attendance-card">
          <div className="card-header">
            <h3>Today's Attendance</h3>
            <span className="header-icon">🕐</span>
          </div>
          <div className="attendance-date">{formatDate(new Date())}</div>
          <div className="attendance-times">
            <div className="time-box">
              <div className="time-label">Check In</div>
              <div className="time-value">{formatTime(todayAttendance?.checkIn)}</div>
            </div>
            <div className="time-box">
              <div className="time-label">Check Out</div>
              <div className="time-value">{formatTime(todayAttendance?.checkOut)}</div>
            </div>
          </div>
          <div className="attendance-actions">
            <button
              className="check-in-btn"
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn}
            >
              Check In →
            </button>
            <button
              className="check-out-btn"
              onClick={handleCheckOut}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
            >
              Check Out →
            </button>
          </div>
        </div>

        <div className="leave-requests-card">
          <div className="card-header">
            <h3>My Leave Requests</h3>
            <button 
              className="apply-btn"
              onClick={() => navigate('/employee/leave-apply')}
            >
              Apply for Leave
            </button>
          </div>
          <div className="leave-requests-list">
            {leaves.length === 0 ? (
              <div className="no-leaves">No leave requests yet</div>
            ) : (
              leaves.map((leave) => (
                <div key={leave.id} className="leave-request-item">
                  <div className="leave-header">
                    <div className="leave-user">
                      <span className="user-icon-small">👤</span>
                      <span>{employee?.fullName || 'Employee'}</span>
                    </div>
                    {getLeaveStatusBadge(leave)}
                  </div>
                  <div className="leave-type">{leave.type.replace('_', ' ')}</div>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

