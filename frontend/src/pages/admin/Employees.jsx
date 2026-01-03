import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/api';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    jobTitle: '',
    department: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const data = await adminAPI.getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createEmployee(formData);
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        jobTitle: '',
        department: '',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create employee');
    }
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="employees-loading">Loading...</div>;
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>Manage your organization's workforce</p>
        </div>
        <button className="add-employee-btn" onClick={() => setShowAddModal(true)}>
          + Add Employee
        </button>
      </div>

      <div className="employee-directory-card">
        <div className="directory-header">
          <h2>Employee Directory</h2>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="employees-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Contact</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No employees found</td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {getInitials(employee.fullName)}
                        </div>
                        <div>
                          <div className="employee-name">{employee.fullName}</div>
                          <div className="employee-email">{employee.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="department-badge">
                        🏢 {employee.department}
                      </span>
                    </td>
                    <td>{employee.jobTitle}</td>
                    <td>
                      <div className="contact-info">
                        <div>✉️ {employee.user?.email || 'N/A'}</div>
                        {employee.phone && <div>📞 {employee.phone}</div>}
                      </div>
                    </td>
                    <td>{formatDate(employee.joinDate)}</td>
                    <td>
                      <button className="action-btn">⋯</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

