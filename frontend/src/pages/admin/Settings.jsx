import { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'Dayflow Inc.',
    companyEmail: 'hr@dayflow.com',
    timezone: 'UTC-5 (Eastern Time)',
    workHours: '8',
    lateThreshold: '15',
    halfDayHours: '4',
    annualPaidLeave: '20',
    sickLeave: '12',
    emailNotifications: true,
    leaveRequestAlerts: true,
    attendanceReminders: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your organization's HR system settings</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-icon">🏢</div>
          <h3>Organization</h3>
          <p className="card-description">Configure your company details</p>
          <div className="settings-form">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-icon">🕐</div>
          <h3>Attendance</h3>
          <p className="card-description">Configure attendance tracking rules</p>
          <div className="settings-form">
            <div className="form-group">
              <label>Work Hours</label>
              <input
                type="number"
                value={settings.workHours}
                onChange={(e) => handleChange('workHours', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Late Threshold</label>
              <input
                type="number"
                value={settings.lateThreshold}
                onChange={(e) => handleChange('lateThreshold', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Half-Day Hours</label>
              <input
                type="number"
                value={settings.halfDayHours}
                onChange={(e) => handleChange('halfDayHours', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-icon">📅</div>
          <h3>Leave Policies</h3>
          <p className="card-description">Configure leave allocation and rules</p>
          <div className="settings-form">
            <div className="form-group">
              <label>Annual Paid Leave</label>
              <input
                type="number"
                value={settings.annualPaidLeave}
                onChange={(e) => handleChange('annualPaidLeave', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Sick Leave</label>
              <input
                type="number"
                value={settings.sickLeave}
                onChange={(e) => handleChange('sickLeave', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-icon">🔔</div>
          <h3>Notifications</h3>
          <p className="card-description">Configure system notifications</p>
          <div className="settings-form">
            <div className="toggle-group">
              <div className="toggle-item">
                <div>
                  <label>Email Notifications</label>
                  <p className="toggle-description">Send email for important events</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <div>
                  <label>Leave Request Alerts</label>
                  <p className="toggle-description">Notify when leave is requested</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.leaveRequestAlerts}
                    onChange={() => handleToggle('leaveRequestAlerts')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-item">
                <div>
                  <label>Attendance Reminders</label>
                  <p className="toggle-description">Daily check-in/out reminders</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.attendanceReminders}
                    onChange={() => handleToggle('attendanceReminders')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-icon">🛡️</div>
          <h3>Security & Data</h3>
          <p className="card-description">Manage security settings and data</p>
          <div className="settings-form">
            <div className="toggle-item">
              <div>
                <label>Two-Factor Authentication</label>
                <p className="toggle-description">Require 2FA for all users</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="form-group">
              <label>Session Timeout</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              />
            </div>
            <div className="database-status">
              <div className="status-info">
                <span className="status-icon">🗄️</span>
                <div>
                  <label>Database Status</label>
                  <p>PostgreSQL • Connected</p>
                </div>
              </div>
              <div className="status-actions">
                <button className="action-button">Backup Now</button>
                <button className="action-button">View Logs</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave}>
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;

