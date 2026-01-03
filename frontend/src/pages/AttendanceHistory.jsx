import { useEffect, useState } from 'react';
import { attendanceAPI } from '../api/api';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await attendanceAPI.getHistory(30);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDayAbbr = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '0h 0m';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="history-loading">Loading...</div>;
  }

  return (
    <div className="attendance-history-page">
      <div className="history-header">
        <div>
          <h1>Recent Attendance History</h1>
          <p>View your attendance records</p>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-dot present"></span>
          <span>Present</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot half-day"></span>
          <span>Half Day</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot absent"></span>
          <span>Absent</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot weekend"></span>
          <span>Weekend</span>
        </div>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="no-records">No attendance records found</div>
        ) : (
          history.map((record) => {
            const date = new Date(record.date);
            const dayNumber = date.getDate();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div key={record.id} className="history-item">
                <div className="history-date-section">
                  <div className="day-number">{dayNumber}</div>
                  <div className="date-info">
                    <div className="full-date">{formatDate(record.date)}</div>
                    <div className="day-abbr">{getDayAbbr(record.date)}</div>
                  </div>
                </div>
                <div className="history-details">
                  <div className="time-info">
                    Check-in: {formatTime(record.checkIn)} • Check-out: {formatTime(record.checkOut)}
                  </div>
                </div>
                <div className="history-status">
                  <span className={`status-badge ${record.status?.toLowerCase().replace('_', '-') || 'present'}`}>
                    {record.status || 'Present'}
                  </span>
                  <span className="hours-worked">
                    {calculateHours(record.checkIn, record.checkOut)} worked
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;

