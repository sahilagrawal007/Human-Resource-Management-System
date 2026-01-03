import { useState, useEffect } from 'react';
import { authAPI } from '../api/api';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('EMPLOYEE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test', password: 'test' }),
        });
        setBackendStatus('connected');
      } catch (err) {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      if (isSignUp) {
        // Sign up
        if (!fullName || !jobTitle || !department) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        response = await authAPI.register(email, password, fullName, phone, jobTitle, department);
      } else {
        // Login
        response = await authAPI.login(email, password);
        
        // Check if user role matches selected role
        if (response.role !== role) {
          setError(`Please select ${response.role === 'ADMIN' ? 'Admin' : 'Employee'} role`);
          setLoading(false);
          return;
        }
      }

      // Store token
      if (rememberMe) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('role', response.role);
      }

      // Redirect based on role
      if (response.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/employee/dashboard';
      }
    } catch (err) {
      console.error('Auth error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Check if backend is not running
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        setError('❌ Cannot connect to server. Please make sure the backend is running on http://localhost:3001. Check Terminal 1 for backend server.');
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else if (err.response?.status === 500) {
        setError('❌ Server error. Check backend terminal for details. Make sure database is connected.');
      } else if (err.response?.status === 400) {
        setError(`❌ ${err.response?.data?.message || 'Invalid request. Please check all fields.'}`);
      } else {
        setError(isSignUp ? '❌ Registration failed. Please check all fields and try again.' : '❌ Invalid credentials. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Section - Promotional */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">Dayflow</span>
          </div>
          
          <h1 className="login-headline">
            Streamline Your <span className="highlight">Workforce Management</span>
          </h1>
          
          <p className="login-description">
            Dayflow simplifies HR operations with powerful tools for attendance tracking, leave management, and employee engagement.
          </p>
          
          <div className="features">
            <div className="feature-box">
              <div className="feature-icon green">✓</div>
              <div className="feature-content">
                <h3>Real-time Attendance</h3>
                <p>Track check-ins and check-outs instantly.</p>
              </div>
            </div>
            
            <div className="feature-box">
              <div className="feature-icon yellow">📅</div>
              <div className="feature-content">
                <h3>Smart Leave Management</h3>
                <p>Effortless request and approval workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome back'}</h2>
            <p>{isSignUp ? 'Sign up to get started' : 'Enter your credentials to access your dashboard.'}</p>
          </div>

          {/* Role Selection - Only show for login */}
          {!isSignUp && (
            <div className="role-selection">
              <button
                type="button"
                className={`role-btn ${role === 'EMPLOYEE' ? 'active' : ''}`}
                onClick={() => setRole('EMPLOYEE')}
              >
                <span className="role-icon">👥</span>
                <div className="role-info">
                  <span className="role-name">Employee</span>
                  <span className="role-label">Staff member</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRole('ADMIN')}
              >
                <span className="role-icon">🛡️</span>
                <div className="role-info">
                  <span className="role-name">Admin</span>
                  <span className="role-label">HR / Manager</span>
                </div>
              </button>
            </div>
          )}

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {backendStatus === 'disconnected' && (
              <div className="backend-warning">
                ⚠️ Backend server is not running. Please start the backend server on port 3001.
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    placeholder="Software Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    placeholder="Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {!isSignUp && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); }}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="signup-link">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); setError(''); }}>
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); setError(''); }}>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

