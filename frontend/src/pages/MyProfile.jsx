import { useEffect, useState } from 'react';
import { employeeAPI } from '../api/api';
import './MyProfile.css';

const MyProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await employeeAPI.getProfile();
      setEmployee(profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!employee) {
    return <div className="profile-error">Failed to load profile</div>;
  }

  const initials = employee.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your personal information</p>
        </div>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          <span>✏️</span>
          Edit Profile
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-overview-card">
          <div className="avatar-large">
            <span>{initials}</span>
          </div>
          <h2>{employee.fullName}</h2>
          <p className="job-title">{employee.jobTitle}</p>
          <div className="department-badge">{employee.department}</div>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <span>{employee.user?.email || 'N/A'}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>{employee.phone || 'N/A'}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📅</span>
              <span>Joined {formatDate(employee.joinDate)}</span>
            </div>
          </div>
        </div>

        <div className="profile-details-card">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={employee.fullName.split(' ')[0] || ''}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={employee.fullName.split(' ').slice(1).join(' ') || ''}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={employee.user?.email || ''}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={employee.phone || ''}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Job Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={employee.department}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={employee.jobTitle}
                readOnly={!isEditing}
                className={!isEditing ? 'readonly' : ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

