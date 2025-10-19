import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const LeaveApproval = () => {
  const { leaves, fetchAllLeaves, updateLeaveRequestByManager, updateLeaveRequestByHR, addGMSignatureToLeave } = useHR();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comments, setComments] = useState('');
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected'

  // Fetch all leaves when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchAllLeaves();
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setError('Error fetching leave requests');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, fetchAllLeaves]);

  // Filter leaves based on user role and status
  useEffect(() => {
    if (!leaves) return;
    
    let filtered = [];
    
    if (user.role === 'Department Head') {
      // For managers, show leaves from their department that are pending manager approval
      if (viewMode === 'pending') {
        filtered = leaves.filter(leave => leave.status === 'pending');
      } else if (viewMode === 'approved') {
        filtered = leaves.filter(leave => leave.status === 'approved_by_manager' || leave.status === 'approved_by_hr' || leave.status === 'completed');
      } else if (viewMode === 'rejected') {
        filtered = leaves.filter(leave => leave.status === 'rejected_by_manager');
      }
    } else if (user.department === 'HR') {
      // For HR, show leaves that have manager approval and are pending HR approval
      if (viewMode === 'pending') {
        filtered = leaves.filter(leave => leave.status === 'approved_by_manager');
      } else if (viewMode === 'approved') {
        filtered = leaves.filter(leave => leave.status === 'approved_by_hr' || leave.status === 'completed');
      } else if (viewMode === 'rejected') {
        filtered = leaves.filter(leave => leave.status === 'rejected_by_hr');
      }
    } else if (user.role === 'General Manager') {
      // For GM, show leaves that have HR approval and need GM signature
      if (viewMode === 'pending') {
        filtered = leaves.filter(leave => leave.status === 'approved_by_hr' && (!leave.gmSignature || !leave.gmSignature.signed));
      } else if (viewMode === 'approved') {
        filtered = leaves.filter(leave => leave.status === 'completed');
      } else {
        filtered = [];
      }
    }
    
    setPendingLeaves(filtered);
  }, [leaves, user, viewMode]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get leave type label
  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case 'annual':
        return 'Annual Leave';
      case 'sick':
        return 'Sick Leave';
      case 'family_death_level1':
        return 'Family Death Leave (Level 1: Parents/Siblings)';
      case 'family_death_level2':
        return 'Family Death Leave (Level 2: Uncles/Grandparents)';
      case 'family_death_level3':
        return 'Family Death Leave (Level 3: Cousins)';
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

  // Handle leave selection
  const handleSelectLeave = (leave) => {
    setSelectedLeave(leave);
    setComments('');
    setError(null);
    setSuccess(null);
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  // Handle approve leave
  const handleApprove = async () => {
    if (!selectedLeave) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result = false;
      
      if (user.role === 'Department Head') {
        // Manager approval
        result = await updateLeaveRequestByManager(selectedLeave._id, true, comments);
      } else if (user.department === 'HR') {
        // HR approval
        result = await updateLeaveRequestByHR(selectedLeave._id, true, comments);
      } else if (user.role === 'General Manager') {
        // GM signature
        result = await addGMSignatureToLeave(selectedLeave._id);
      }
      
      if (result) {
        setSuccess('Leave request approved successfully');
        setSelectedLeave(null);
        await fetchAllLeaves(); // Refresh the list
      } else {
        setError('Failed to approve leave request');
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      setError('Error approving leave request');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject leave
  const handleReject = async () => {
    if (!selectedLeave) return;
    
    if (!comments) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result = false;
      
      if (user.role === 'Department Head') {
        // Manager rejection
        result = await updateLeaveRequestByManager(selectedLeave._id, false, comments);
      } else if (user.department === 'HR') {
        // HR rejection
        result = await updateLeaveRequestByHR(selectedLeave._id, false, comments);
      }
      
      if (result) {
        setSuccess('Leave request rejected successfully');
        setSelectedLeave(null);
        await fetchAllLeaves(); // Refresh the list
      } else {
        setError('Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      setError('Error rejecting leave request');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !leaves) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-card">
      <h2 className="hr-subtitle">Leave Approval</h2>
      
      {error && (
        <div className="hr-alert hr-alert-danger mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="hr-alert hr-alert-success mb-4">
          {success}
        </div>
      )}
      
      {/* View Mode Tabs */}
      <div className="hr-tabs">
        <button
          className={`hr-tab ${viewMode === 'pending' ? 'hr-tab-active' : ''}`}
          onClick={() => setViewMode('pending')}
        >
          Pending
        </button>
        <button
          className={`hr-tab ${viewMode === 'approved' ? 'hr-tab-active' : ''}`}
          onClick={() => setViewMode('approved')}
        >
          Approved
        </button>
        {user.role !== 'General Manager' && (
          <button
            className={`hr-tab ${viewMode === 'rejected' ? 'hr-tab-active' : ''}`}
            onClick={() => setViewMode('rejected')}
          >
            Rejected
          </button>
        )}
      </div>
      
      <div className="hr-grid">
        {/* Leave Requests List */}
        <div style={{borderRight: "1px solid #333", paddingRight: "1.5rem"}}>
          <h3 className="hr-subtitle" style={{fontSize: "1.125rem"}}>
            {viewMode === 'pending' ? 'Pending Requests' : viewMode === 'approved' ? 'Approved Requests' : 'Rejected Requests'}
          </h3>
          
          {pendingLeaves.length === 0 ? (
            <p style={{color: "rgba(255, 255, 255, 0.6)"}}>No leave requests found.</p>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="hr-card"
                  style={{
                    cursor: "pointer",
                    border: selectedLeave && selectedLeave._id === leave._id ? "1px solid #007bff" : "1px solid #444",
                    backgroundColor: selectedLeave && selectedLeave._id === leave._id ? "#1a1a1a" : "#1f1f1f"
                  }}
                  onClick={() => handleSelectLeave(leave)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{leave.employeeName || 'Employee'}</h4>
                      <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>{getLeaveTypeLabel(leave.leaveType)}</p>
                    </div>
                    <span className="text-sm" style={{color: "rgba(255, 255, 255, 0.5)"}}>
                      {formatDate(leave.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {calculateDuration(leave.startDate, leave.endDate)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Dates:</span> {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Leave Details */}
        <div style={{gridColumn: "span 2"}}>
          {selectedLeave ? (
            <div>
              <h3 className="hr-subtitle" style={{fontSize: "1.25rem", marginBottom: "1rem"}}>Leave Request Details</h3>
              
              <div className="hr-grid" style={{marginBottom: "1.5rem"}}>
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Leave Type</p>
                  <p className="font-medium">{getLeaveTypeLabel(selectedLeave.leaveType)}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Duration</p>
                  <p className="font-medium">{calculateDuration(selectedLeave.startDate, selectedLeave.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Start Date</p>
                  <p className="font-medium">{formatDate(selectedLeave.startDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>End Date</p>
                  <p className="font-medium">{formatDate(selectedLeave.endDate)}</p>
                </div>
                
                <div style={{gridColumn: "span 2"}}>
                  <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Reason</p>
                  <p className="font-medium">{selectedLeave.reason}</p>
                </div>
                
                {selectedLeave.attachments && selectedLeave.attachments.length > 0 && (
                  <div style={{gridColumn: "span 2"}}>
                    <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.5rem"}}>Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLeave.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#2a2a2a",
                            borderRadius: "9999px",
                            fontSize: "0.875rem"
                          }}
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedLeave.managerApproval && (
                  <div style={{
                    gridColumn: "span 2",
                    padding: "1rem",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "0.5rem",
                    border: "1px solid #333"
                  }}>
                    <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Manager Decision</p>
                    <p className="font-medium">
                      {selectedLeave.managerApproval.approved ? 'Approved' : 'Rejected'} by {selectedLeave.managerApproval.approvedBy}
                    </p>
                    {selectedLeave.managerApproval.comments && (
                      <div className="mt-2">
                        <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Comments</p>
                        <p>{selectedLeave.managerApproval.comments}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedLeave.hrApproval && (
                  <div style={{
                    gridColumn: "span 2",
                    padding: "1rem",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "0.5rem",
                    border: "1px solid #333"
                  }}>
                    <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>HR Decision</p>
                    <p className="font-medium">
                      {selectedLeave.hrApproval.approved ? 'Approved' : 'Rejected'} by {selectedLeave.hrApproval.approvedBy}
                    </p>
                    {selectedLeave.hrApproval.comments && (
                      <div className="mt-2">
                        <p className="text-sm" style={{color: "rgba(255, 255, 255, 0.6)"}}>Comments</p>
                        <p>{selectedLeave.hrApproval.comments}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {viewMode === 'pending' && (
                <>
                  {/* Comments */}
                  {(user.role === 'Department Head' || user.department === 'HR') && (
                    <div className="hr-form-group">
                      <label className="hr-form-label">
                        Comments {viewMode === 'pending' && <span style={{color: "#dc3545"}}>*</span>}
                      </label>
                      <textarea
                        value={comments}
                        onChange={handleCommentsChange}
                        className="hr-form-textarea"
                        rows="3"
                        placeholder="Enter your comments here..."
                      ></textarea>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end" style={{gap: "1rem"}}>
                    {user.role === 'General Manager' ? (
                      <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="hr-button hr-button-success"
                      >
                        {loading ? 'Processing...' : 'Sign Off'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleReject}
                          disabled={loading}
                          className="hr-button hr-button-danger"
                        >
                          {loading ? 'Processing...' : 'Reject'}
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={loading}
                          className="hr-button hr-button-success"
                        >
                          {loading ? 'Processing...' : 'Approve'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{color: "rgba(255, 255, 255, 0.6)"}}>Select a leave request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;