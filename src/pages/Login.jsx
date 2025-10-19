import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const { login, serverAvailable } = useAuth();
    const navigate = useNavigate();
    
    // Check server status on component mount
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                // Create an AbortController with manual timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch('/api/auth/status', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                }).catch(() => null);
                
                clearTimeout(timeoutId);
                
                if (response && response.ok) {
                    const status = await response.json();
                    setServerStatus(status.database === 'connected' ? 'online' : 'offline');
                } else {
                    setServerStatus('offline');
                }
            } catch (error) {
                console.error('Error checking server status:', error);
                setServerStatus('offline');
            }
        };
        
        checkServerStatus();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Use the login function from AuthContext
            // It now handles both API and local authentication
            const success = await login({ username, password });
            
            if (success) {
                navigate('/');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message.includes('fetch') || error.message.includes('network')) {
                setError('Cannot connect to server. Please check your internet connection.');
            } else {
                setError(error.message || 'Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container no-invert">
            <form onSubmit={handleLogin} className="login-form">
                <img src="/travco_logo_for_pdf.png" alt="Travco Group Logo" className="login-logo" />
                <h2>Login</h2>
                
                {/* Server status indicator */}
                <div className="server-status" style={{
                    textAlign: 'center',
                    marginBottom: '15px',
                    padding: '5px',
                    borderRadius: '4px',
                    backgroundColor: serverStatus === 'online' ? '#e6ffe6' :
                                    serverStatus === 'offline' ? '#ffe6e6' : '#f0f0f0',
                    color: serverStatus === 'online' ? '#006600' :
                           serverStatus === 'offline' ? '#cc0000' : '#666666'
                }}>
                    {serverStatus === 'checking' && 'Checking server status...'}
                    {serverStatus === 'online' && '✅ Server online - Data will sync across devices'}
                    {serverStatus === 'offline' && '⚠️ Server offline - Using local storage only'}
                </div>
                
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Username"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Password"
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                
                {serverStatus === 'offline' && (
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                        Note: While offline, your data will be stored locally and won't sync across devices.
                    </p>
                )}
            </form>
        </div>
    );
};

export default Login;