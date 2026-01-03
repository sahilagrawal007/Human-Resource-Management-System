import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/api';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ present: 0, halfDay: 0, absent: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [dailyData, weeklyData] = await Promise.all([
        adminAPI.getDailyAttendance(selectedDate),
        adminAPI.getWeeklyAttendance(),
      ]);
      setAttendance(dailyData.attendance || []);
      setSummary(dailyData.summary || { present: 0, halfDay: 0, absent: 0 });
      setWeeklyData(weeklyData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const maxPresent = Math.max(...weeklyData.map(d => d.present), 60);

  if (loading) {
    return <div className="attendance-management-loading">Loading...</div>;
  }

  return (
    <div className="attendance-management-page">
      <div className="attendance-management-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Monitor and manage employee attendance</p>
        </div>
        <button className="export-btn">📥 Export Report</button>
      </div>

      <div className="attendance-summary-cards">
        <div className="summary-card present">
          <div className="summary-icon">✓</div>
          <div className="summary-value">{summary.present}</div>
        </div>
        <div className="summary-card half-day">
          <div className="summary-icon">🕐</div>
          <div className="summary-value">{summary.halfDay}</div>
        </div>
        <div className="summary-card absent">
          <div className="summary-icon">✗</div>
          <div className="summary-value">{summary.absent}</div>
        </div>
      </div>

      <div className="weekly-chart-card">
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

      <div className="daily-attendance-card">
        <div className="card-header">
          <div>
            <h2>📅 Daily Attendance - {formatDate(selectedDate)}</h2>
          </div>
          <div className="filters">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search employee..." className="search-input" />
            </div>
            <select className="status-filter">
              <option>All Status</option>
              <option>Present</option>
              <option>Half Day</option>
              <option>Absent</option>
            </select>
          </div>
        </div>

        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Worked</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No attendance records for this date</td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {getInitials(record.employee?.fullName || 'N/A')}
                        </div>
                        <div>
                          <div className="employee-name">{record.employee?.fullName || 'N/A'}</div>
                          <div className="employee-email">{record.employee?.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="department-badge">{record.employee?.department || 'N/A'}</span>
                    </td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{calculateHours(record.checkIn, record.checkOut)}</td>
                    <td>
                      <span className={`status-badge ${record.status?.toLowerCase().replace('_', '-') || 'present'}`}>
                        {record.status === 'PRESENT' && '✓ '}
                        {record.status === 'HALF_DAY' && '🕐 '}
                        {record.status === 'ABSENT' && '✗ '}
                        {record.status?.toLowerCase().replace('_', ' ') || 'present'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;

