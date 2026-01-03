import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaveAPI, employeeAPI } from '../api/api';
import './LeaveRequests.css';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ paid: { remaining: 12 }, sick: { remaining: 8 }, unpaid: { remaining: 5 } });
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesData, balanceData, profileData] = await Promise.all([
        leaveAPI.getMyLeaves(),
        leaveAPI.getBalance(),
        employeeAPI.getProfile(),
      ]);
      setLeaves(leavesData);
      setBalance(balanceData);
      setEmployee(profileData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === 'ALL') return true;
    return leave.status === filter;
  });

  if (loading) {
    return <div className="leave-loading">Loading...</div>;
  }

  return (
    <div className="leave-requests-page">
      <div className="leave-header">
        <div>
          <h1>Leave Management</h1>
          <p>Apply for leave and track your requests</p>
        </div>
        <Link to="/employee/leave-apply" className="apply-leave-btn">
          + Apply for Leave
        </Link>
      </div>

      <div className="leave-summary-cards">
        <div className="summary-card paid">
          <div className="summary-content">
            <div className="summary-value">{balance.paid?.remaining || 12}</div>
            <div className="summary-label">of {balance.paid?.total || 15} days remaining</div>
          </div>
          <div className="summary-icon">📅</div>
        </div>
        <div className="summary-card sick">
          <div className="summary-content">
            <div className="summary-value">{balance.sick?.remaining || 8}</div>
            <div className="summary-label">of {balance.sick?.total || 10} days remaining</div>
          </div>
          <div className="summary-icon">📅</div>
        </div>
        <div className="summary-card unpaid">
          <div className="summary-content">
            <div className="summary-value">{balance.unpaid?.remaining || 5}</div>
            <div className="summary-label">of {balance.unpaid?.total || 5} days remaining</div>
          </div>
          <div className="summary-icon">📅</div>
        </div>
      </div>

      <div className="leave-requests-section">
        <div className="section-header">
          <h2>My Leave Requests</h2>
          <div className="filter-control">
            <span className="filter-icon">🔽</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="leave-requests-list">
          {filteredLeaves.length === 0 ? (
            <div className="no-leaves">No leave requests found</div>
          ) : (
            filteredLeaves.map((leave) => (
              <div key={leave.id} className="leave-request-card">
                <div className="leave-card-header">
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
  );
};

export default LeaveRequests;

