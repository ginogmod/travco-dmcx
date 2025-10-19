import React, { useState, useEffect } from 'react';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import EmployeeMessaging from './EmployeeMessaging';
// Using dark theme as default since we removed theme toggle
const theme = 'dark';

const Inbox = () => {
  const { user } = useAuth();
  const { getUnreadMessages, getUserMessages } = useMessages();
  const [showInbox, setShowInbox] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);

  // Get all employees from messages
  const getUniqueEmployees = () => {
    const uniqueEmployees = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender === user.username ? msg.receiver : msg.sender;
      const otherName = msg.sender === user.username ? 
        (msg.receiverName || otherUser) : 
        (msg.senderName || otherUser);
      
      if (!uniqueEmployees.has(otherUser)) {
        uniqueEmployees.set(otherUser, {
          username: otherUser,
          name: otherName,
          lastMessage: msg
        });
      } else {
        const existing = uniqueEmployees.get(otherUser);
        if (new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
          existing.lastMessage = msg;
          uniqueEmployees.set(otherUser, existing);
        }
      }
    });
    
    return Array.from(uniqueEmployees.values())
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  };

  // Check for unread messages
  useEffect(() => {
    const unreadMessages = getUnreadMessages();
    setUnreadCount(unreadMessages.length);
    
    const allMessages = getUserMessages();
    setMessages(allMessages);
    
    // Set up interval to check for new messages
    const interval = setInterval(() => {
      const newUnreadMessages = getUnreadMessages();
      setUnreadCount(newUnreadMessages.length);
      
      const newAllMessages = getUserMessages();
      setMessages(newAllMessages);
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [getUnreadMessages, getUserMessages]);

  const handleOpenMessaging = (employee) => {
    setSelectedEmployee(employee);
    setShowMessaging(true);
    setShowInbox(false);
  };

  const handleCloseMessaging = () => {
    setShowMessaging(false);
    setSelectedEmployee(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const inboxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '6px',
    backgroundColor: '#1a73e8',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const badgeStyle = {
    display: unreadCount > 0 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'red',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    marginTop: '5px',
    zIndex: 1000,
    maxHeight: '400px',
    overflowY: 'auto',
    display: showInbox ? 'block' : 'none'
  };

  const dropdownHeaderStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  };

  const conversationItemStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  };

  const employeeNameStyle = {
    fontWeight: 'bold'
  };

  const lastMessageStyle = {
    fontSize: '13px',
    color: '#666',
    marginTop: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px'
  };

  const timestampStyle = {
    fontSize: '12px',
    color: '#999'
  };

  const unreadIndicatorStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    marginLeft: '5px'
  };

  const emptyStateStyle = {
    padding: '20px',
    textAlign: 'center',
    color: '#666'
  };

  const employees = getUniqueEmployees();

  return (
    <div style={{ position: 'relative' }}>
      <div 
        style={inboxStyle} 
        onClick={() => setShowInbox(!showInbox)}
      >
        <span>Inbox</span>
        <span style={badgeStyle}>{unreadCount}</span>
      </div>
      
      <div style={dropdownStyle}>
        <div style={dropdownHeaderStyle}>
          <span>Messages</span>
          <button 
            onClick={() => setShowInbox(false)}
            style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        
        {employees.length === 0 ? (
          <div style={emptyStateStyle}>No messages yet</div>
        ) : (
          employees.map(employee => {
            const lastMessage = employee.lastMessage;
            const isUnread = !lastMessage.read && lastMessage.receiver === user.username;
            
            return (
              <div 
                key={employee.username} 
                style={conversationItemStyle}
                onClick={() => handleOpenMessaging(employee)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={employeeNameStyle}>{employee.name}</span>
                    {isUnread && <div style={unreadIndicatorStyle}></div>}
                  </div>
                  <div style={lastMessageStyle}>
                    {lastMessage.content}
                  </div>
                </div>
                <div style={timestampStyle}>
                  {formatTimestamp(lastMessage.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {showMessaging && selectedEmployee && (
        <EmployeeMessaging 
          employee={selectedEmployee} 
          onClose={handleCloseMessaging} 
        />
      )}
    </div>
  );
};

export default Inbox;