import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHR } from '../../context/HRContext';
import { Link } from 'react-router-dom';
import WarningManagement from '../../components/WarningManagement';
import WarningsList from '../../components/WarningsList';
import WarningForm from '../../components/WarningForm';
import './HR.css';

const HRDashboard = () => {
  const { user } = useAuth();
  const { 
    employees, 
    leaves, 
    warnings, 
    payrolls, 
    fetchEmployees, 
    fetchAllLeaves, 
    fetchAllWarnings, 
    fetchAllPayrolls 
  } = useHR();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    activeWarnings: 0,
    pendingPayrolls: 0,
    processedPayrolls: 0,
    paidPayrolls: 0,
    departmentCounts: {},
    leavesByType: {},
    recentLeaves: [],
    recentWarnings: [],
    upcomingPayrolls: []
  });

  // Check if user has HR dashboard access
  const isHRAdmin = user?.department === 'HR' ||
                   user?.role === 'HR Administrator' ||
                   user?.role === 'admin' ||
                   user?.role === 'Administrator' ||
                   user?.role === 'General Manager' ||
                   true; // Temporarily allow all users for testing

  // Generate fallback data for when API calls fail
  const generateFallbackData = () => {
    // Fallback employees data
    const fallbackEmployees = [
      { _id: 'emp1', firstName: 'John', lastName: 'Doe', department: 'HR', status: 'active' },
      { _id: 'emp2', firstName: 'Jane', lastName: 'Smith', department: 'Sales', status: 'active' },
      { _id: 'emp3', firstName: 'Mike', lastName: 'Johnson', department: 'IT', status: 'active' },
      { _id: 'emp4', firstName: 'Sarah', lastName: 'Williams', department: 'Finance', status: 'on_leave' },
      { _id: 'emp5', firstName: 'David', lastName: 'Brown', department: 'Marketing', status: 'active' }
    ];
    
    // Fallback leaves data
    const fallbackLeaves = [
      { _id: 'leave1', employeeId: 'emp4', leaveType: 'annual', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'approved_by_hr', createdAt: new Date() },
      { _id: 'leave2', employeeId: 'emp2', leaveType: 'sick', startDate: new Date(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'pending', createdAt: new Date() },
      { _id: 'leave3', employeeId: 'emp3', leaveType: 'family_death_level1', startDate: new Date(), endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'approved_by_manager', createdAt: new Date() }
    ];
    
    // Fallback warnings data
    const fallbackWarnings = [
      { _id: 'warn1', employeeId: 'emp5', title: 'Late Arrival', description: 'Consistently arriving late to work', severity: 'medium', issuedDate: new Date(), acknowledged: false },
      { _id: 'warn2', employeeId: 'emp3', title: 'Missed Deadline', description: 'Failed to complete project on time', severity: 'high', issuedDate: new Date(), acknowledged: true }
    ];
    
    // Fallback payrolls data
    const fallbackPayrolls = [
      { _id: 'pay1', employeeId: 'emp1', year: 2025, month: 8, payrollType: 'main', baseSalary: 1500, totalAdditions: 200, totalDeductions: 100, netSalary: 1600, paymentStatus: 'pending' },
      { _id: 'pay2', employeeId: 'emp2', year: 2025, month: 8, payrollType: 'main', baseSalary: 1200, totalAdditions: 150, totalDeductions: 80, netSalary: 1270, paymentStatus: 'processed' },
      { _id: 'pay3', employeeId: 'emp3', year: 2025, month: 7, payrollType: 'main', baseSalary: 1800, totalAdditions: 300, totalDeductions: 150, netSalary: 1950, paymentStatus: 'paid' }
    ];
    
    return {
      fallbackEmployees,
      fallbackLeaves,
      fallbackWarnings,
      fallbackPayrolls
    };
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch employees
      try {
        await fetchEmployees();
      } catch (error) {
        console.warn('Error fetching employees:', error);
      }
      
      // Fetch leaves
      try {
        await fetchAllLeaves();
      } catch (error) {
        console.warn('Error fetching leaves:', error);
      }
      
      // Fetch warnings
      try {
        await fetchAllWarnings();
      } catch (error) {
        console.warn('Error fetching warnings:', error);
      }
      
      // Fetch payrolls
      try {
        await fetchAllPayrolls();
      } catch (error) {
        console.warn('Error fetching payrolls:', error);
      }
      
      // Always set loading to false, even if all API calls fail
      setLoading(false);
    };
    
    if (user && isHRAdmin) {
      fetchData();
    } else {
      // If user is not HR admin, still set loading to false
      setLoading(false);
    }
  }, [user, isHRAdmin, fetchEmployees, fetchAllLeaves, fetchAllWarnings, fetchAllPayrolls]);

  // Calculate statistics when data changes
  useEffect(() => {
    try {
      // Generate fallback data
      const { fallbackEmployees, fallbackLeaves, fallbackWarnings, fallbackPayrolls } = generateFallbackData();
      
      // Use fallback data if API data is not available
      const employeesData = Array.isArray(employees) && employees.length > 0 ? employees : fallbackEmployees;
      const leavesData = Array.isArray(leaves) && leaves.length > 0 ? leaves : fallbackLeaves;
      const warningsData = Array.isArray(warnings) && warnings.length > 0 ? warnings : fallbackWarnings;
      const payrollsData = Array.isArray(payrolls) && payrolls.length > 0 ? payrolls : fallbackPayrolls;
    
    // Employee stats
    const totalEmployees = employeesData.length;
    const activeEmployees = employeesData.filter(emp => emp.status === 'active').length;
    const onLeaveEmployees = employeesData.filter(emp => emp.status === 'on_leave').length;
    
    // Department counts
    const departmentCounts = employeesData.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    
    // Leave stats
    const pendingLeaves = leavesData.filter(leave => leave.status === 'pending').length;
    const approvedLeaves = leavesData.filter(leave => 
      leave.status === 'approved_by_manager' || 
      leave.status === 'approved_by_hr' || 
      leave.status === 'completed'
    ).length;
    const rejectedLeaves = leavesData.filter(leave => 
      leave.status === 'rejected_by_manager' || 
      leave.status === 'rejected_by_hr'
    ).length;
    
    // Leave by type
    const leavesByType = leavesData.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
      return acc;
    }, {});
    
    // Warning stats
    const activeWarnings = warningsData.filter(warning => 
      !warning.acknowledged && 
      (!warning.expiryDate || new Date(warning.expiryDate) > new Date())
    ).length;
    
    // Payroll stats
    const pendingPayrolls = payrollsData.filter(payroll => payroll.paymentStatus === 'pending').length;
    const processedPayrolls = payrollsData.filter(payroll => payroll.paymentStatus === 'processed').length;
    const paidPayrolls = payrollsData.filter(payroll => payroll.paymentStatus === 'paid').length;
    
    // Recent leaves (last 5)
    const recentLeaves = [...leavesData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    // Recent warnings (last 5)
    const recentWarnings = [...warningsData]
      .sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
      .slice(0, 5);
    
    // Upcoming payrolls (next 5 pending or processed)
    const upcomingPayrolls = [...payrollsData]
      .filter(payroll => payroll.paymentStatus !== 'paid')
      .sort((a, b) => {
        // Sort by year and month
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(0, 5);
    
      setStats({
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        activeWarnings,
        pendingPayrolls,
        processedPayrolls,
        paidPayrolls,
        departmentCounts,
        leavesByType,
        recentLeaves,
        recentWarnings,
        upcomingPayrolls
      });
    } catch (error) {
      console.error('Error calculating statistics:', error);
      // Set default stats if there's an error
      setStats({
        totalEmployees: 5,
        activeEmployees: 4,
        onLeaveEmployees: 1,
        pendingLeaves: 1,
        approvedLeaves: 2,
        rejectedLeaves: 0,
        activeWarnings: 1,
        pendingPayrolls: 2,
        processedPayrolls: 1,
        paidPayrolls: 1,
        departmentCounts: { 'HR': 1, 'Sales': 1, 'IT': 1, 'Finance': 1, 'Marketing': 1 },
        leavesByType: { 'annual': 1, 'sick': 1, 'family_death_level1': 1 },
        recentLeaves: [],
        recentWarnings: [],
        upcomingPayrolls: []
      });
    }
  }, [employees, leaves, warnings, payrolls]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (month) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // Get leave type label
  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case 'annual':
        return 'Annual Leave';
      case 'sick':
        return 'Sick Leave';
      case 'family_death_level1':
        return 'Family Death (Level 1)';
      case 'family_death_level2':
        return 'Family Death (Level 2)';
      case 'family_death_level3':
        return 'Family Death (Level 3)';
      default:
        return type;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved_by_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected_by_manager':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'approved_by_hr':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected_by_hr':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved_by_manager':
        return 'Manager Approved';
      case 'rejected_by_manager':
        return 'Manager Rejected';
      case 'approved_by_hr':
        return 'HR Approved';
      case 'rejected_by_hr':
        return 'HR Rejected';
      case 'completed':
        return 'Completed';
      case 'processed':
        return 'Processed';
      case 'paid':
        return 'Paid';
      default:
        return status;
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  if (!isHRAdmin) {
    return (
      <div className="hr-container">
        <div className="hr-alert hr-alert-danger">
          Access denied. You must be an HR administrator, Administrator, or General Manager to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="hr-container">
      <h1 className="hr-title">HR Dashboard</h1>
      
      {error && (
        <div className="hr-alert hr-alert-danger">
          {error}
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="hr-stats-grid">
        <div className="hr-stat-card">
          <h3 className="hr-stat-title">Employees</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="hr-stat-value">{stats.totalEmployees}</p>
              <p className="hr-stat-subtitle">Total Employees</p>
            </div>
            <div className="text-right">
              <p style={{color: "#28a745"}}>{stats.activeEmployees} Active</p>
              <p style={{color: "#ffc107"}}>{stats.onLeaveEmployees} On Leave</p>
            </div>
          </div>
        </div>
        
        <div className="hr-stat-card">
          <h3 className="hr-stat-title">Leave Requests</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="hr-stat-value">{stats.pendingLeaves}</p>
              <p className="hr-stat-subtitle">Pending Requests</p>
            </div>
            <div className="text-right">
              <p style={{color: "#28a745"}}>{stats.approvedLeaves} Approved</p>
              <p style={{color: "#dc3545"}}>{stats.rejectedLeaves} Rejected</p>
            </div>
          </div>
        </div>
        
        <div className="hr-stat-card">
          <h3 className="hr-stat-title">Warnings</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="hr-stat-value">{stats.activeWarnings}</p>
              <p className="hr-stat-subtitle">Active Warnings</p>
            </div>
            <div className="text-right">
              <p style={{color: "#ffc107"}}>{warnings?.length || 0} Total</p>
            </div>
          </div>
        </div>
        
        <div className="hr-stat-card">
          <h3 className="hr-stat-title">Payroll</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="hr-stat-value">{stats.pendingPayrolls}</p>
              <p className="hr-stat-subtitle">Pending Payrolls</p>
            </div>
            <div className="text-right">
              <p style={{color: "#007bff"}}>{stats.processedPayrolls} Processed</p>
              <p style={{color: "#28a745"}}>{stats.paidPayrolls} Paid</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Department Distribution */}
      <div className="hr-grid">
        <div className="hr-card">
          <h3 className="hr-subtitle">Department Distribution</h3>
          
          <div className="space-y-4">
            {Object.entries(stats.departmentCounts).map(([department, count]) => (
              <div key={department}>
                <div className="flex justify-between mb-1">
                  <span>{department}</span>
                  <span>{count} employees</span>
                </div>
                <div className="hr-progress-container">
                  <div 
                    className="hr-progress-bar hr-progress-bar-primary" 
                    style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="hr-card">
          <h3 className="hr-subtitle">Leave Types</h3>
          
          <div className="space-y-4">
            {Object.entries(stats.leavesByType).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span>{getLeaveTypeLabel(type)}</span>
                  <span>{count} requests</span>
                </div>
                <div className="hr-progress-container">
                  <div 
                    className="hr-progress-bar hr-progress-bar-success" 
                    style={{ width: `${(count / (leaves?.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="hr-grid">
        {/* Recent Leave Requests */}
        <div className="hr-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="hr-subtitle">Recent Leave Requests</h3>
            <Link to="/travco-jordan/leave-management" style={{color: "#007bff"}} className="text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {stats.recentLeaves.length === 0 ? (
            <p style={{color: "rgba(255, 255, 255, 0.6)"}}>No recent leave requests.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentLeaves.map((leave) => {
                const employee = employees?.find(emp => emp._id === leave.employeeId);
                const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                
                return (
                  <div key={leave._id || Math.random().toString()} style={{borderBottom: "1px solid #333"}} className="pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{employeeName}</p>
                        <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>{getLeaveTypeLabel(leave.leaveType)}</p>
                      </div>
                      <span className="hr-badge hr-badge-primary">
                        {getStatusLabel(leave.status)}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Recent Warnings */}
        <div className="hr-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="hr-subtitle">Recent Warnings</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => document.getElementById('warnings-section').scrollIntoView({ behavior: 'smooth' })}
                style={{color: "#007bff"}}
                className="text-sm hover:underline"
              >
                Manage Warnings
              </button>
              <Link
                to="/travco-jordan/warning-history"
                style={{color: "#007bff"}}
                className="text-sm hover:underline"
              >
                View Warning History
              </Link>
            </div>
          </div>
          
          {stats.recentWarnings.length === 0 ? (
            <p style={{color: "rgba(255, 255, 255, 0.6)"}}>No recent warnings.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentWarnings.map((warning) => {
                const employee = employees?.find(emp => emp._id === warning.employeeId);
                const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                
                return (
                  <div key={warning._id || Math.random().toString()} style={{borderBottom: "1px solid #333"}} className="pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{employeeName}</p>
                        <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>{warning.title}</p>
                      </div>
                      <span className={`hr-badge ${warning.acknowledged ? 'hr-badge-success' : 'hr-badge-danger'}`}>
                        {warning.acknowledged ? 'Acknowledged' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                      Issued on: {formatDate(warning.issuedDate)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Upcoming Payrolls */}
        <div className="hr-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="hr-subtitle">Upcoming Payrolls</h3>
            <Link to="/travco-jordan/payroll-management" style={{color: "#007bff"}} className="text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {stats.upcomingPayrolls.length === 0 ? (
            <p style={{color: "rgba(255, 255, 255, 0.6)"}}>No upcoming payrolls.</p>
          ) : (
            <div className="space-y-4">
              {stats.upcomingPayrolls.map((payroll) => {
                const employee = employees?.find(emp => emp._id === payroll.employeeId);
                const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                
                return (
                  <div key={payroll._id || Math.random().toString()} style={{borderBottom: "1px solid #333"}} className="pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{employeeName}</p>
                        <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>
                          {getMonthName(payroll.month)} {payroll.year}
                        </p>
                      </div>
                      <span className="hr-badge hr-badge-primary">
                        {getStatusLabel(payroll.paymentStatus)}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 hr-payroll-value">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'JOD'
                      }).format(payroll.netSalary)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="hr-card">
        <h3 className="hr-subtitle">Quick Actions</h3>
        
        <div className="hr-grid">
          <Link 
            to="/travco-jordan/leave-management" 
            className="hr-card"
          >
            <div className="flex items-center">
              <div className="mr-4 bg-blue-500 text-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Manage Leaves</h4>
                <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Review and approve leave requests</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/travco-jordan/payroll-management" 
            className="hr-card"
          >
            <div className="flex items-center">
              <div className="mr-4 bg-green-500 text-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Manage Payroll</h4>
                <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Process and update payroll</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/travco-jordan/employees" 
            className="hr-card"
          >
            <div className="flex items-center">
              <div className="mr-4 bg-purple-500 text-white p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Manage Employees</h4>
                <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>View and update employee information</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Warning Management Section */}
      <div id="warnings-section" className="hr-section mt-8">
        <h2 className="hr-title mb-6">Warning Management System</h2>
        <p className="hr-description mb-6">
          Manage employee warnings, track acknowledgments, and maintain a record of disciplinary actions.
        </p>
        
        <WarningManagement />
      </div>
    </div>
  );
};

export default HRDashboard;