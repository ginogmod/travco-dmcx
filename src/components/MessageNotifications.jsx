import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../context/MessagesContext';
import { useNavigate } from 'react-router-dom';

const MessageNotifications = () => {
  // Using dark theme as default since we removed theme toggle
  const theme = 'dark';
  const navigate = useNavigate();
  const { getUnreadMessages, markAsRead, markAllAsRead } = useMessages();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const notificationRef = useRef(null);

  // Check for unread messages
  useEffect(() => {
    const messages = getUnreadMessages();
    setUnreadMessages(messages);
    
    // Show notifications if there are unread messages
    if (messages.length > 0) {
      setShowNotifications(true);
    }
  }, [getUnreadMessages]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = (messageId) => {
    markAsRead(messageId);
    setUnreadMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Close notifications if there are no more unread messages
    if (unreadMessages.length <= 1) {
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setUnreadMessages([]);
    setShowNotifications(false);
  };

  // Styles
  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    maxWidth: '350px',
    width: '100%'
  };

  const notificationBoxStyle = {
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    animation: 'slideIn 0.3s ease-out'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: theme === 'dark' ? '#222' : '#f8f8f8',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: theme === 'dark' ? '#fff' : '#333'
  };

  const messageListStyle = {
    maxHeight: '300px',
    overflowY: 'auto'
  };

  const messageItemStyle = {
    padding: '12px 15px',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5'
    }
  };

  const senderStyle = {
    fontWeight: 'bold',
    marginBottom: '5px'
  };

  const contentStyle = {
    marginBottom: '5px',
    wordBreak: 'break-word'
  };

  const timestampStyle = {
    fontSize: '12px',
    opacity: 0.7
  };

  const footerStyle = {
    padding: '10px 15px',
    textAlign: 'center',
    borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const markAllReadButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#1a73e8',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to parse message content and extract link information
  const parseMessageContent = (content) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.text && parsed.link) {
        return {
          text: parsed.text,
          link: parsed.link
        };
      }
    } catch (e) {
      // Not a JSON string, return as is
    }
    
    return { text: content };
  };

  if (!showNotifications || unreadMessages.length === 0) {
    return null;
  }

  return (
    <div style={containerStyle} ref={notificationRef}>
      <div style={notificationBoxStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>New Messages ({unreadMessages.length})</h3>
          <button 
            style={closeButtonStyle} 
            onClick={() => setShowNotifications(false)}
          >
            ×
          </button>
        </div>
        
        <div style={messageListStyle}>
          {unreadMessages.map(message => (
            <div 
              key={message.id} 
              style={messageItemStyle}
              onClick={() => {
                handleMarkAsRead(message.id);
                navigate('/messages');
              }}
            >
              <div style={senderStyle}>From: {message.senderName}</div>
              <div style={contentStyle}>
                {(() => {
                  const parsedContent = parseMessageContent(message.content);
                  return (
                    <>
                      {parsedContent.text}
                      {parsedContent.link && (
                        <div style={{
                          marginTop: '5px',
                          fontSize: '12px',
                          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          🔗 {parsedContent.link.type.charAt(0).toUpperCase() + parsedContent.link.type.slice(1)} #{parsedContent.link.id}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div style={timestampStyle}>{formatTimestamp(message.timestamp)}</div>
            </div>
          ))}
        </div>
        
        <div style={footerStyle}>
          <button 
            style={markAllReadButtonStyle}
            onClick={() => {
              handleMarkAllAsRead();
              navigate('/messages');
            }}
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageNotifications;