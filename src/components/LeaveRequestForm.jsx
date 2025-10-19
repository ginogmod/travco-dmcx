import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const LeaveRequestForm = ({ onRequestSubmitted }) => {
  const { createLeaveRequest } = useHR();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: []
  });

  // Fallback employee ID in case of API failure
  const fallbackEmployeeId = 'EMP' + Math.floor(Math.random() * 1000);

  // Fetch employee ID when component mounts
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const response = await fetch(`/api/travco-jordan/employees/user/${user.username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const employee = await response.json();
          setEmployeeId(employee._id || employee.employeeId);
        } else {
          console.warn('Failed to fetch employee data, using fallback ID');
          setEmployeeId(fallbackEmployeeId);
        }
      } catch (error) {
        console.warn('Error fetching employee data, using fallback ID:', error);
        setEmployeeId(fallbackEmployeeId);
      }
    };
    
    if (user) {
      fetchEmployeeId();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: e.target.files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Create form data for file upload
      const formDataObj = new FormData();
      formDataObj.append('employeeId', employeeId);
      formDataObj.append('leaveType', formData.leaveType);
      formDataObj.append('startDate', formData.startDate);
      formDataObj.append('endDate', formData.endDate);
      formDataObj.append('reason', formData.reason);
      
      // Append attachments
      if (formData.attachments.length > 0) {
        for (let i = 0; i < formData.attachments.length; i++) {
          formDataObj.append('attachments', formData.attachments[i]);
        }
      }
      
      // Submit leave request
      const response = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setFormData({
          leaveType: 'annual',
          startDate: '',
          endDate: '',
          reason: '',
          attachments: []
        });
        
        if (onRequestSubmitted) {
          onRequestSubmitted(data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setError('Error submitting leave request');
    } finally {
      setLoading(false);
    }
  };

  // Calculate the number of days between start and end dates
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    
    return diffDays;
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

  return (
    <div className="hr-card">
      <h2 className="hr-subtitle">Request Leave</h2>
      
      {error && (
        <div className="hr-alert hr-alert-danger mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="hr-alert hr-alert-success mb-4">
          Leave request submitted successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="hr-form-group">
          <label className="hr-form-label">
            Leave Type
          </label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="hr-form-select"
            required
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="family_death_level1">Family Death Leave (Level 1: Parents/Siblings)</option>
            <option value="family_death_level2">Family Death Leave (Level 2: Uncles/Grandparents)</option>
            <option value="family_death_level3">Family Death Leave (Level 3: Cousins)</option>
          </select>
        </div>
        
        <div className="hr-grid">
          <div className="hr-form-group">
            <label className="hr-form-label">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="hr-form-input"
              required
            />
          </div>
          
          <div className="hr-form-group">
            <label className="hr-form-label">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="hr-form-input"
              required
            />
          </div>
        </div>
        
        {formData.startDate && formData.endDate && (
          <div className="hr-alert hr-alert-info mb-4">
            <p>
              Duration: <strong>{calculateDays()} days</strong>
            </p>
          </div>
        )}
        
        <div className="hr-form-group">
          <label className="hr-form-label">
            Reason for Leave
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="hr-form-textarea"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="hr-form-group">
          <label className="hr-form-label">
            Attachments {formData.leaveType === 'sick' && <span style={{color: "#dc3545"}}>*</span>}
          </label>
          <input
            type="file"
            name="attachments"
            onChange={handleFileChange}
            className="hr-form-input"
            multiple
            required={formData.leaveType === 'sick'}
          />
          {formData.leaveType === 'sick' && (
            <p className="text-sm mt-1" style={{color: "rgba(255, 255, 255, 0.5)"}}>
              Please attach medical reports or certificates
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`hr-button ${loading ? 'hr-button-disabled' : 'hr-button-primary'}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;