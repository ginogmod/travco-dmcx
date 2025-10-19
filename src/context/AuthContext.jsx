import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || localStorage.getItem('travcoUser')));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [serverAvailable, setServerAvailable] = useState(false);
    const [serverCheckTime, setServerCheckTime] = useState(0);
    const SERVER_CHECK_INTERVAL = 30000; // 30 seconds

    // Check if server is available
    useEffect(() => {
        const checkServer = async () => {
            try {
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
                
                setServerAvailable(response.ok);
                setServerCheckTime(Date.now());
            } catch (error) {
                console.log('Server API not available, using localStorage fallback');
                setServerAvailable(false);
                setServerCheckTime(Date.now());
            }
        };

        const now = Date.now();
        if (token && (now - serverCheckTime > SERVER_CHECK_INTERVAL)) {
            checkServer();
        }
    }, [token, serverCheckTime]);

    const login = async (credentials) => {
        setLoading(true);
        
        try {
            // Try API-based login first
            try {
                // Use a timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials),
                    signal: controller.signal
                }).catch(() => ({ ok: false }));
                
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // Backward compatibility for modules reading 'travcoUser'
                    localStorage.setItem('travcoUser', JSON.stringify(data.user));
                    setToken(data.token);
                    setUser(data.user);
                    setServerAvailable(true);
                    setServerCheckTime(Date.now());
                    setLoading(false);
                    return true;
                }
            } catch (apiError) {
                console.log('API login failed, trying localStorage fallback');
            }
            
            // Fallback to localStorage-based login
            // This is for backward compatibility during migration
            // Import employees data dynamically
            const employees = await import('../data/employeesData').then(module => module.default);
            
            // Find user with matching credentials
            const user = employees.find(
                (u) => u.username === credentials.username && u.password === credentials.password
            );
            
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                // Backward compatibility for modules reading 'travcoUser'
                localStorage.setItem('travcoUser', JSON.stringify(user));
                setUser(user);
                setLoading(false);
                return true;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        try {
            // Remove user-specific unread cache if present
            const currentUser = JSON.parse(
                localStorage.getItem('user') || localStorage.getItem('travcoUser') || 'null'
            );
            if (currentUser?.username) {
                localStorage.removeItem(`unreadMessages_${currentUser.username}`);
            }
        } catch (e) {
            console.error('Error during logout cleanup:', e);
        }

        // Clear all auth-related storage keys
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('travcoUser');

        // Reset auth state
        setToken(null);
        setUser(null);

        // Force navigation to login to avoid stale routes after logout
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isAuthenticated: !!user,
            loading,
            serverAvailable
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};