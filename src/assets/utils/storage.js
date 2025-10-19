// src/assets/utils/storage.js

// Helper function to get the authentication token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to check if server is available
// Cache server availability status with a timeout
let serverAvailableCache = false;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 30000; // 30 seconds

const isServerAvailable = async () => {
  const now = Date.now();
  
  // Use cached value if it's recent enough
  if (now - lastServerCheck < SERVER_CHECK_INTERVAL && serverAvailableCache !== null) {
    return serverAvailableCache;
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      serverAvailableCache = false;
      lastServerCheck = now;
      return false;
    }
    
    // Use a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    }).catch(() => ({ ok: false }));
    
    clearTimeout(timeoutId);
    
    serverAvailableCache = response.ok;
    lastServerCheck = now;
    return response.ok;
  } catch (error) {
    console.log('Server API not available, using localStorage fallback');
    serverAvailableCache = false;
    lastServerCheck = now;
    return false;
  }
};

// Helper function to handle API errors
const handleApiError = (response) => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Map storage keys to API endpoints
const getEndpoint = (key) => {
  const endpoints = {
    'messages': '/api/messages',
    'reservations': '/api/reservations',
    'quotations': '/api/quotations',
    'offers': '/api/offers'
  };
  
  return endpoints[key] || `/api/${key}`;
};

// Save a new item to the server or localStorage
export const saveToStorage = async (key, item) => {
  // Always prepare the localStorage version first
  const all = JSON.parse(localStorage.getItem(key) || "[]");
  const record = { id: Date.now(), createdAt: new Date().toISOString(), ...item };
  
  // Try server if available
  try {
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
      const endpoint = getEndpoint(key);
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item),
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        const serverRecord = await response.json();
        
        // Update localStorage with server record for consistency
        all.push(serverRecord);
        localStorage.setItem(key, JSON.stringify(all));
        
        return serverRecord;
      }
    }
  } catch (error) {
    console.error(`Error saving to ${key} via API:`, error);
  }
  
  // Always fall back to localStorage if server fails
  all.push(record);
  localStorage.setItem(key, JSON.stringify(all));
  
  return record;
};

// Get all items from the server or localStorage
export const getAllFromStorage = async (key) => {
  // Always prepare the localStorage version first
  const localData = JSON.parse(localStorage.getItem(key) || "[]");
  
  // Try server if available
  try {
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
      const endpoint = getEndpoint(key);
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        const serverData = await response.json();
        
        // Update localStorage with server data for future use
        localStorage.setItem(key, JSON.stringify(serverData));
        
        return serverData;
      }
    }
  } catch (error) {
    console.error(`Error getting all from ${key} via API:`, error);
  }
  
  // Always return localStorage data if server fails
  return localData;
};

// Get a single item from the server or localStorage by ID
export const getOneFromStorage = async (key, id) => {
  // Always prepare the localStorage version first
  const all = JSON.parse(localStorage.getItem(key) || "[]");
  const localItem = all.find(r => String(r.id) === String(id));
  
  // Try server if available
  try {
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
      const endpoint = `${getEndpoint(key)}/${id}`;
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        const serverItem = await response.json();
        
        // Update the item in localStorage for future use
        const updatedAll = all.map(item =>
          String(item.id) === String(id) ? serverItem : item
        );
        localStorage.setItem(key, JSON.stringify(updatedAll));
        
        return serverItem;
      }
    }
  } catch (error) {
    console.error(`Error getting one from ${key} via API:`, error);
  }
  
  // Always return localStorage item if server fails
  return localItem;
};

// Update an item on the server or in localStorage
export const updateInStorage = async (key, id, updatedFields) => {
  // Always prepare the localStorage version first
  const all = JSON.parse(localStorage.getItem(key) || "[]");
  const idx = all.findIndex(r => String(r.id) === String(id));
  
  if (idx < 0) return null;
  
  const updatedItem = { ...all[idx], ...updatedFields };
  
  // Try server if available
  try {
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
      const endpoint = `${getEndpoint(key)}/${id}`;
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields),
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        const serverItem = await response.json();
        
        // Update localStorage with server item
        all[idx] = serverItem;
        localStorage.setItem(key, JSON.stringify(all));
        
        return serverItem;
      }
    }
  } catch (error) {
    console.error(`Error updating in ${key} via API:`, error);
  }
  
  // Always update localStorage if server fails
  all[idx] = updatedItem;
  localStorage.setItem(key, JSON.stringify(all));
  return updatedItem;
};

// Delete an item from the server or localStorage
export const deleteFromStorage = async (key, id) => {
  // Always prepare the localStorage version first
  const all = JSON.parse(localStorage.getItem(key) || "[]");
  const filtered = all.filter(r => String(r.id) !== String(id));
  
  // Try server if available
  try {
    const serverAvailable = await isServerAvailable();
    
    if (serverAvailable) {
      const endpoint = `${getEndpoint(key)}/${id}`;
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        // Update localStorage to match server
        localStorage.setItem(key, JSON.stringify(filtered));
        return await response.json();
      }
    }
  } catch (error) {
    console.error(`Error deleting from ${key} via API:`, error);
  }
  
  // Always update localStorage if server fails
  localStorage.setItem(key, JSON.stringify(filtered));
  return filtered;
};

// Synchronous versions for backward compatibility
// These now return the localStorage data directly without trying to access the server
// This ensures they continue to work in components that haven't been updated to use async/await
export const getAllFromStorageSync = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    console.error(`Error in getAllFromStorageSync for ${key}:`, error);
    return [];
  }
};

export const getOneFromStorageSync = (key, id) => {
  try {
    const items = getAllFromStorageSync(key);
    return items.find(r => String(r.id) === String(id));
  } catch (error) {
    console.error(`Error in getOneFromStorageSync for ${key}/${id}:`, error);
    return null;
  }
};

// Add a function to check if data exists in localStorage
export const hasDataInStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data && data !== "[]" && data !== "{}";
  } catch (error) {
    console.error(`Error checking if data exists in storage for ${key}:`, error);
    return false;
  }
};
