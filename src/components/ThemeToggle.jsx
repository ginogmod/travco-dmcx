import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const toggleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '6px',
    backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
    color: theme === 'dark' ? 'white' : '#333',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const iconStyle = {
    fontSize: '16px'
  };

  return (
    <div style={toggleStyle} onClick={toggleTheme}>
      <span>
        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </span>
      <span style={iconStyle}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </div>
  );
};

export default ThemeToggle;