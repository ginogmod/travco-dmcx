import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHR } from '../../context/HRContext';
import { Link } from 'react-router-dom';
import PayrollHistory from '../../components/PayrollHistory';
import LeaveHistory from '../../components/LeaveHistory';
import LeaveRequestForm from '../../components/LeaveRequestForm';
import './HR.css';

const EmployeePortal = () => {
  const { user } = useAuth();
  const { 
    activeWarnings, 
    acknowledgeWarning, 
    fetchUserWarnings, 
    fetchUserLeaves, 
    fetchUserPayroll 
  } = useHR();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [employeeData, setEmployeeData] = useState(null);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState([]);

  // Fallback employee data in case of API failure
  const fallbackEmployeeData = {
    firstName: user?.name?.split(' ')[0] || 'Employee',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    employeeId: 'EMP' + Math.floor(Math.random() * 1000),
    department: user?.department || 'Department',
    position: user?.role || 'Employee',
    email: `${user?.username}@travcojordan.com`,
    dateOfJoining: new Date('2022-01-01').toISOString(),
    leaveBalance: {
      annual: 21,
      sick: 14,
      familyDeath: 7
    }
  };

  // Fetch employee data and HR information when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employee data
        try {
          const response = await fetch(`/api/travco-jordan/employees/user/${user.username}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const employee = await response.json();
            setEmployeeData(employee);
          } else {
            // Use fallback data if API fails
            console.warn('Using fallback employee data');
            setEmployeeData(fallbackEmployeeData);
          }
        } catch (error) {
          console.warn('Error fetching employee data, using fallback:', error);
          setEmployeeData(fallbackEmployeeData);
        }
        
        // Fetch HR data with error handling
        try {
          await fetchUserWarnings();
        } catch (error) {
          console.warn('Error fetching warnings:', error);
        }
        
        try {
          await fetchUserLeaves();
        } catch (error) {
          console.warn('Error fetching leaves:', error);
        }
        
        try {
          await fetchUserPayroll();
        } catch (error) {
          console.warn('Error fetching payroll:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Some data could not be loaded. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, fetchUserWarnings, fetchUserLeaves, fetchUserPayroll]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle warning acknowledgment
  const handleAcknowledgeWarning = async (warningId) => {
    try {
      const result = await acknowledgeWarning(warningId);
      
      if (result) {
        setAcknowledgedWarnings(prev => [...prev, warningId]);
      }
    } catch (error) {
      console.error('Error acknowledging warning:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-container">
      <h1 className="hr-title">Employee Portal</h1>
      
      {error && (
        <div className="hr-alert hr-alert-danger">
          {error}
        </div>
      )}
      
      {/* Active Warnings */}
      {activeWarnings && activeWarnings.length > 0 && (
        <div className="mb-8">
          <h2 className="hr-subtitle">Active Warnings</h2>
          
          <div className="space-y-4">
            {activeWarnings.map(warning => (
              <div 
                key={warning._id || Math.random().toString()} 
                className={`hr-card ${
                  warning.severity === 'high' 
                    ? 'hr-warning-high' 
                    : warning.severity === 'medium' 
                      ? 'hr-warning-medium' 
                      : 'hr-warning-low'
                } ${acknowledgedWarnings.includes(warning._id) ? 'opacity-50' : ''}`}
              >
                <div className="hr-card-header">
                  <div>
                    <h3 className="hr-card-title">{warning.title}</h3>
                    <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                      Issued on: {formatDate(warning.issuedDate)}
                      {warning.expiryDate && (
                        <span> | Expires on: {formatDate(warning.expiryDate)}</span>
                      )}
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
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAcknowledgeWarning(warning._id)}
                    disabled={acknowledgedWarnings.includes(warning._id)}
                    className={`hr-button ${acknowledgedWarnings.includes(warning._id) ? 'hr-button-success' : 'hr-button-primary'}`}
                  >
                    {acknowledgedWarnings.includes(warning._id) ? 'Acknowledged' : 'Acknowledge Warning'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="hr-tabs">
        <button
          className={`hr-tab ${activeTab === 'overview' ? 'hr-tab-active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`hr-tab ${activeTab === 'leave' ? 'hr-tab-active' : ''}`}
          onClick={() => handleTabChange('leave')}
        >
          Leave Management
        </button>
        <button
          className={`hr-tab ${activeTab === 'payroll' ? 'hr-tab-active' : ''}`}
          onClick={() => handleTabChange('payroll')}
        >
          Payroll
        </button>
        <button
          className={`hr-tab ${activeTab === 'request' ? 'hr-tab-active' : ''}`}
          onClick={() => handleTabChange('request')}
        >
          Request Leave
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && employeeData && (
        <div className="hr-grid">
          {/* Employee Information */}
          <div>
            <div className="hr-card">
              <div className="hr-profile-header">
                <div className="hr-profile-avatar">
                  {employeeData.firstName?.charAt(0) || 'E'}
                </div>
                <div className="hr-profile-info">
                  <h2 className="hr-profile-name">{employeeData.firstName} {employeeData.lastName}</h2>
                  <p className="hr-profile-position">{employeeData.position}</p>
                  <div className="hr-profile-details">
                    <div className="hr-profile-detail">
                      <span className="hr-profile-detail-icon">📧</span>
                      {employeeData.email}
                    </div>
                    <div className="hr-profile-detail">
                      <span className="hr-profile-detail-icon">🏢</span>
                      {employeeData.department}
                    </div>
                    <div className="hr-profile-detail">
                      <span className="hr-profile-detail-icon">🆔</span>
                      {employeeData.employeeId}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hr-subtitle">Employee Information</div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Name</p>
                  <p className="font-medium">{employeeData.firstName} {employeeData.lastName}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Employee ID</p>
                  <p className="font-medium">{employeeData.employeeId}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Department</p>
                  <p className="font-medium">{employeeData.department}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Position</p>
                  <p className="font-medium">{employeeData.position}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Email</p>
                  <p className="font-medium">{employeeData.email}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Date of Joining</p>
                  <p className="font-medium">{formatDate(employeeData.dateOfJoining)}</p>
                </div>
              </div>
            </div>
            
            {/* Leave Balance */}
            <div className="hr-card">
              <h2 className="hr-subtitle">Leave Balance</h2>
              
              <div className="hr-leave-balance">
                <div className="hr-leave-balance-card">
                  <div className="hr-leave-balance-title">Annual Leave</div>
                  <div className="hr-leave-balance-value">{employeeData.leaveBalance.annual} days</div>
                  <div className="hr-progress-container">
                    <div 
                      className="hr-progress-bar hr-progress-bar-primary" 
                      style={{ width: `${(employeeData.leaveBalance.annual / 21) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="hr-leave-balance-card">
                  <div className="hr-leave-balance-title">Sick Leave</div>
                  <div className="hr-leave-balance-value">{employeeData.leaveBalance.sick} days</div>
                  <div className="hr-progress-container">
                    <div 
                      className="hr-progress-bar hr-progress-bar-success" 
                      style={{ width: `${(employeeData.leaveBalance.sick / 14) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="hr-leave-balance-card">
                  <div className="hr-leave-balance-title">Family Death Leave</div>
                  <div className="hr-leave-balance-value">{employeeData.leaveBalance.familyDeath} days</div>
                  <div className="hr-progress-container">
                    <div 
                      className="hr-progress-bar hr-progress-bar-warning" 
                      style={{ width: `${(employeeData.leaveBalance.familyDeath / 7) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions and Announcements */}
          <div>
            <div className="hr-card">
              <h2 className="hr-subtitle">Quick Actions</h2>
              
              <div className="hr-grid">
                <button 
                  onClick={() => handleTabChange('request')}
                  className="hr-card"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-blue-500 text-white p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Request Leave</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Submit a new leave request</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleTabChange('leave')}
                  className="hr-card"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-green-500 text-white p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">View Leave History</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Check your leave requests</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleTabChange('payroll')}
                  className="hr-card"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-purple-500 text-white p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">View Payroll</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Check your salary details</p>
                    </div>
                  </div>
                </button>
                
                <Link
                  to="/travco-jordan/warning-history"
                  className="hr-card"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-yellow-500 text-white p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Warning History</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>View your warning records</p>
                    </div>
                  </div>
                </Link>
                
                <a
                  href="mailto:hr@travcojordan.com"
                  className="hr-card"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-red-500 text-white p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Contact HR</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Send an email to HR department</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            
            {/* HR Announcements */}
            <div className="hr-card">
              <h2 className="hr-subtitle">HR Announcements</h2>
              
              <div className="space-y-4">
                <div className="hr-alert hr-alert-info">
                  <h3 className="font-medium mb-2">New Leave Policy</h3>
                  <p className="text-sm">
                    The company has updated its leave policy. Annual leave requests must now be submitted at least 7 days in advance.
                  </p>
                  <p className="text-xs mt-2" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                    Posted on: {formatDate(new Date())}
                  </p>
                </div>
                
                <div className="hr-alert hr-alert-success">
                  <h3 className="font-medium mb-2">Payroll Processing Date Change</h3>
                  <p className="text-sm">
                    Starting next month, payroll will be processed on the 20th of each month instead of the 25th.
                  </p>
                  <p className="text-xs mt-2" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                    Posted on: {formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}
                  </p>
                </div>
                
                <div className="hr-alert hr-alert-warning">
                  <h3 className="font-medium mb-2">Employee Satisfaction Survey</h3>
                  <p className="text-sm">
                    Please complete the employee satisfaction survey by the end of the month. Your feedback is important to us.
                  </p>
                  <p className="text-xs mt-2" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                    Posted on: {formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave Management Tab */}
      {activeTab === 'leave' && (
        <LeaveHistory />
      )}
      
      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <PayrollHistory />
      )}
      
      {/* Request Leave Tab */}
      {activeTab === 'request' && (
        <LeaveRequestForm onRequestSubmitted={() => handleTabChange('leave')} />
      )}
    </div>
  );
};

export default EmployeePortal;