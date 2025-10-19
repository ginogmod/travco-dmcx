import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const LeaveHistory = () => {
  const { leaves, fetchUserLeaves } = useHR();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 0,
    sick: 0,
    familyDeath: 0
  });

  // Fallback leave balance in case of API failure
  const fallbackLeaveBalance = {
    annual: 21,
    sick: 14,
    familyDeath: 7
  };

  // Fetch leave history and balance when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch leave history with error handling
        try {
          await fetchUserLeaves();
        } catch (error) {
          console.warn('Error fetching leave history:', error);
        }
        
        // Fetch employee data to get leave balance
        try {
          const response = await fetch(`/api/travco-jordan/employees/user/${user.username}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const employee = await response.json();
            setLeaveBalance(employee.leaveBalance);
          } else {
            console.warn('Failed to fetch employee data, using fallback leave balance');
            setLeaveBalance(fallbackLeaveBalance);
          }
        } catch (error) {
          console.warn('Error fetching employee data, using fallback leave balance:', error);
          setLeaveBalance(fallbackLeaveBalance);
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
        setError('Some leave data could not be loaded. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, fetchUserLeaves]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status label
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

  // Get leave type label
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

  // Calculate leave duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-card">
      <h2 className="hr-subtitle">Leave History</h2>
      
      {error && (
        <div className="hr-alert hr-alert-danger mb-4">
          {error}
        </div>
      )}
      
      {/* Leave Balance */}
      <div className="hr-leave-balance">
        <div className="hr-leave-balance-card">
          <div className="hr-leave-balance-title">Annual Leave</div>
          <div className="hr-leave-balance-value">{leaveBalance.annual} days</div>
          <div className="hr-progress-container">
            <div
              className="hr-progress-bar hr-progress-bar-primary"
              style={{ width: `${(leaveBalance.annual / 21) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="hr-leave-balance-card">
          <div className="hr-leave-balance-title">Sick Leave</div>
          <div className="hr-leave-balance-value">{leaveBalance.sick} days</div>
          <div className="hr-progress-container">
            <div
              className="hr-progress-bar hr-progress-bar-success"
              style={{ width: `${(leaveBalance.sick / 14) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="hr-leave-balance-card">
          <div className="hr-leave-balance-title">Family Death Leave</div>
          <div className="hr-leave-balance-value">{leaveBalance.familyDeath} days</div>
          <div className="hr-progress-container">
            <div
              className="hr-progress-bar hr-progress-bar-warning"
              style={{ width: `${(leaveBalance.familyDeath / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Leave History Table */}
      {leaves && leaves.length > 0 ? (
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
                <tr key={leave._id || Math.random().toString()}>
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No leave history found.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;