import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useHR } from '../../context/HRContext';
import { useNavigate } from 'react-router-dom';
import EmployeeMessaging from '../../components/EmployeeMessaging';
import MessageNotifications from '../../components/MessageNotifications';
import LeaveHistory from '../../components/LeaveHistory';
import PayrollHistory from '../../components/PayrollHistory';
import employees from '../../data/employeesData';

const Employees = () => {
  const { user } = useAuth();
  // Using dark theme as default since we removed theme toggle
  const theme = 'dark';
  const navigate = useNavigate();
  const { getUnreadMessages } = useMessages();
  const [employeesList, setEmployeesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    id: 0,
    name: '',
    department: '',
    username: '',
    password: '123456',
    role: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoEmployee, setInfoEmployee] = useState(null);

  // Get unique departments for filter dropdown
  const departments = ['All', ...new Set(employees.map(emp => emp.department))].sort();

  // Group employees by department
  const getGroupedEmployees = () => {
    let filtered = [...employeesList];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Group by department
    const grouped = {};
    filtered.forEach(emp => {
      if (!grouped[emp.department]) {
        grouped[emp.department] = [];
      }
      grouped[emp.department].push(emp);
    });
    
    // Sort departments - General Manager first, then alphabetically
    return Object.keys(grouped)
      .filter(dept => departmentFilter === 'All' || dept === departmentFilter)
      .sort((a, b) => {
        if (a === 'G.M') return -1;
        if (b === 'G.M') return 1;
        return a.localeCompare(b);
      })
      .map(dept => ({
        name: dept,
        employees: grouped[dept].sort((a, b) => {
          // General Manager first, then Department heads, then by ID
          if (a.role === 'General Manager' && b.role !== 'General Manager') {
            return -1;
          }
          if (b.role === 'General Manager' && a.role !== 'General Manager') {
            return 1;
          }
          if (a.role === 'Department Head' && b.role !== 'Department Head' && b.role !== 'General Manager') {
            return -1;
          }
          if (b.role === 'Department Head' && a.role !== 'Department Head' && a.role !== 'General Manager') {
            return 1;
          }
          return a.id - b.id;
        })
      }));
  };

  useEffect(() => {
    // Check if there's saved data in localStorage
    const savedEmployees = localStorage.getItem('travcoEmployees');
    
    if (savedEmployees) {
      // Use saved data if available
      const parsedEmployees = JSON.parse(savedEmployees);
      setEmployeesList(parsedEmployees);
      
      // Initialize all departments as expanded based on saved data
      const deptState = {};
      new Set(parsedEmployees.map(emp => emp.department)).forEach(dept => {
        deptState[dept] = true;
      });
      setExpandedDepartments(deptState);
    } else {
      // Use default data if no saved data
      setEmployeesList(employees);
      
      // Initialize all departments as expanded based on default data
      const deptState = {};
      new Set(employees.map(emp => emp.department)).forEach(dept => {
        deptState[dept] = true;
      });
      setExpandedDepartments(deptState);
    }
  }, []);

  const toggleDepartmentExpand = (dept) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee({ ...employee });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = () => {
    const updatedEmployees = employeesList.map(emp =>
      emp.id === editingEmployee.id ? editingEmployee : emp
    );
    
    // Update state
    setEmployeesList(updatedEmployees);
    
    // Save to localStorage
    localStorage.setItem('travcoEmployees', JSON.stringify(updatedEmployees));
    
    setEditingEmployee(null);
  };

  const handleEditCancel = () => {
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employeesList.filter(emp => emp.id !== id);
      
      // Update state
      setEmployeesList(updatedEmployees);
      
      // Save to localStorage
      localStorage.setItem('travcoEmployees', JSON.stringify(updatedEmployees));
    }
  };

  const handleAddEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    const nextId = Math.max(...employeesList.map(emp => emp.id)) + 1;
    const employeeToAdd = {
      ...newEmployee,
      id: nextId
    };
    
    const updatedEmployees = [...employeesList, employeeToAdd];
    
    // Update state
    setEmployeesList(updatedEmployees);
    
    // Save to localStorage
    localStorage.setItem('travcoEmployees', JSON.stringify(updatedEmployees));
    setNewEmployee({
      id: 0,
      name: '',
      department: '',
      username: '',
      password: '123456',
      role: ''
    });
    setShowAddForm(false);
  };

  // Styles
  const containerStyle = {
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f8f8',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    color: theme === 'dark' ? '#fff' : '#333'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold'
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333'
  };

  const selectStyle = {
    ...inputStyle,
    minWidth: '150px'
  };

  const departmentContainerStyle = {
    marginBottom: '30px',
    backgroundColor: theme === 'dark' ? '#222' : '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: theme === 'dark' ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const departmentHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    cursor: 'pointer'
  };

  const departmentNameStyle = {
    fontSize: '20px',
    fontWeight: 'bold'
  };

  const departmentCountStyle = {
    backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
    color: theme === 'dark' ? '#fff' : '#333',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '14px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px 15px',
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f8f8',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const tdStyle = {
    padding: '10px 15px',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const departmentHeadRowStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'
  };

  const generalManagerRowStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)'
  };

  const buttonStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '5px',
    fontWeight: 'bold'
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f44336',
    color: 'white'
  };
  
  const messageButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    color: 'white'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#607D8B',
    color: 'white'
  };

  const addButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px'
  };

  const formStyle = {
    marginTop: '20px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9',
    borderRadius: '8px',
    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const chevronStyle = {
    fontSize: '20px',
    transition: 'transform 0.3s ease'
  };

  // Check if user has permission to edit/delete or add employees
  const canEdit = user.role === 'HR Administrator' ||
                 user.role === 'General Manager' ||
                 user.role === 'Administrator' ||
                 user.role === 'Department Head';
                 
  // Check if user has permission to view employee info
  const canViewEmployeeInfo = user.role === 'HR Administrator' ||
                             user.role === 'General Manager' ||
                             user.role === 'Administrator' ||
                             user.department === 'HR';

  const handleMessageClick = (employee) => {
    // Store the employee in localStorage to select them in the Messages page
    localStorage.setItem('selectedMessageEmployee', JSON.stringify(employee));
    navigate('/messages');
  };

  const handleCloseMessaging = () => {
    setShowMessaging(false);
    setSelectedEmployee(null);
  };
  
  const handleInfoClick = (employee) => {
    setInfoEmployee(employee);
    setShowInfoModal(true);
  };
  
  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    setInfoEmployee(null);
  };

  return (
    <div style={containerStyle}>
      <MessageNotifications />
      {showMessaging && selectedEmployee && (
        <EmployeeMessaging
          employee={selectedEmployee}
          onClose={handleCloseMessaging}
        />
      )}
      {showInfoModal && infoEmployee && (
        <EmployeeInfoModal
          employee={infoEmployee}
          onClose={handleCloseInfoModal}
          canEdit={canEdit}
        />
      )}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Travco Jordan - Employees</h1>
        {canEdit && (
          <button 
            style={addButtonStyle} 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Employee'}
          </button>
        )}
      </div>

      {showAddForm && canEdit && (
        <form style={formStyle} onSubmit={handleAddEmployeeSubmit}>
          <h2>Add New Employee</h2>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="name">Full Name</label>
            <input
              style={inputStyle}
              type="text"
              id="name"
              name="name"
              value={newEmployee.name}
              onChange={handleAddEmployeeChange}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="department">Department</label>
            <select
              style={selectStyle}
              id="department"
              name="department"
              value={newEmployee.department}
              onChange={handleAddEmployeeChange}
              required
            >
              <option value="">Select Department</option>
              {departments.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="username">Username</label>
            <input
              style={inputStyle}
              type="text"
              id="username"
              name="username"
              value={newEmployee.username}
              onChange={handleAddEmployeeChange}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="role">Role</label>
            <select
              style={selectStyle}
              id="role"
              name="role"
              value={newEmployee.role}
              onChange={handleAddEmployeeChange}
              required
            >
              <option value="">Select Role</option>
              <option value="General Manager">General Manager</option>
              <option value="Department Head">Department Head</option>
              <option value="Administrator">Administrator</option>
              <option value="HR Administrator">HR Administrator</option>
              <option value="Reservations Agent">Reservations Agent</option>
              <option value="Finance Agent">Finance Agent</option>
              <option value="Operations Agent">Operations Agent</option>
              <option value="Sales & Marketing Manager">Sales & Marketing Manager</option>
              <option value="Sales & Marketing Agent">Sales & Marketing Agent</option>
              <option value="CRM Agent">CRM Agent</option>
              <option value="Data Entry Agent">Data Entry Agent</option>
              <option value="Driver">Driver</option>
            </select>
          </div>
          <button style={saveButtonStyle} type="submit">Add Employee</button>
        </form>
      )}

      <div style={filterContainerStyle}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          style={selectStyle}
          value={departmentFilter}
          onChange={handleDepartmentFilterChange}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {getGroupedEmployees().map(dept => (
        <div key={dept.name} style={departmentContainerStyle}>
          <div
            style={departmentHeaderStyle}
            onClick={() => toggleDepartmentExpand(dept.name)}
          >
            <div style={departmentNameStyle}>{dept.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={departmentCountStyle}>{dept.employees.length} employees</span>
              <span style={chevronStyle}>
                {expandedDepartments[dept.name] ? '▼' : '▶'}
              </span>
            </div>
          </div>
          
          {expandedDepartments[dept.name] && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Role</th>
                  {canEdit && <th style={thStyle}>Actions</th>}
                  <th style={thStyle}>Message</th>
                  {canViewEmployeeInfo && <th style={thStyle}>Info</th>}
                </tr>
              </thead>
              <tbody>
                {dept.employees.map(employee => (
                  <tr
                    key={employee.id}
                    style={
                      employee.role === 'General Manager'
                        ? generalManagerRowStyle
                        : employee.role === 'Department Head'
                          ? departmentHeadRowStyle
                          : {}
                    }
                  >
                    {editingEmployee && editingEmployee.id === employee.id ? (
                      // Edit mode
                      <>
                        <td style={tdStyle}>{employee.id}</td>
                        <td style={tdStyle}>
                          <input
                            style={inputStyle}
                            type="text"
                            name="name"
                            value={editingEmployee.name}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            style={inputStyle}
                            type="text"
                            name="username"
                            value={editingEmployee.username}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td style={tdStyle}>
                          <select
                            style={selectStyle}
                            name="role"
                            value={editingEmployee.role}
                            onChange={handleEditChange}
                          >
                            <option value="General Manager">General Manager</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Administrator">Administrator</option>
                            <option value="HR Administrator">HR Administrator</option>
                            <option value="Reservations Agent">Reservations Agent</option>
                            <option value="Finance Agent">Finance Agent</option>
                            <option value="Operations Agent">Operations Agent</option>
                            <option value="Sales & Marketing Manager">Sales & Marketing Manager</option>
                            <option value="Sales & Marketing Agent">Sales & Marketing Agent</option>
                            <option value="CRM Agent">CRM Agent</option>
                            <option value="Data Entry Agent">Data Entry Agent</option>
                            <option value="Driver">Driver</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <button style={saveButtonStyle} onClick={handleEditSave}>Save</button>
                          <button style={cancelButtonStyle} onClick={handleEditCancel}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td style={tdStyle}>{employee.id}</td>
                        <td style={tdStyle}>{employee.name}</td>
                        <td style={tdStyle}>{employee.username}</td>
                        <td style={tdStyle}>{employee.role}</td>
                        {canEdit && (
                          <td style={tdStyle}>
                            <button style={editButtonStyle} onClick={() => handleEditClick(employee)}>Edit</button>
                            <button style={deleteButtonStyle} onClick={() => handleDeleteEmployee(employee.id)}>Delete</button>
                          </td>
                        )}
                        {user.username !== employee.username && (
                          <>
                            <td style={tdStyle}>
                              <button
                                style={messageButtonStyle}
                                onClick={() => handleMessageClick(employee)}
                              >
                                Message
                              </button>
                            </td>
                            {canViewEmployeeInfo && (
                              <td style={tdStyle}>
                                <button
                                  style={{
                                    ...buttonStyle,
                                    backgroundColor: '#9c27b0',
                                    color: 'white'
                                  }}
                                  onClick={() => handleInfoClick(employee)}
                                >
                                  Info
                                </button>
                              </td>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

// Employee Info Modal Component
const EmployeeInfoModal = ({ employee, onClose, canEdit }) => {
  const { user } = useAuth();
  const { fetchUserWarnings, fetchUserLeaves, fetchUserPayroll } = useHR();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  
  // Check if user has permission to view sensitive information
  const canViewSensitiveInfo = user.role === 'HR Administrator' ||
                              user.role === 'General Manager' ||
                              user.role === 'Administrator' ||
                              user.department === 'HR';
                              
  // Log for testing purposes
  console.log('User role:', user.role);
  console.log('User department:', user.department);
  console.log('Can view sensitive info:', canViewSensitiveInfo);
  
  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API calls to fetch employee data
        // In a real implementation, these would be API calls to fetch data for the specific employee
        setTimeout(() => {
          // Mock data for warnings
          setWarnings([
            {
              _id: 'w1',
              title: 'Late Arrival',
              description: 'Employee was late to work 3 times this month',
              severity: 'medium',
              issuedDate: new Date(2025, 6, 15),
              acknowledged: true,
              acknowledgedDate: new Date(2025, 6, 16)
            },
            {
              _id: 'w2',
              title: 'Missed Deadline',
              description: 'Employee missed project deadline',
              severity: 'high',
              issuedDate: new Date(2025, 5, 10),
              acknowledged: true,
              acknowledgedDate: new Date(2025, 5, 11)
            }
          ]);
          
          // Mock data for leaves
          setLeaves([
            {
              _id: 'l1',
              leaveType: 'annual',
              startDate: new Date(2025, 7, 1),
              endDate: new Date(2025, 7, 7),
              status: 'approved_by_hr',
              createdAt: new Date(2025, 6, 15)
            },
            {
              _id: 'l2',
              leaveType: 'sick',
              startDate: new Date(2025, 5, 10),
              endDate: new Date(2025, 5, 12),
              status: 'completed',
              createdAt: new Date(2025, 5, 9)
            }
          ]);
          
          // Mock data for payrolls
          setPayrolls([
            {
              _id: 'p1',
              month: 7,
              year: 2025,
              payrollType: 'main',
              baseSalary: 1500,
              totalAdditions: 200,
              totalDeductions: 100,
              netSalary: 1600,
              paymentStatus: 'paid',
              paymentDate: new Date(2025, 7, 5),
              additions: [
                { type: 'bonus', amount: 100, description: 'Performance bonus' },
                { type: 'allowance', amount: 100, description: 'Transportation allowance' }
              ],
              deductions: [
                { type: 'tax', amount: 50, description: 'Income tax' },
                { type: 'insurance', amount: 50, description: 'Health insurance' }
              ]
            },
            {
              _id: 'p2',
              month: 6,
              year: 2025,
              payrollType: 'main',
              baseSalary: 1500,
              totalAdditions: 150,
              totalDeductions: 100,
              netSalary: 1550,
              paymentStatus: 'paid',
              paymentDate: new Date(2025, 6, 5)
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setError('Failed to fetch employee data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [employee]);
  
  // Modal styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };
  
  const modalContentStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto'
  };
  
  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e0e0e0'
  };
  
  const modalBodyStyle = {
    padding: '1.5rem'
  };
  
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d'
  };
  
  const handleTabChange = (tab) => {
    // Only allow changing to sensitive tabs if user has permission
    if (tab !== 'overview' && !canViewSensitiveInfo) {
      setError('You do not have permission to view this information. Please contact HR or an administrator.');
      return;
    }
    
    setActiveTab(tab);
    setError(null); // Clear any previous errors
  };
  
  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 className="hr-title" style={{ margin: 0 }}>Employee Information: {employee.name}</h2>
          <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        </div>
        
        <div style={modalBodyStyle}>
          {/* Tabs */}
          <div className="hr-tabs">
            <button
              className={`hr-tab ${activeTab === 'overview' ? 'hr-tab-active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            
            {/* Only show sensitive tabs if user has permission */}
            {canViewSensitiveInfo && (
              <>
                <button
                  className={`hr-tab ${activeTab === 'warnings' ? 'hr-tab-active' : ''}`}
                  onClick={() => handleTabChange('warnings')}
                >
                  Warning History
                </button>
                <button
                  className={`hr-tab ${activeTab === 'leaves' ? 'hr-tab-active' : ''}`}
                  onClick={() => handleTabChange('leaves')}
                >
                  Leave Records
                </button>
                <button
                  className={`hr-tab ${activeTab === 'payroll' ? 'hr-tab-active' : ''}`}
                  onClick={() => handleTabChange('payroll')}
                >
                  Payroll Information
                </button>
              </>
            )}
          </div>
          
          {/* Tab Content */}
          {loading ? (
            <div className="hr-loading">
              <div className="hr-spinner"></div>
            </div>
          ) : error ? (
            <div className="hr-alert hr-alert-danger">
              {error}
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="hr-card">
                  <div className="hr-profile-header">
                    <div className="hr-profile-avatar">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="hr-profile-info">
                      <h2 className="hr-profile-name">{employee.name}</h2>
                      <p className="hr-profile-position">{employee.role}</p>
                      <div className="hr-profile-details">
                        <div className="hr-profile-detail">
                          <span className="hr-profile-detail-icon">📧</span>
                          {employee.username}@travcojordan.com
                        </div>
                        <div className="hr-profile-detail">
                          <span className="hr-profile-detail-icon">🏢</span>
                          {employee.department}
                        </div>
                        <div className="hr-profile-detail">
                          <span className="hr-profile-detail-icon">🆔</span>
                          {employee.id}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hr-subtitle">Employee Information</div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{employee.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-medium">{employee.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{employee.role}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{employee.username}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warning History Tab */}
              {activeTab === 'warnings' && (
                <div>
                  <h2 className="hr-subtitle">Warning History</h2>
                  
                  {warnings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No warnings found for this employee.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {warnings.map(warning => (
                        <div
                          key={warning._id}
                          className={`hr-card ${
                            warning.severity === 'high'
                              ? 'hr-warning-high'
                              : warning.severity === 'medium'
                                ? 'hr-warning-medium'
                                : 'hr-warning-low'
                          }`}
                        >
                          <div className="hr-card-header">
                            <div>
                              <h3 className="hr-card-title">{warning.title}</h3>
                              <p className="text-sm text-gray-500">
                                Issued on: {formatDate(warning.issuedDate)}
                              </p>
                            </div>
                            <span className={`hr-badge ${
                              warning.severity === 'high'
                                ? 'hr-badge-danger'
                                : warning.severity === 'medium'
                                  ? 'hr-badge-warning'
                                  : 'hr-badge-info'
                            }`}>
                              {warning.severity.charAt(0).toUpperCase() + warning.severity.slice(1)} Severity
                            </span>
                          </div>
                          
                          <div className="mt-4 mb-6">
                            <p className="whitespace-pre-wrap">{warning.description}</p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`hr-badge ${warning.acknowledged ? 'hr-badge-success' : 'hr-badge-danger'}`}>
                              {warning.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}
                            </span>
                            {warning.acknowledged && (
                              <span className="text-sm text-gray-500">
                                Acknowledged on: {formatDate(warning.acknowledgedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Leave Records Tab */}
              {activeTab === 'leaves' && (
                <div>
                  <h2 className="hr-subtitle">Leave Records</h2>
                  
                  {leaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No leave records found for this employee.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto mt-6">
                      <table className="hr-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Dates</th>
                            <th>Status</th>
                            <th>Requested On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaves.map((leave) => (
                            <tr key={leave._id}>
                              <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                              <td>{calculateDuration(leave.startDate, leave.endDate)}</td>
                              <td>
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </td>
                              <td>
                                <span className="hr-badge hr-badge-primary">
                                  {getStatusLabel(leave.status)}
                                </span>
                              </td>
                              <td>{formatDate(leave.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* Payroll Information Tab */}
              {activeTab === 'payroll' && (
                <div>
                  <h2 className="hr-subtitle">Payroll Information</h2>
                  
                  {payrolls.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No payroll information found for this employee.</p>
                    </div>
                  ) : (
                    <div className="hr-grid">
                      {/* Payroll List */}
                      <div>
                        <h3 className="hr-subtitle">Payroll Entries</h3>
                        
                        <div className="space-y-4">
                          {payrolls.map((payroll) => (
                            <div
                              key={payroll._id}
                              className="hr-card cursor-pointer"
                            >
                              <div className="hr-card-header">
                                <div>
                                  <h4 className="hr-card-title">{getMonthName(payroll.month)} {payroll.year}</h4>
                                  <p className="text-sm text-gray-600">{getPayrollTypeLabel(payroll.payrollType)}</p>
                                </div>
                                <span className="hr-badge hr-badge-primary">
                                  {payroll.paymentStatus.charAt(0).toUpperCase() + payroll.paymentStatus.slice(1)}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="font-semibold">
                                  {formatCurrency(payroll.netSalary)}
                                </p>
                                {payroll.paymentDate && (
                                  <p className="text-xs text-gray-500">
                                    Paid on: {formatDate(payroll.paymentDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getLeaveTypeLabel = (type) => {
  switch (type) {
    case 'annual':
      return 'Annual Leave';
    case 'sick':
      return 'Sick Leave';
    case 'family_death_level1':
      return 'Family Death Leave (Level 1)';
    case 'family_death_level2':
      return 'Family Death Leave (Level 2)';
    case 'family_death_level3':
      return 'Family Death Leave (Level 3)';
    default:
      return type;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending Manager Approval';
    case 'approved_by_manager':
      return 'Approved by Manager';
    case 'rejected_by_manager':
      return 'Rejected by Manager';
    case 'approved_by_hr':
      return 'Approved by HR';
    case 'rejected_by_hr':
      return 'Rejected by HR';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

const getMonthName = (month) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

const getPayrollTypeLabel = (type) => {
  switch (type) {
    case 'main':
      return 'Regular Salary';
    case 'additional':
      return 'Additional Payroll';
    case 'overtime':
      return 'Overtime Payment';
    default:
      return type;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JOD'
  }).format(amount);
};

export default Employees;