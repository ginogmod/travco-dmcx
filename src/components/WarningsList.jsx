import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';
import employees from '../data/employeesData';

const WarningsList = ({ onEdit }) => {
  const { user } = useAuth();
  const { warnings, acknowledgeWarning } = useHR();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [filteredWarnings, setFilteredWarnings] = useState([]);

  // Check if user has HR dashboard access
  const isHRAdmin = user?.department === 'HR' ||
                   user?.role === 'HR Administrator' ||
                   user?.role === 'admin' ||
                   user?.role === 'Administrator' ||
                   user?.role === 'General Manager';

  // Filter warnings based on search term and filters
  useEffect(() => {
    console.log("WarningsList - Filtering warnings:", warnings);
    
    if (!warnings) {
      console.log("WarningsList - Warnings is undefined");
      setFilteredWarnings([]);
      return;
    }
    
    if (!Array.isArray(warnings)) {
      console.error("WarningsList - Warnings is not an array:", warnings);
      setFilteredWarnings([]);
      return;
    }
    
    if (warnings.length === 0) {
      console.log("WarningsList - No warnings to filter");
      setFilteredWarnings([]);
      return;
    }

    try {
      let filtered = [...warnings];
      console.log("WarningsList - Initial filtered warnings:", filtered.length);

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(warning => {
          try {
            const employee = employees.find(emp => String(emp.id) === String(warning.employeeId));
            const employeeName = employee ? employee.name : 'Unknown Employee';
            
            return (
              warning.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              warning.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              employeeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
          } catch (err) {
            console.error("Error in search filter:", err);
            return false;
          }
        });
        console.log("WarningsList - After search filter:", filtered.length);
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        filtered = filtered.filter(warning => warning.severity === severityFilter);
        console.log("WarningsList - After severity filter:", filtered.length);
      }

      // Apply status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter(warning =>
          !warning.acknowledged &&
          (!warning.expiryDate || new Date(warning.expiryDate) > new Date())
        );
        console.log("WarningsList - After active status filter:", filtered.length);
      } else if (statusFilter === 'acknowledged') {
        filtered = filtered.filter(warning => warning.acknowledged);
        console.log("WarningsList - After acknowledged status filter:", filtered.length);
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter(warning =>
          !warning.acknowledged &&
          warning.expiryDate &&
          new Date(warning.expiryDate) <= new Date()
        );
        console.log("WarningsList - After expired status filter:", filtered.length);
      }

      // Apply employee filter
      if (employeeFilter !== 'all') {
        filtered = filtered.filter(warning => String(warning.employeeId) === String(employeeFilter));
        console.log("WarningsList - After employee filter:", filtered.length);
      }

      // Sort warnings by issued date (newest first)
      filtered.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
      console.log("WarningsList - Final filtered warnings:", filtered);

      setFilteredWarnings(filtered);
    } catch (error) {
      console.error("Error filtering warnings:", error);
      setFilteredWarnings([]);
    }
  }, [warnings, searchTerm, severityFilter, statusFilter, employeeFilter]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get employee name from ID
  const getEmployeeName = (employeeId) => {
    try {
      if (!employeeId) {
        console.error("WarningsList - Empty employee ID provided");
        return 'Unknown Employee';
      }
      
      // Convert to string for comparison
      const empIdStr = String(employeeId);
      console.log(`WarningsList - Looking for employee with ID: ${empIdStr}`);
      
      if (!employees || !Array.isArray(employees)) {
        console.error("WarningsList - Employees data is not available or not an array");
        return 'Unknown Employee';
      }
      
      // Log all employee IDs for debugging
      const employeeIds = employees.map(emp => String(emp.id));
      console.log("WarningsList - All employee IDs:", employeeIds);
      
      const employee = employees.find(emp => String(emp.id) === empIdStr);
      
      if (employee) {
        console.log(`WarningsList - Found employee: ${employee.name} for ID: ${empIdStr}`);
        return employee.name;
      } else {
        console.log(`WarningsList - Employee not found for ID: ${empIdStr}`);
        // Try to find by numeric comparison as fallback
        try {
          const numericId = parseInt(empIdStr, 10);
          if (!isNaN(numericId)) {
            const employeeByNumeric = employees.find(emp => emp.id === numericId);
            
            if (employeeByNumeric) {
              console.log(`WarningsList - Found employee by numeric ID: ${employeeByNumeric.name}`);
              return employeeByNumeric.name;
            }
          }
        } catch (err) {
          console.error("Error parsing employee ID:", err);
        }
        
        return 'Unknown Employee';
      }
    } catch (error) {
      console.error("Error in getEmployeeName:", error);
      return 'Unknown Employee';
    }
  };

  // Handle acknowledging a warning
  const handleAcknowledge = async (warningId) => {
    if (!warningId) {
      console.error('WarningsList - No warning ID provided for acknowledgment');
      return;
    }
    
    try {
      console.log(`WarningsList - Acknowledging warning with ID: ${warningId}`);
      
      if (!acknowledgeWarning || typeof acknowledgeWarning !== 'function') {
        console.error('WarningsList - acknowledgeWarning function is not available');
        return;
      }
      
      await acknowledgeWarning(warningId);
      console.log(`WarningsList - Warning ${warningId} acknowledged successfully`);
    } catch (error) {
      console.error('WarningsList - Failed to acknowledge warning:', error);
    }
  };

  return (
    <div className="hr-warnings-container">
      {/* Filters */}
      <div className="hr-filters">
        <div className="hr-filter-group">
          <input
            type="text"
            className="hr-form-input"
            placeholder="Search warnings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hr-filter-group">
          <select
            className="hr-form-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="hr-filter-group">
          <select
            className="hr-form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="hr-filter-group">
          <select
            className="hr-form-select"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warnings List */}
      {filteredWarnings.length === 0 ? (
        <div className="hr-empty-state">
          <p>No warnings found matching your filters.</p>
        </div>
      ) : (
        <div className="hr-warnings-list">
          {filteredWarnings.map(warning => {
            try {
              if (!warning) {
                console.error("WarningsList - Warning object is undefined or null");
                return null;
              }
              
              if (!warning._id) {
                console.error("WarningsList - Warning has no ID:", warning);
                return null;
              }
              
              const isExpired = warning.expiryDate && new Date(warning.expiryDate) <= new Date();
              const statusClass = warning.acknowledged
                ? 'hr-badge-success'
                : isExpired
                  ? 'hr-badge-secondary'
                  : 'hr-badge-warning';
              
              const statusText = warning.acknowledged
                ? 'Acknowledged'
                : isExpired
                  ? 'Expired'
                  : 'Pending';

              const severityClass =
                warning.severity === 'high'
                  ? 'hr-warning-high'
                  : warning.severity === 'medium'
                    ? 'hr-warning-medium'
                    : 'hr-warning-low';

              return (
                <div key={warning._id} className={`hr-card ${severityClass}`}>
                <div className="hr-card-header">
                  <div>
                    <h3 className="hr-card-title">{warning.title}</h3>
                    <p className="hr-card-subtitle">
                      {getEmployeeName(warning.employeeId)} - {formatDate(warning.issuedDate)}
                    </p>
                  </div>
                  <div className="hr-badges">
                    <span className={`hr-badge ${statusClass}`}>
                      {statusText}
                    </span>
                    <span className={`hr-badge hr-badge-${warning.severity}`}>
                      {warning.severity.charAt(0).toUpperCase() + warning.severity.slice(1)} Severity
                    </span>
                  </div>
                </div>
                
                <div className="hr-card-body">
                  <p className="hr-card-text">{warning.description}</p>
                </div>
                
                <div className="hr-card-footer">
                  {warning.acknowledged ? (
                    <p className="hr-text-success">
                      Acknowledged on: {formatDate(warning.acknowledgedDate)}
                    </p>
                  ) : (
                    <div className="hr-card-actions">
                      {warning.expiryDate && (
                        <p className="hr-text-muted">
                          Expires on: {formatDate(warning.expiryDate)}
                        </p>
                      )}
                      <div>
                        {isHRAdmin && (
                          <button
                            className="hr-button hr-button-sm hr-button-secondary mr-2"
                            onClick={() => {
                              try {
                                if (typeof onEdit === 'function') {
                                  onEdit(warning);
                                } else {
                                  console.error("WarningsList - onEdit is not a function");
                                }
                              } catch (error) {
                                console.error("WarningsList - Error in onEdit:", error);
                              }
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button 
                          className="hr-button hr-button-sm hr-button-primary"
                          onClick={() => handleAcknowledge(warning._id)}
                        >
                          Mark as Acknowledged
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          } catch (error) {
            console.error("Error rendering warning:", error);
            return null;
          }
          })}
        </div>
      )}
    </div>
  );
};

export default WarningsList;