import { useEffect, useState } from 'react';
import { leaveAPI } from '../../api/api';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter]);

  const fetchLeaves = async () => {
    try {
      const data = await leaveAPI.getAll(statusFilter, typeFilter);
      setLeaves(data.leaves);
      setCounts(data.counts);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leaveId, status) => {
    try {
      await leaveAPI.updateStatus(leaveId, status);
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave status');
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

  if (loading) {
    return <div className="leave-management-loading">Loading...</div>;
  }

  return (
    <div className="leave-management-page">
      <div className="leave-management-header">
        <div>
          <h1>Leave Management</h1>
          <p>Review and manage employee leave requests</p>
        </div>
      </div>

      <div className="leave-summary-cards">
        <div className="summary-card pending">
          <div className="summary-icon">🕐</div>
          <div className="summary-content">
            <div className="summary-label">Pending</div>
            <div className="summary-value">{counts.pending}</div>
          </div>
        </div>
        <div className="summary-card approved">
          <div className="summary-icon">✓</div>
          <div className="summary-content">
            <div className="summary-label">Approved</div>
            <div className="summary-value">{counts.approved}</div>
          </div>
        </div>
        <div className="summary-card rejected">
          <div className="summary-icon">✗</div>
          <div className="summary-content">
            <div className="summary-label">Rejected</div>
            <div className="summary-value">{counts.rejected}</div>
          </div>
        </div>
      </div>

      <div className="leave-requests-section">
        <div className="section-header">
          <h2>Leave Requests</h2>
          <div className="filters">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({counts.all})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending ({counts.pending})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('APPROVED')}
              >
                Approved ({counts.approved})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('REJECTED')}
              >
                Rejected ({counts.rejected})
              </button>
            </div>
            <div className="type-filter">
              <span className="filter-icon">🔽</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Types</option>
                <option value="PAID">Paid Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
          </div>
        </div>

        <div className="leave-requests-list">
          {leaves.length === 0 ? (
            <div className="no-leaves">No leave requests found</div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="leave-request-card">
                <div className="leave-card-header">
                  <div className="leave-user">
                    <span className="user-icon-small">👤</span>
                    <span>{leave.employee?.fullName || 'Employee'}</span>
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
                {leave.status === 'PENDING' && (
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;

