import React, { useState, useEffect } from 'react';
import { useHR } from '../../context/HRContext';
import { useAuth } from '../../context/AuthContext';
import employees from '../../data/employeesData';
import './HR.css';

const WarningHistory = () => {
  const { user } = useAuth();
  const { warnings, fetchAllWarnings } = useHR();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredWarnings, setFilteredWarnings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });

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
        console.log("WarningHistory - Loading warnings");
        await fetchAllWarnings();
        console.log("WarningHistory - Warnings loaded successfully");
        setLoading(false);
      } catch (err) {
        console.error("WarningHistory - Error loading warnings:", err);
        setError('Failed to load warnings. Please try again later.');
        setLoading(false);
      }
    };

    loadWarnings();
  }, [fetchAllWarnings]);

  // Filter warnings based on search term and filters
  useEffect(() => {
    if (!warnings) {
      setFilteredWarnings([]);
      return;
    }
    
    try {
      let filtered = [...warnings];
      
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
      }
      
      // Apply severity filter
      if (severityFilter !== 'all') {
        filtered = filtered.filter(warning => warning.severity === severityFilter);
      }
      
      // Apply status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter(warning =>
          !warning.acknowledged &&
          (!warning.expiryDate || new Date(warning.expiryDate) > new Date())
        );
      } else if (statusFilter === 'acknowledged') {
        filtered = filtered.filter(warning => warning.acknowledged);
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter(warning =>
          !warning.acknowledged &&
          warning.expiryDate &&
          new Date(warning.expiryDate) <= new Date()
        );
      }
      
      // Apply employee filter
      if (employeeFilter !== 'all') {
        filtered = filtered.filter(warning => String(warning.employeeId) === String(employeeFilter));
      }
      
      // Apply date range filter
      if (dateRangeFilter.startDate) {
        const startDate = new Date(dateRangeFilter.startDate);
        filtered = filtered.filter(warning => new Date(warning.issuedDate) >= startDate);
      }
      
      if (dateRangeFilter.endDate) {
        const endDate = new Date(dateRangeFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        filtered = filtered.filter(warning => new Date(warning.issuedDate) <= endDate);
      }
      
      // If user is not HR admin, only show their warnings
      if (!isHRAdmin) {
        filtered = filtered.filter(warning => String(warning.employeeId) === String(user.id));
      }
      
      // Sort warnings by issued date (newest first)
      filtered.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));
      
      setFilteredWarnings(filtered);
    } catch (error) {
      console.error("Error filtering warnings:", error);
      setFilteredWarnings([]);
    }
  }, [warnings, searchTerm, severityFilter, statusFilter, employeeFilter, dateRangeFilter, isHRAdmin, user]);

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
        return 'Unknown Employee';
      }
      
      // Convert to string for comparison
      const empIdStr = String(employeeId);
      
      const employee = employees.find(emp => String(emp.id) === empIdStr);
      
      if (employee) {
        return employee.name;
      } else {
        // Try to find by numeric comparison as fallback
        try {
          const numericId = parseInt(empIdStr, 10);
          if (!isNaN(numericId)) {
            const employeeByNumeric = employees.find(emp => emp.id === numericId);
            
            if (employeeByNumeric) {
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

  // Handle date range filter change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRangeFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setEmployeeFilter('all');
    setDateRangeFilter({
      startDate: '',
      endDate: ''
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
      <h1 className="hr-title">Warning History</h1>
      
      {error && (
        <div className="hr-alert hr-alert-danger">
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div className="hr-card mb-6">
        <h3 className="hr-subtitle mb-4">Filter Warnings</h3>
        
        <div className="hr-filters">
          <div className="hr-filter-group">
            <label className="hr-form-label">Search</label>
            <input
              type="text"
              className="hr-form-input"
              placeholder="Search warnings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="hr-filter-group">
            <label className="hr-form-label">Severity</label>
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
            <label className="hr-form-label">Status</label>
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
          
          {isHRAdmin && (
            <div className="hr-filter-group">
              <label className="hr-form-label">Employee</label>
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
          )}
        </div>
        
        <div className="hr-filters mt-4">
          <div className="hr-filter-group">
            <label className="hr-form-label">Start Date</label>
            <input
              type="date"
              className="hr-form-input"
              name="startDate"
              value={dateRangeFilter.startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div className="hr-filter-group">
            <label className="hr-form-label">End Date</label>
            <input
              type="date"
              className="hr-form-input"
              name="endDate"
              value={dateRangeFilter.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div className="hr-filter-group flex items-end">
            <button
              className="hr-button hr-button-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Warnings List */}
      <div className="hr-card">
        <h3 className="hr-subtitle mb-4">Warning Records</h3>
        
        {filteredWarnings.length === 0 ? (
          <div className="hr-empty-state">
            <p>No warnings found matching your filters.</p>
          </div>
        ) : (
          <div className="hr-warnings-list">
            {filteredWarnings.map(warning => {
              try {
                if (!warning || !warning._id) {
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
                        </div>
                      )}
                      {warning.issuedBy && (
                        <p className="hr-text-muted">
                          Issued by: {warning.issuedBy}
                        </p>
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
    </div>
  );
};

export default WarningHistory;