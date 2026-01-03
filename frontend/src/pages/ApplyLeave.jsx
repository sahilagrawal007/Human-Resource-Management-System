import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../api/api';
import './ApplyLeave.css';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'PAID',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await leaveAPI.apply(
        formData.type,
        formData.startDate,
        formData.endDate,
        formData.reason
      );
      navigate('/employee/leave-requests');
    } catch (err) {
      console.error('Apply leave error:', err);
      setError(err.response?.data?.message || 'Failed to apply for leave. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="apply-leave-page">
      <div className="apply-leave-header">
        <div>
          <h1>Apply for Leave</h1>
          <p>Submit a leave request for approval</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/employee/leave-requests')}>
          ← Back
        </button>
      </div>

      <div className="apply-leave-card">
        <form onSubmit={handleSubmit} className="leave-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="type">Leave Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="PAID">Paid Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request..."
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/employee/leave-requests')}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;

