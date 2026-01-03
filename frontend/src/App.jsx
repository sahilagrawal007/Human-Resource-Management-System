import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MyProfile from './pages/MyProfile';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import LeaveRequests from './pages/LeaveRequests';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <MyProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance/history"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendanceHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/leave-requests"
          element={
            <ProtectedRoute>
              <Layout>
                <LeaveRequests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
