import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import { Link } from 'react-router-dom';

const AgencyDashboard = () => {
    const { user } = useAuth();
    const { agencies, tiers } = usePoints();

    // Find the specific agency's data from the PointsContext
    const agencyData = agencies.find(a => a.id === user.id);

    if (!agencyData) {
        return (
            <div style={styles.container}>
                <h2>Loading agency data...</h2>
                <p>If this takes too long, please try logging out and back in.</p>
            </div>
        );
    }

    const { name, points, tier, history } = agencyData;
    const currentTierInfo = tiers.find(t => t.name === tier);

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Welcome, {name}</h1>
            <p style={styles.subheader}>Here is your rewards summary.</p>

            <div style={styles.cardContainer}>
                {/* Points Card */}
                <div style={styles.card}>
                    <h3>Total Points</h3>
                    <p style={styles.pointsDisplay}>{points}</p>
                </div>

                {/* Tier Card */}
                <div style={styles.card}>
                    <h3>Current Tier</h3>
                    <p style={styles.tierDisplay}>{tier}</p>
                    <p><strong>Benefits:</strong> {currentTierInfo ? currentTierInfo.benefits : 'N/A'}</p>
                </div>
            </div>

            {/* Points History */}
            <div style={styles.historySection}>
                <h2>Your Points History</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Activity</th>
                            <th style={styles.th}>Points Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map((item, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{item.date}</td>
                                    <td style={styles.td}>{item.activity}</td>
                                    <td style={styles.td}>{item.points}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                    You haven't earned any points yet. Start booking to see your history!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Link to="/marketing/points-system/instructions" style={styles.button}>How to Earn More Points</Link>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', color: '#e0e0e0', fontFamily: 'Segoe UI, sans-serif', background: '#121212', minHeight: '100vh' },
    header: { textAlign: 'center', color: '#00aaff' },
    subheader: { textAlign: 'center', color: '#aaa', marginBottom: '40px' },
    cardContainer: { display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' },
    card: {
        background: '#1f1f1f',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        textAlign: 'center',
        width: '280px',
        border: '1px solid #444',
    },
    pointsDisplay: { fontSize: '48px', fontWeight: 'bold', color: '#00aaff', margin: '10px 0' },
    tierDisplay: { fontSize: '36px', fontWeight: 'bold', color: '#4caf50', margin: '10px 0' },
    historySection: { marginTop: '40px', background: '#1f1f1f', padding: '20px', borderRadius: '8px', border: '1px solid #444' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { borderBottom: '2px solid #444', padding: '12px', background: '#333', textAlign: 'left' },
    td: { borderBottom: '1px solid #444', padding: '12px' },
    button: {
        display: 'inline-block',
        padding: '12px 25px',
        fontSize: '1em',
        cursor: 'pointer',
        textAlign: 'center',
        textDecoration: 'none',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '5px',
    }
};

export default AgencyDashboard;