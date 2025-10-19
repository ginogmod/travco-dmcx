import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';
import WarningForm from './WarningForm';
import WarningsList from './WarningsList';
import employees from '../data/employeesData';

const WarningManagement = () => {
  const { user } = useAuth();
  const { warnings, fetchAllWarnings } = useHR();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);

  // Check if user has HR dashboard access
  const isHRAdmin = user?.department === 'HR' ||
                   user?.role === 'HR Administrator' ||
                   user?.role === 'admin' ||
                   user?.role === 'Administrator' ||
                   user?.role === 'General Manager';

  // Fetch warnings when component mounts
  useEffect(() => {
    const loadWarnings = async () => {
      setLoading(true);
      try {
        console.log("WarningManagement - Loading warnings");
        await fetchAllWarnings();
        
        // Log employees and warnings for debugging
        console.log("WarningManagement - Employees:", employees.slice(0, 5));
        console.log("WarningManagement - Warnings loaded successfully");
        
        setLoading(false);
      } catch (err) {
        console.error("WarningManagement - Error loading warnings:", err);
        setError('Failed to load warnings. Please try again later.');
        setLoading(false);
      }
    };

    if (isHRAdmin) {
      loadWarnings();
    } else {
      setLoading(false);
    }
  }, [fetchAllWarnings, isHRAdmin]); // Keep dependencies minimal to prevent circular updates

  // Handle form submission completion
  const handleFormSubmit = () => {
    console.log("WarningManagement - Form submitted successfully");
    
    // First hide the form to prevent further interactions
    setShowAddForm(false);
    setEditingWarning(null);
    
    // Then refresh warnings list
    try {
      console.log("WarningManagement - Refreshing warnings after form submission");
      fetchAllWarnings().then(() => {
        console.log("WarningManagement - Warnings refreshed after form submission");
      }).catch(err => {
        console.error("WarningManagement - Error refreshing warnings:", err);
        setError("Failed to refresh warnings after submission. Please reload the page.");
      });
    } catch (err) {
      console.error("WarningManagement - Error in fetchAllWarnings:", err);
      setError("An error occurred while refreshing warnings. Please reload the page.");
    }
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    console.log("WarningManagement - Form cancelled");
    setShowAddForm(false);
    setEditingWarning(null);
  };

  // Handle editing a warning
  const handleEditWarning = (warning) => {
    setEditingWarning(warning);
    setShowAddForm(true);
  };

  if (!isHRAdmin) {
    return (
      <div className="hr-alert hr-alert-danger">
        Access denied. You must be an HR administrator, Administrator, or General Manager to view this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-container">
      <div className="hr-header-with-actions">
        <h2 className="hr-subtitle">Warning Management</h2>
        <button
          className="hr-button hr-button-primary"
          onClick={() => {
            setEditingWarning(null);
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? 'Cancel' : 'Issue New Warning'}
        </button>
      </div>

      {error && (
        <div className="hr-alert hr-alert-danger">
          {error}
        </div>
      )}

      {/* Add/Edit Warning Form */}
      {showAddForm && (
        <WarningForm
          warning={editingWarning}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Warnings List */}
      {!loading && (
        <WarningsList onEdit={handleEditWarning} />
      )}
    </div>
  );
};

export default WarningManagement;