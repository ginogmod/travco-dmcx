/**
 * Utility functions for managing warnings in localStorage
 */

const STORAGE_KEY = 'travcoWarnings';

/**
 * Get all warnings from localStorage
 * @returns {Array} Array of warning objects
 */
export const getWarnings = () => {
  try {
    const storedWarnings = localStorage.getItem(STORAGE_KEY);
    if (storedWarnings) {
      return JSON.parse(storedWarnings);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving warnings from localStorage:', error);
    return [];
  }
};

/**
 * Save warnings to localStorage
 * @param {Array} warnings Array of warning objects
 */
export const saveWarnings = (warnings) => {
  try {
    // Ensure dates are converted to strings for storage
    const storableWarnings = warnings.map(warning => ({
      ...warning,
      issuedDate: warning.issuedDate instanceof Date ? warning.issuedDate.toISOString() : warning.issuedDate,
      acknowledgedDate: warning.acknowledgedDate instanceof Date ? warning.acknowledgedDate.toISOString() : warning.acknowledgedDate,
      expiryDate: warning.expiryDate instanceof Date ? warning.expiryDate.toISOString() : warning.expiryDate,
      updatedAt: warning.updatedAt instanceof Date ? warning.updatedAt.toISOString() : warning.updatedAt
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storableWarnings));
    return true;
  } catch (error) {
    console.error('Error saving warnings to localStorage:', error);
    return false;
  }
};

/**
 * Add a new warning to localStorage
 * @param {Object} warning Warning object to add
 * @returns {Object|null} The added warning or null if operation failed
 */
export const addWarning = (warning) => {
  try {
    const warnings = getWarnings();
    
    // Generate a unique ID if not provided
    if (!warning._id) {
      warning._id = `w${Date.now()}`;
    }
    
    // Ensure employeeId is stored as a string for consistent comparison
    warning.employeeId = String(warning.employeeId);
    
    // Add the warning to the array
    warnings.push(warning);
    
    // Save the updated array
    saveWarnings(warnings);
    
    return warning;
  } catch (error) {
    console.error('Error adding warning to localStorage:', error);
    return null;
  }
};

/**
 * Update an existing warning in localStorage
 * @param {string} warningId ID of the warning to update
 * @param {Object} warningData Updated warning data
 * @returns {Object|null} The updated warning or null if operation failed
 */
export const updateWarning = (warningId, warningData) => {
  try {
    const warnings = getWarnings();
    
    // Find the warning to update
    const index = warnings.findIndex(w => w._id === warningId);
    
    if (index === -1) {
      console.error('Warning not found with ID:', warningId);
      return null;
    }
    
    // Ensure employeeId is stored as a string for consistent comparison
    if (warningData.employeeId) {
      warningData.employeeId = String(warningData.employeeId);
    }
    
    // Update the warning
    warnings[index] = {
      ...warnings[index],
      ...warningData,
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated array
    saveWarnings(warnings);
    
    return warnings[index];
  } catch (error) {
    console.error('Error updating warning in localStorage:', error);
    return null;
  }
};

/**
 * Delete a warning from localStorage
 * @param {string} warningId ID of the warning to delete
 * @returns {boolean} True if successful, false otherwise
 */
export const deleteWarning = (warningId) => {
  try {
    const warnings = getWarnings();
    
    // Filter out the warning to delete
    const updatedWarnings = warnings.filter(warning => warning._id !== warningId);
    
    // Save the updated array
    saveWarnings(updatedWarnings);
    
    return true;
  } catch (error) {
    console.error('Error deleting warning from localStorage:', error);
    return false;
  }
};

/**
 * Acknowledge a warning in localStorage
 * @param {string} warningId ID of the warning to acknowledge
 * @returns {boolean} True if successful, false otherwise
 */
export const acknowledgeWarning = (warningId) => {
  try {
    const warnings = getWarnings();
    
    // Find the warning to acknowledge
    const index = warnings.findIndex(w => w._id === warningId);
    
    if (index === -1) {
      console.error('Warning not found with ID:', warningId);
      return false;
    }
    
    // Update the warning
    warnings[index] = {
      ...warnings[index],
      acknowledged: true,
      acknowledgedDate: new Date().toISOString()
    };
    
    // Save the updated array
    saveWarnings(warnings);
    
    return true;
  } catch (error) {
    console.error('Error acknowledging warning in localStorage:', error);
    return false;
  }
};

/**
 * Get warnings for a specific employee
 * @param {string} employeeId ID of the employee
 * @returns {Array} Array of warning objects for the employee
 */
export const getEmployeeWarnings = (employeeId) => {
  try {
    const warnings = getWarnings();
    
    // Filter warnings for the employee
    return warnings.filter(warning => String(warning.employeeId) === String(employeeId));
  } catch (error) {
    console.error('Error getting employee warnings from localStorage:', error);
    return [];
  }
};

/**
 * Get active warnings for a specific employee
 * @param {string} employeeId ID of the employee
 * @returns {Array} Array of active warning objects for the employee
 */
export const getActiveEmployeeWarnings = (employeeId) => {
  try {
    const warnings = getEmployeeWarnings(employeeId);
    
    // Filter active warnings (not acknowledged and not expired)
    return warnings.filter(warning => 
      !warning.acknowledged && 
      (!warning.expiryDate || new Date(warning.expiryDate) > new Date())
    );
  } catch (error) {
    console.error('Error getting active employee warnings from localStorage:', error);
    return [];
  }
};

/**
 * Initialize sample warnings if none exist
 * @param {Array} employees Array of employee objects
 * @returns {Array} Array of created sample warnings
 */
export const initializeSampleWarnings = (employees) => {
  try {
    const existingWarnings = getWarnings();
    
    if (existingWarnings.length > 0) {
      return existingWarnings;
    }
    
    // Create sample warnings
    const sampleWarnings = [
      {
        _id: 'w1',
        employeeId: "4", // Laith Hamad Mohammad Al-Jibawi (ID: 4)
        title: 'Late Arrival',
        description: 'Consistently arriving late to work for the past week.',
        severity: 'medium',
        issuedBy: 'nour.alhajoj',
        issuedDate: new Date(2025, 7, 5).toISOString(),
        acknowledgementRequired: true,
        acknowledged: false,
        expiryDate: new Date(2025, 8, 5).toISOString()
      },
      {
        _id: 'w2',
        employeeId: "9", // Aya Khaldoun Khalil Al-Besheiti (ID: 9)
        title: 'Missed Deadline',
        description: 'Failed to complete the quarterly report by the deadline.',
        severity: 'high',
        issuedBy: 'nour.alhajoj',
        issuedDate: new Date(2025, 7, 3).toISOString(),
        acknowledgementRequired: true,
        acknowledged: true,
        acknowledgedDate: new Date(2025, 7, 4).toISOString(),
        expiryDate: new Date(2025, 8, 3).toISOString()
      },
      {
        _id: 'w3',
        employeeId: "8", // Omar Khalil Abu Asba (ID: 8)
        title: 'Dress Code Violation',
        description: 'Not adhering to company dress code policy.',
        severity: 'low',
        issuedBy: 'nour.alhajoj',
        issuedDate: new Date(2025, 7, 1).toISOString(),
        acknowledgementRequired: true,
        acknowledged: false,
        expiryDate: new Date(2025, 8, 1).toISOString()
      }
    ];
    
    // Save the sample warnings
    saveWarnings(sampleWarnings);
    
    return sampleWarnings;
  } catch (error) {
    console.error('Error initializing sample warnings:', error);
    return [];
  }
};