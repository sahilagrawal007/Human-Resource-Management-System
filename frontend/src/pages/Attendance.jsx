import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI } from '../api/api';
import './Attendance.css';

const Attendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, halfDay: 0, absent: 0 });

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    try {
      const [todayData, calendarData] = await Promise.all([
        attendanceAPI.getToday(),
        attendanceAPI.getCalendar(currentMonth, currentYear),
      ]);
      setTodayAttendance(todayData);
      setCalendarData(calendarData);
      
      // Calculate stats
      const present = calendarData.filter(a => a.status === 'PRESENT').length;
      const halfDay = calendarData.filter(a => a.status === 'HALF_DAY').length;
      const absent = calendarData.filter(a => a.status === 'ABSENT').length;
      setStats({ present, halfDay, absent });
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

  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const attendance = calendarData.find(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      );
      days.push({ day, date, attendance });
    }

    return days;
  };

  const getDayStatus = (dayData) => {
    if (!dayData || !dayData.attendance) return null;
    return dayData.attendance.status;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return <div className="attendance-loading">Loading...</div>;
  }

  const calendarDays = getCalendarDays();

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>My Attendance</h1>
          <p>Track your daily attendance and work hours</p>
        </div>
        <Link to="/employee/attendance/history" className="view-history-btn">
          View History →
        </Link>
      </div>

      <div className="attendance-grid">
        <div className="attendance-today-card">
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
              ← Check Out
            </button>
          </div>
        </div>

        <div className="calendar-card">
          <div className="card-header">
            <h3>{monthNames[currentMonth - 1]} {currentYear}</h3>
            <span className="header-icon">📅</span>
          </div>
          
          <div className="attendance-summary">
            <div className="summary-item present">
              <span className="summary-dot"></span>
              <span>Present: {stats.present}</span>
            </div>
            <div className="summary-item half-day">
              <span className="summary-dot"></span>
              <span>Half Day: {stats.halfDay}</span>
            </div>
            <div className="summary-item absent">
              <span className="summary-dot"></span>
              <span>Absent: {stats.absent}</span>
            </div>
          </div>

          <div className="calendar">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((dayData, index) => {
                if (dayData === null) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                }
                
                const status = getDayStatus(dayData);
                const isWeekend = dayData.date.getDay() === 0 || dayData.date.getDay() === 6;
                const isToday = dayData.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dayData.day}
                    className={`calendar-day ${status ? status.toLowerCase().replace('_', '-') : ''} ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}
                  >
                    <span className="day-number">{dayData.day}</span>
                    {status === 'PRESENT' && <span className="status-icon">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

