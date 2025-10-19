import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const WarningNotification = ({ children }) => {
  const { warnings, acknowledgeWarning, warningAcknowledged, resetWarningAcknowledged, fetchUserWarnings } = useHR();
  const { user } = useAuth();
  const [currentWarningIndex, setCurrentWarningIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [userWarnings, setUserWarnings] = useState([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Fetch warnings for the current user
  useEffect(() => {
    if (user) {
      console.log("WarningNotification - Fetching user warnings");
      fetchUserWarnings();
      setLastRefreshTime(Date.now());
    }
  }, [user, fetchUserWarnings]);
  
  // Refresh warnings periodically (every 30 seconds) to catch new warnings
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = setInterval(() => {
      console.log("WarningNotification - Refreshing warnings");
      fetchUserWarnings();
      setLastRefreshTime(Date.now());
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [user, fetchUserWarnings]);
  
  // Refresh warnings when the component is focused (user returns to the tab)
  useEffect(() => {
    if (!user) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if it's been more than 10 seconds since the last refresh
        if (Date.now() - lastRefreshTime > 10000) {
          console.log("WarningNotification - Page visible, refreshing warnings");
          fetchUserWarnings();
          setLastRefreshTime(Date.now());
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchUserWarnings, lastRefreshTime]);

  // Filter active warnings for the current user
  useEffect(() => {
    if (warnings && warnings.length > 0 && user) {
      console.log("Current user:", user);
      console.log("Available warnings:", warnings);
      
      // Filter warnings that are for this user, require acknowledgment, are not acknowledged, and not expired
      const activeUserWarnings = warnings.filter(warning => {
        // Convert both to strings for comparison and log for debugging
        const warningEmployeeId = String(warning.employeeId);
        const userId = String(user.id);
        
        console.log(`Comparing warning employeeId: ${warningEmployeeId} with user.id: ${userId}`);
        
        return warningEmployeeId === userId &&
               warning.acknowledgementRequired &&
               !warning.acknowledged &&
               (!warning.expiryDate || new Date(warning.expiryDate) > new Date());
      });
      
      console.log("Active user warnings:", activeUserWarnings);
      
      setUserWarnings(activeUserWarnings);
      
      if (activeUserWarnings.length > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    } else {
      setShowWarning(false);
    }
  }, [warnings, user]);

  // Reset when warning is acknowledged
  useEffect(() => {
    if (warningAcknowledged) {
      // Move to next warning if there are more
      if (currentWarningIndex < userWarnings.length - 1) {
        setCurrentWarningIndex(prev => prev + 1);
      } else {
        // All warnings acknowledged
        setShowWarning(false);
        setCurrentWarningIndex(0);
      }
      
      // Reset the acknowledged state
      resetWarningAcknowledged();
    }
  }, [warningAcknowledged, currentWarningIndex, userWarnings, resetWarningAcknowledged]);

  const handleAcknowledge = async () => {
    if (userWarnings && userWarnings.length > 0) {
      const warning = userWarnings[currentWarningIndex];
      await acknowledgeWarning(warning._id);
    }
  };

  // If there are no active warnings or user is not logged in, just render children
  if (!showWarning || !user || userWarnings.length === 0) {
    return children;
  }

  // Get the current warning
  const currentWarning = userWarnings[currentWarningIndex];

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine severity class
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="relative">
      {/* Modal Overlay */}
      <div className="hr-warning-modal">
        <div className="hr-warning-content">
          {/* Warning Header */}
          <div className={`hr-warning-header ${
            currentWarning.severity === 'high'
              ? 'bg-red-600'
              : currentWarning.severity === 'medium'
                ? 'bg-orange-500'
                : 'bg-yellow-500'
          } text-white`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Warning Notification</h2>
              <span className="px-2 py-1 bg-white text-gray-800 rounded text-sm">
                {currentWarningIndex + 1} of {userWarnings.length}
              </span>
            </div>
          </div>
          
          {/* Warning Content */}
          <div className="hr-warning-body">
            <h3 className="hr-card-title mb-2">{currentWarning.title}</h3>
            <div className="mb-4 text-sm text-gray-500">
              Issued on: {formatDate(currentWarning.issuedDate)}
              {currentWarning.expiryDate && (
                <span> | Expires on: {formatDate(currentWarning.expiryDate)}</span>
              )}
            </div>
            <div className="mb-6 whitespace-pre-wrap">
              {currentWarning.description}
            </div>
            
            <div className="hr-warning-footer">
              <p className="text-sm text-gray-500 mb-4">
                You must acknowledge this warning to continue using the system.
              </p>
              <button
                onClick={handleAcknowledge}
                className="hr-button hr-button-primary w-full"
              >
                I Acknowledge This Warning
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render children but they're not accessible until warnings are acknowledged */}
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default WarningNotification;