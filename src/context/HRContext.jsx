import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as warningStorage from '../assets/utils/warningStorage';

const HRContext = createContext(null);

export const HRProvider = ({ children }) => {
  const { user, token, serverAvailable } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeWarnings, setActiveWarnings] = useState([]);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);

  // Fetch employee data
  const fetchEmployees = async () => {
    if (!token || !serverAvailable) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/hr/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch warnings for the current user
  const fetchUserWarnings = async () => {
    if (!token || !serverAvailable || !user) return;
    
    setLoading(true);
    try {
      console.log("HRContext - Fetching warnings for user:", user.id);
      
      // In a real API scenario, we would fetch from the server
      // For now, we'll use our warningStorage utility
      
      // Get all warnings first if they're not already loaded
      if (!warnings || warnings.length === 0) {
        await fetchAllWarnings();
      }
      
      // Get warnings for the current user
      const userWarnings = warningStorage.getEmployeeWarnings(user.id);
      console.log("HRContext - User warnings:", userWarnings);
      
      // Filter active warnings that require acknowledgment
      const active = userWarnings.filter(warning =>
        warning.acknowledgementRequired &&
        !warning.acknowledged &&
        (!warning.expiryDate || new Date(warning.expiryDate) > new Date())
      );
      
      console.log("HRContext - Active user warnings:", active);
      
      // Convert dates from strings to Date objects for use in the application
      const processedWarnings = userWarnings.map(warning => ({
        ...warning,
        issuedDate: new Date(warning.issuedDate),
        acknowledgedDate: warning.acknowledgedDate ? new Date(warning.acknowledgedDate) : null,
        expiryDate: warning.expiryDate ? new Date(warning.expiryDate) : null,
        updatedAt: warning.updatedAt ? new Date(warning.updatedAt) : null
      }));
      
      const processedActive = active.map(warning => ({
        ...warning,
        issuedDate: new Date(warning.issuedDate),
        acknowledgedDate: warning.acknowledgedDate ? new Date(warning.acknowledgedDate) : null,
        expiryDate: warning.expiryDate ? new Date(warning.expiryDate) : null,
        updatedAt: warning.updatedAt ? new Date(warning.updatedAt) : null
      }));
      
      setActiveWarnings(processedActive);
      return processedWarnings;
    } catch (error) {
      console.error('Error fetching warnings:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all warnings (for HR admin)
  const fetchAllWarnings = async () => {
    if (!token || !serverAvailable || !user) {
      console.log("HRContext - fetchAllWarnings: No token, server, or user available");
      return [];
    }
    
    setLoading(true);
    try {
      // In a real API scenario, we would fetch from the server
      // For now, we'll use our warningStorage utility
      
      // Get warnings from localStorage
      let storedWarnings = warningStorage.getWarnings();
      
      // If no warnings exist, initialize with sample data
      if (storedWarnings.length === 0) {
        console.log("HRContext - No warnings found, initializing sample warnings");
        const employees = await import('../data/employeesData').then(module => module.default);
        storedWarnings = warningStorage.initializeSampleWarnings(employees);
      }
      
      console.log("HRContext - Retrieved warnings:", storedWarnings);
      
      // Convert dates from strings to Date objects for use in the application
      const processedWarnings = storedWarnings.map(warning => ({
        ...warning,
        issuedDate: new Date(warning.issuedDate),
        acknowledgedDate: warning.acknowledgedDate ? new Date(warning.acknowledgedDate) : null,
        expiryDate: warning.expiryDate ? new Date(warning.expiryDate) : null,
        updatedAt: warning.updatedAt ? new Date(warning.updatedAt) : null
      }));
      
      setWarnings(processedWarnings);
      return processedWarnings;
    } catch (error) {
      console.error('Error fetching warnings:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new warning
  const createWarning = async (warningData) => {
    if (!token || !serverAvailable || !user) {
      console.log("HRContext - createWarning: No token, server, or user available");
      return null;
    }
    
    setLoading(true);
    try {
      console.log("HRContext - Creating new warning with data:", warningData);
      
      // In a real API scenario, we would post to the server
      // For now, we'll use our warningStorage utility
      
      // Create the new warning object
      const newWarning = {
        ...warningData,
        issuedDate: new Date(),
        acknowledged: false
      };
      
      // Add the warning to localStorage
      const createdWarning = warningStorage.addWarning(newWarning);
      
      if (!createdWarning) {
        throw new Error("Failed to create warning");
      }
      
      console.log("HRContext - New warning created:", createdWarning);
      
      // Update the warnings state with the new warning
      // Convert dates from strings to Date objects for use in the application
      const processedWarning = {
        ...createdWarning,
        issuedDate: new Date(createdWarning.issuedDate),
        acknowledgedDate: createdWarning.acknowledgedDate ? new Date(createdWarning.acknowledgedDate) : null,
        expiryDate: createdWarning.expiryDate ? new Date(createdWarning.expiryDate) : null
      };
      
      setWarnings(prevWarnings => [...prevWarnings, processedWarning]);
      
      return processedWarning;
    } catch (error) {
      console.error('Error creating warning:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing warning
  const updateWarning = async (warningId, warningData) => {
    if (!token || !serverAvailable || !user) {
      console.log("HRContext - updateWarning: No token, server, or user available");
      return null;
    }
    
    setLoading(true);
    try {
      console.log("HRContext - Updating warning with ID:", warningId);
      console.log("HRContext - Update data:", warningData);
      
      // In a real API scenario, we would put to the server
      // For now, we'll use our warningStorage utility
      
      // Update the warning in localStorage
      const updatedWarning = warningStorage.updateWarning(warningId, warningData);
      
      if (!updatedWarning) {
        throw new Error("Failed to update warning");
      }
      
      console.log("HRContext - Warning updated successfully:", updatedWarning);
      
      // Update the warnings state with the updated warning
      // Convert dates from strings to Date objects for use in the application
      const processedWarning = {
        ...updatedWarning,
        issuedDate: new Date(updatedWarning.issuedDate),
        acknowledgedDate: updatedWarning.acknowledgedDate ? new Date(updatedWarning.acknowledgedDate) : null,
        expiryDate: updatedWarning.expiryDate ? new Date(updatedWarning.expiryDate) : null,
        updatedAt: updatedWarning.updatedAt ? new Date(updatedWarning.updatedAt) : null
      };
      
      setWarnings(prevWarnings =>
        prevWarnings.map(warning =>
          warning._id === warningId ? processedWarning : warning
        )
      );
      
      return processedWarning;
    } catch (error) {
      console.error('Error updating warning:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a warning
  const deleteWarning = async (warningId) => {
    if (!token || !serverAvailable || !user) {
      console.log("HRContext - deleteWarning: No token, server, or user available");
      return false;
    }
    
    setLoading(true);
    try {
      console.log("HRContext - Deleting warning with ID:", warningId);
      
      // In a real API scenario, we would delete from the server
      // For now, we'll use our warningStorage utility
      
      // Delete the warning from localStorage
      const success = warningStorage.deleteWarning(warningId);
      
      if (!success) {
        throw new Error("Failed to delete warning");
      }
      
      console.log("HRContext - Warning deleted successfully");
      
      // Update the warnings state by removing the deleted warning
      setWarnings(prevWarnings =>
        prevWarnings.filter(warning => warning._id !== warningId)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting warning:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge a warning
  const acknowledgeWarning = async (warningId) => {
    if (!token || !serverAvailable || !user) {
      console.log("HRContext - acknowledgeWarning: No token, server, or user available");
      return false;
    }
    
    setLoading(true);
    try {
      console.log("HRContext - Acknowledging warning with ID:", warningId);
      
      // In a real API scenario, we would put to the server
      // For now, we'll use our warningStorage utility
      
      // Acknowledge the warning in localStorage
      const success = warningStorage.acknowledgeWarning(warningId);
      
      if (!success) {
        throw new Error("Failed to acknowledge warning");
      }
      
      console.log("HRContext - Warning acknowledged successfully");
      
      // Update the warnings state with the acknowledged warning
      setWarnings(prevWarnings =>
        prevWarnings.map(warning =>
          warning._id === warningId
            ? { ...warning, acknowledged: true, acknowledgedDate: new Date() }
            : warning
        )
      );
      
      // Update active warnings
      setActiveWarnings(prev => prev.filter(warning => warning._id !== warningId));
      
      setWarningAcknowledged(true);
      return true;
    } catch (error) {
      console.error('Error acknowledging warning:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaves for the current user
  const fetchUserLeaves = async () => {
    if (!token || !serverAvailable || !user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/leaves/user/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      } else {
        throw new Error('Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all leaves (for managers and HR)
  const fetchAllLeaves = async () => {
    if (!token || !serverAvailable) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/hr/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      } else {
        throw new Error('Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new leave request
  const createLeaveRequest = async (leaveData) => {
    if (!token || !serverAvailable) return null;
    
    setLoading(true);
    try {
      const response = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leaveData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(prev => [...prev, data]);
        return data;
      } else {
        throw new Error('Failed to create leave request');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update leave request status (manager approval)
  const updateLeaveRequestByManager = async (leaveId, approved, comments) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/leaves/${leaveId}/manager-approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved, comments })
      });
      
      if (response.ok) {
        const updatedLeave = await response.json();
        setLeaves(prev => 
          prev.map(leave => 
            leave._id === leaveId ? updatedLeave : leave
          )
        );
        return true;
      } else {
        throw new Error('Failed to update leave request');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update leave request status (HR approval)
  const updateLeaveRequestByHR = async (leaveId, approved, comments) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/leaves/${leaveId}/hr-approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved, comments })
      });
      
      if (response.ok) {
        const updatedLeave = await response.json();
        setLeaves(prev => 
          prev.map(leave => 
            leave._id === leaveId ? updatedLeave : leave
          )
        );
        return true;
      } else {
        throw new Error('Failed to update leave request');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add GM signature to leave request
  const addGMSignatureToLeave = async (leaveId) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/leaves/${leaveId}/gm-signature`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const updatedLeave = await response.json();
        setLeaves(prev => 
          prev.map(leave => 
            leave._id === leaveId ? updatedLeave : leave
          )
        );
        return true;
      } else {
        throw new Error('Failed to add GM signature');
      }
    } catch (error) {
      console.error('Error adding GM signature:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch payroll for the current user
  const fetchUserPayroll = async () => {
    if (!token || !serverAvailable || !user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/payroll/user/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data);
      } else {
        throw new Error('Failed to fetch payroll');
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all payrolls (for HR admin)
  const fetchAllPayrolls = async () => {
    if (!token || !serverAvailable || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/hr/payroll', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data);
      } else {
        throw new Error('Failed to fetch payrolls');
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new payroll
  const createPayroll = async (payrollData) => {
    if (!token || !serverAvailable) return null;
    
    setLoading(true);
    try {
      const response = await fetch('/api/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payrollData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayrolls(prev => [...prev, data]);
        return data;
      } else {
        throw new Error('Failed to create payroll');
      }
    } catch (error) {
      console.error('Error creating payroll:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add addition to payroll
  const addPayrollAddition = async (payrollId, additionData) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/payroll/${payrollId}/addition`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(additionData)
      });
      
      if (response.ok) {
        const updatedPayroll = await response.json();
        setPayrolls(prev => 
          prev.map(payroll => 
            payroll._id === payrollId ? updatedPayroll : payroll
          )
        );
        return true;
      } else {
        throw new Error('Failed to add payroll addition');
      }
    } catch (error) {
      console.error('Error adding payroll addition:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add deduction to payroll
  const addPayrollDeduction = async (payrollId, deductionData) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/payroll/${payrollId}/deduction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deductionData)
      });
      
      if (response.ok) {
        const updatedPayroll = await response.json();
        setPayrolls(prev => 
          prev.map(payroll => 
            payroll._id === payrollId ? updatedPayroll : payroll
          )
        );
        return true;
      } else {
        throw new Error('Failed to add payroll deduction');
      }
    } catch (error) {
      console.error('Error adding payroll deduction:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update payroll status
  const updatePayrollStatus = async (payrollId, status) => {
    if (!token || !serverAvailable) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/hr/payroll/${payrollId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedPayroll = await response.json();
        setPayrolls(prev => 
          prev.map(payroll => 
            payroll._id === payrollId ? updatedPayroll : payroll
          )
        );
        return true;
      } else {
        throw new Error('Failed to update payroll status');
      }
    } catch (error) {
      console.error('Error updating payroll status:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset warning acknowledgment state
  const resetWarningAcknowledged = () => {
    setWarningAcknowledged(false);
  };

  // Load initial data when user logs in
  useEffect(() => {
    if (user && token && serverAvailable) {
      fetchUserWarnings();
      fetchUserLeaves();
      fetchUserPayroll();
      
      // If user is HR admin or manager, fetch additional data
      if (user.role === 'admin' || user.department === 'HR') {
        fetchEmployees();
        fetchAllWarnings();
        fetchAllLeaves();
        fetchAllPayrolls();
      }
    }
  }, [user, token, serverAvailable]);

  return (
    <HRContext.Provider value={{
      // State
      employees,
      warnings,
      leaves,
      payrolls,
      loading,
      error,
      activeWarnings,
      warningAcknowledged,
      
      // Employee functions
      fetchEmployees,
      
      // Warning functions
      fetchUserWarnings,
      fetchAllWarnings,
      createWarning,
      updateWarning,
      deleteWarning,
      acknowledgeWarning,
      resetWarningAcknowledged,
      
      // Leave functions
      fetchUserLeaves,
      fetchAllLeaves,
      createLeaveRequest,
      updateLeaveRequestByManager,
      updateLeaveRequestByHR,
      addGMSignatureToLeave,
      
      // Payroll functions
      fetchUserPayroll,
      fetchAllPayrolls,
      createPayroll,
      addPayrollAddition,
      addPayrollDeduction,
      updatePayrollStatus
    }}>
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  return useContext(HRContext);
};