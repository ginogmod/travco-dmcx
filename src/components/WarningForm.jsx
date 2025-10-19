import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';
import employees from '../data/employeesData';

const WarningForm = ({ warning = null, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const { createWarning, updateWarning } = useHR();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    description: '',
    severity: 'low',
    acknowledgementRequired: true,
    expiryDate: ''
  });

  // If warning is provided, populate form with warning data (edit mode)
  useEffect(() => {
    if (warning) {
      setFormData({
        employeeId: warning.employeeId,
        title: warning.title,
        description: warning.description,
        severity: warning.severity,
        acknowledgementRequired: warning.acknowledgementRequired,
        expiryDate: warning.expiryDate ? new Date(warning.expiryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [warning]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!formData.employeeId) {
      setError("Please select an employee");
      return;
    }
    
    if (!formData.title.trim()) {
      setError("Please enter a warning title");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Please enter a warning description");
      return;
    }
    
    try {
      // Log form data for debugging
      console.log("WarningForm - Form data before submission:", formData);
      
      // Find the selected employee for logging
      const selectedEmployee = employees.find(emp => String(emp.id) === String(formData.employeeId));
      console.log("WarningForm - Selected employee:", selectedEmployee);
      
      if (!selectedEmployee) {
        console.error("WarningForm - No employee found with ID:", formData.employeeId);
        setError("Selected employee not found. Please select a valid employee.");
        return;
      }
      
      // Keep employeeId as a string for consistent handling
      // Process expiryDate if provided
      const processedData = {
        ...formData,
        employeeId: String(formData.employeeId),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      };
      
      console.log("WarningForm - Processed form data:", processedData);
      
      try {
        if (warning) {
          // Edit mode
          console.log("WarningForm - Updating existing warning:", warning._id);
          const result = await updateWarning(warning._id, {
            ...processedData,
            updatedBy: user?.username || 'unknown',
            updatedAt: new Date()
          });
          console.log("WarningForm - Update result:", result);
        } else {
          // Add mode
          console.log("WarningForm - Creating new warning");
          const result = await createWarning({
            ...processedData,
            issuedBy: user?.username || 'unknown',
            issuedDate: new Date()
          });
          console.log("WarningForm - Create result:", result);
          
          // Show success message with notification details
          setError(null);
          const successMessage = document.createElement('div');
          successMessage.className = 'hr-alert hr-alert-success mb-4';
          successMessage.innerHTML = `
            <strong>Warning created successfully!</strong><br/>
            A notification will be displayed to ${selectedEmployee.name} the next time they log in.
            They will need to acknowledge this warning before proceeding.
          `;
          
          // Insert success message before the form
          const formElement = document.querySelector('form');
          if (formElement && formElement.parentNode) {
            formElement.parentNode.insertBefore(successMessage, formElement);
            
            // Remove the success message after 5 seconds
            setTimeout(() => {
              if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
              }
            }, 5000);
          }
        }
        
        // Call the onSubmit callback
        console.log("WarningForm - Submission successful, calling onSubmit");
        if (typeof onSubmit === 'function') {
          onSubmit();
        } else {
          console.error("WarningForm - onSubmit is not a function:", onSubmit);
        }
      } catch (submitError) {
        console.error("Error in warning submission:", submitError);
        setError(`Failed to ${warning ? 'update' : 'create'} warning: ${submitError?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error in WarningForm validation:", err);
      setError(err?.message || `Failed to ${warning ? 'update' : 'create'} warning. Please try again.`);
    }
  };

  return (
    <div className="hr-card mb-6">
      <h3 className="hr-subtitle">
        {warning ? 'Edit Warning' : 'Issue New Warning'}
      </h3>
      
      {error && (
        <div className="hr-alert hr-alert-danger mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="hr-form-group">
          <label className="hr-form-label">Employee</label>
          <select 
            className="hr-form-input"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.department} (ID: {emp.id})
              </option>
            ))}
          </select>
        </div>

        <div className="hr-form-group">
          <label className="hr-form-label">Warning Title</label>
          <input 
            className="hr-form-input"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., Late Arrival, Missed Deadline"
          />
        </div>

        <div className="hr-form-group">
          <label className="hr-form-label">Description</label>
          <textarea 
            className="hr-form-textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            placeholder="Provide details about the warning..."
          />
        </div>

        <div className="hr-form-group">
          <label className="hr-form-label">Severity</label>
          <select 
            className="hr-form-input"
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="hr-form-group">
          <label className="hr-form-label">Expiry Date (Optional)</label>
          <input 
            className="hr-form-input"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
          <small className="hr-form-help">
            If set, the warning will expire on this date if not acknowledged.
          </small>
        </div>

        <div className="hr-form-group">
          <label className="hr-form-checkbox">
            <input 
              type="checkbox"
              name="acknowledgementRequired"
              checked={formData.acknowledgementRequired}
              onChange={handleInputChange}
            />
            <span>Require Acknowledgement</span>
          </label>
          <small className="hr-form-help">
            If checked, the employee will be required to acknowledge this warning.
          </small>
        </div>

        <div className="hr-form-actions">
          <button 
            type="button" 
            className="hr-button hr-button-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="hr-button hr-button-primary"
          >
            {warning ? 'Update Warning' : 'Issue Warning'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarningForm;