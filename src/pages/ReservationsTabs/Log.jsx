function Log({ fileNo }) {
  const logs = [
    { date: '2025-06-16', time: '16:45', user: 'Luigi', action: 'Created reservation' },
    { date: '2025-06-17', time: '09:15', user: 'Yazan', action: 'Updated itinerary' },
    // add more logs here
  ];

  return (
    <div style={{ color: 'white' }}>
      <h2>Activity Log – File: {fileNo}</h2>

      <div
        style={{
          backgroundColor: '#1f1f1f',
          borderRadius: '10px',
          padding: '25px',
          marginTop: '20px',
          border: '2px solid #888'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#333' }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #444' }}>
                <td style={tdStyle}>{log.date}</td>
                <td style={tdStyle}>{log.time}</td>
                <td style={tdStyle}>{log.user}</td>
                <td style={tdStyle}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid #555',
  color: 'white'
};

const tdStyle = {
  padding: '12px',
  verticalAlign: 'top',
  color: 'white'
};

export default Log;
