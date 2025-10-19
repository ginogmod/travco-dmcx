import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePoints } from '../../context/PointsContext';

const PointsSystem = () => {
    const { agencies, tiers, addPoints, setTiers } = usePoints();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState(null);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredAgencies = agencies.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const AdminControls = () => {
        const [selectedAgencyId, setSelectedAgencyId] = useState(agencies.length > 0 ? agencies[0].id : '');
        const [points, setPoints] = useState('');
        const [reason, setReason] = useState('');
        const [tierBenefits, setTierBenefits] = useState(tiers);

        const handleBenefitChange = (index, value) => {
            const updatedTiers = [...tierBenefits];
            updatedTiers[index].benefits = value;
            setTierBenefits(updatedTiers);
        };

        const handleSaveBenefits = () => {
            setTiers(tierBenefits);
            alert('Tier benefits saved!');
        };
        
        const handlePointSubmit = () => {
            if (!selectedAgencyId || !points || !reason) {
                alert('Please fill all fields for point adjustment.');
                return;
            }
            addPoints(selectedAgencyId, parseInt(points, 10), reason);
            setPoints('');
            setReason('');
        };

        return (
            <div style={styles.adminSection}>
                <h2>Admin Controls</h2>
                {/* Manual Point Adjustment */}
                <div style={styles.controlBox}>
                    <h3>Manually Add/Deduct Points</h3>
                    <select style={styles.input} value={selectedAgencyId} onChange={e => setSelectedAgencyId(e.target.value)}>
                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input type="number" placeholder="Points (+/-)" style={styles.input} value={points} onChange={e => setPoints(e.target.value)} />
                    <input type="text" placeholder="Reason" style={styles.input} value={reason} onChange={e => setReason(e.target.value)} />
                    <button style={styles.button} onClick={handlePointSubmit}>Submit</button>
                </div>

                {/* Tier Management */}
                <div style={styles.controlBox}>
                    <h3>Reward Tiers</h3>
                    {tierBenefits.map((tier, index) => (
                        <div key={tier.name} style={{ marginBottom: '10px' }}>
                            <strong>{tier.name} ({tier.range}):</strong>
                            <input type="text" value={tier.benefits} onChange={(e) => handleBenefitChange(index, e.target.value)} style={{ ...styles.input, marginLeft: '10px' }} />
                        </div>
                    ))}
                    <button style={styles.button} onClick={handleSaveBenefits}>Save Tier Benefits</button>
                </div>
                 <div style={styles.controlBox}>
                    <h3>Export Reports</h3>
                    <button style={styles.button}>Export Performance Report</button>
                </div>
            </div>
        );
    };

    const Dashboard = () => (
        <div>
            <input
                type="text"
                placeholder="Search for an agency..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchInput}
            />
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Agency ID</th>
                        <th style={styles.th}>Agency Name</th>
                        <th style={styles.th}>Points</th>
                        <th style={styles.th}>Tier</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAgencies.map(agency => (
                        <tr key={agency.id}>
                            <td style={styles.td}>{agency.id}</td>
                            <td style={styles.td}>{agency.name}</td>
                            <td style={styles.td}>{agency.points}</td>
                            <td style={styles.td}>{agency.tier}</td>
                            <td style={styles.td}>
                                <button onClick={() => setSelectedAgency(agency)} style={styles.button}>View History</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const InstructionsAndRewards = () => (
        <div style={instructionStyles.container}>
            <h2 style={instructionStyles.header}>Understanding Your Rewards: The Points System</h2>
            <p style={instructionStyles.intro}>
                Welcome to our loyalty rewards program! We've designed this system to thank you for your partnership and reward you for your hard work. The more you book with us, the more points you earn, unlocking exclusive benefits and rewards.
            </p>

            {/* Section 1: Earning Points */}
            <div style={instructionStyles.section}>
                <h3 style={instructionStyles.sectionHeader}>&#x1F3AF; How to Accumulate Points</h3>
                <ul style={instructionStyles.list}>
                    <li style={instructionStyles.listItem}>
                        <strong>Standard Bookings:</strong> Earn <span style={instructionStyles.highlight}>10 points</span> for every single reservation you book with us.
                    </li>
                    <li style={instructionStyles.listItem}>
                        <strong>Premium Hotel Bonus:</strong> Get an additional <span style={instructionStyles.highlight}>+5 bonus points</span> for any booking that includes a 4-star or 5-star hotel.
                    </li>
                    <li style={instructionStyles.listItem}>
                        <strong>Corporate Referrals:</strong> Grow our network and get rewarded! If you refer a new corporate client to us and they sign a contract, you will receive a massive <span style={instructionStyles.highlight}>300 points</span>.
                    </li>
                </ul>
            </div>

            {/* Section 2: Tiers / Status Levels */}
            <div style={instructionStyles.section}>
                <h3 style={instructionStyles.sectionHeader}>&#x1F3C6; Point Tiers & Status Levels</h3>
                <p>Your status level is determined by the total points you accumulate. Each tier unlocks new benefits.</p>
                <table style={instructionStyles.table}>
                    <thead>
                        <tr>
                            <th style={instructionStyles.th}>Status</th>
                            <th style={instructionStyles.th}>Points Required</th>
                            <th style={instructionStyles.th}>Benefits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map(tier => (
                            <tr key={tier.name}>
                                <td style={instructionStyles.td}>{tier.name}</td>
                                <td style={instructionStyles.td}>{tier.range}</td>
                                <td style={instructionStyles.td}>{tier.benefits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Section 3: Redemption */}
            <div style={instructionStyles.section}>
                <h3 style={instructionStyles.sectionHeader}>&#x1F381; Redeeming Your Points</h3>
                <p>Your hard-earned points can be exchanged for a variety of valuable rewards, including:</p>
                <ul style={instructionStyles.list}>
                    <li style={instructionStyles.listItem}>Special discounts on future bookings.</li>
                    <li style={instructionStyles.listItem}>Complimentary airport pickup services.</li>
                    <li style={instructionStyles.listItem}>Room upgrades at participating hotels.</li>
                    <li style={instructionStyles.listItem}>Exclusive branded gifts, like Dead Sea spa kits.</li>
                </ul>
                <p>The full catalog of rewards will be available soon. Keep an eye on your dashboard!</p>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Gamified Points System</h1>

            <div style={styles.tabs}>
                <button onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? styles.activeTab : styles.tab}>Dashboard</button>
                <button onClick={() => setActiveTab('admin')} style={activeTab === 'admin' ? styles.activeTab : styles.tab}>Admin Controls</button>
                <button onClick={() => setActiveTab('instructions')} style={activeTab === 'instructions' ? styles.activeTab : styles.tab}>Instructions & Rewards</button>
            </div>

            <div style={styles.content}>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'admin' && <AdminControls />}
                {activeTab === 'instructions' && <InstructionsAndRewards />}
            </div>

            {selectedAgency && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <span style={styles.closeButton} onClick={() => setSelectedAgency(null)}>&times;</span>
                        <h2>Point History for {selectedAgency.name}</h2>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Activity</th>
                                    <th style={styles.th}>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAgency.history.map((item, index) => (
                                    <tr key={index}>
                                        <td style={styles.td}>{item.date}</td>
                                        <td style={styles.td}>{item.activity}</td>
                                        <td style={styles.td}>{item.points}</td>
                                    </tr>
                                ))}
                                 {selectedAgency.history.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{textAlign: 'center', padding: '10px'}}>No history available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Basic Styling ---
const styles = {
    container: { padding: '20px', color: '#e0e0e0' },
    header: { borderBottom: '2px solid #444', paddingBottom: '10px', color: '#fff' },
    tabs: { margin: '20px 0' },
    tab: { padding: '10px 20px', cursor: 'pointer', border: '1px solid #555', background: '#333', color: '#e0e0e0' },
    activeTab: { padding: '10px 20px', border: '1px solid #555', borderBottom: '1px solid #1f1f1f', background: '#1f1f1f', color: 'white' },
    content: { border: '1px solid #555', padding: '20px', background: '#2a2a2a' },
    searchInput: { width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', background: '#333', border: '1px solid #555', color: 'white' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { border: '1px solid #444', padding: '8px', background: '#333', textAlign: 'left' },
    td: { border: '1px solid #444', padding: '8px' },
    button: { cursor: 'pointer', padding: '8px 15px', borderRadius: '5px', border: 'none', background: '#007bff', color: 'white' },
    adminSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
    controlBox: { border: '1px solid #444', padding: '15px', borderRadius: '5px', background: '#333' },
    input: { padding: '8px', marginRight: '10px', borderRadius: '3px', border: '1px solid #555', background: '#444', color: 'white' },
    modal: { position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: '#2a2a2a', margin: '10% auto', padding: '20px', border: '1px solid #555', width: '60%', color: '#e0e0e0' },
    closeButton: { color: '#aaa', float: 'right', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' },
    instructionsLink: {
        textDecoration: 'none',
        color: '#00aaff',
        fontWeight: 'bold',
        fontSize: '1em',
    }
};

const instructionStyles = {
    container: { padding: '20px', color: '#e0e0e0', fontFamily: 'Segoe UI, sans-serif' },
    header: { borderBottom: '2px solid #444', paddingBottom: '10px', color: '#00aaff', textAlign: 'center' },
    intro: { fontSize: '1.1em', margin: '20px 0', lineHeight: '1.6' },
    section: { margin: '30px 0', background: '#2a2a2a', padding: '20px', borderRadius: '8px' },
    sectionHeader: { color: '#00aaff', borderBottom: '1px solid #444', paddingBottom: '8px', marginBottom: '15px' },
    list: { listStyleType: 'none', paddingLeft: 0 },
    listItem: { marginBottom: '10px', fontSize: '1.05em' },
    highlight: { color: '#ff8c00', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #444', padding: '12px', background: '#333', textAlign: 'left' },
    td: { border: '1px solid #444', padding: '12px' },
};

export default PointsSystem;