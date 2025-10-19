import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AgencyLoginPage = () => {
    const [agencyId, setAgencyId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, you'd validate against a backend.
        // For this demo, we'll accept any ID that starts with 'A' and any password.
        if (agencyId.startsWith('A') && password) {
            const agencyUser = {
                name: `Agency ${agencyId}`,
                role: 'Agency', // Custom role for agencies
                id: agencyId,
            };
            login(agencyUser);
            navigate('/agency/dashboard');
        } else {
            setError('Invalid credentials. Agency ID must start with "A".');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h2>Agency Portal Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Agency ID"
                        value={agencyId}
                        onChange={(e) => setAgencyId(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Login</button>
                    {error && <p style={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#121212',
    },
    loginBox: {
        padding: '40px',
        background: '#1f1f1f',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        textAlign: 'center',
        width: '350px',
        color: '#e0e0e0',
    },
    input: {
        width: '100%',
        padding: '12px',
        margin: '10px 0',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px solid #555',
        background: '#333',
        color: 'white',
    },
    button: {
        width: '100%',
        padding: '12px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: '#ff4d4d',
        marginTop: '10px',
    },
};

export default AgencyLoginPage;