import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../context/MessagesContext';
import { useNavigate } from 'react-router-dom';

const EmployeeMessaging = ({ employee, onClose }) => {
  // Using dark theme as default since we removed theme toggle
  const theme = 'dark';
  const navigate = useNavigate();
  const { sendMessage, getConversation, markAsRead } = useMessages();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [notify, setNotify] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkType, setLinkType] = useState('');
  const [linkId, setLinkId] = useState('');
  const [availableLinks, setAvailableLinks] = useState([]);
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversation when employee changes
  useEffect(() => {
    if (employee) {
      const messages = getConversation(employee.username);
      setConversation(messages);
      
      // Mark messages as read
      messages.forEach(msg => {
        if (!msg.read && msg.receiver !== employee.username) {
          markAsRead(msg.id);
        }
      });
    }
  }, [employee, getConversation, markAsRead]);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    // Only scroll if the last message is from the current user (not the employee)
    if (conversation && conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.sender !== employee.username) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [conversation, employee.username]);
  
  // Function to fetch available links based on type
  const fetchAvailableLinks = (type) => {
    let links = [];
    
    switch(type) {
      case 'reservation':
        // Fetch reservations from localStorage or API
        try {
          const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
          links = reservations.map(res => ({
            id: res.fileNo || res.id,
            label: `${res.fileNo || res.id} - ${res.clientName || 'Reservation'}`
          }));
        } catch (e) {
          console.error("Error fetching reservations", e);
        }
        break;
        
      case 'offer':
        // Fetch offers from localStorage or API
        try {
          const offers = JSON.parse(localStorage.getItem('offers')) || [];
          links = offers.map(offer => ({
            id: offer.id,
            label: `${offer.id} - ${offer.title || 'Offer'}`
          }));
        } catch (e) {
          console.error("Error fetching offers", e);
        }
        break;
        
      case 'quotation':
        // Fetch quotations from localStorage or API
        try {
          const quotations = JSON.parse(localStorage.getItem('quotations')) || [];
          links = quotations.map(quote => ({
            id: quote.id,
            label: `${quote.id} - ${quote.clientName || 'Quotation'}`
          }));
        } catch (e) {
          console.error("Error fetching quotations", e);
        }
        break;
        
      default:
        links = [];
    }
    
    return links;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let messageContent = message;
    
    // Add link information if available
    if (linkType && linkId) {
      const linkInfo = {
        type: linkType,
        id: linkId
      };
      
      // Add link information to the message in a format that can be parsed
      messageContent = JSON.stringify({
        text: message,
        link: linkInfo
      });
    }

    const newMessage = sendMessage(employee.username, messageContent, notify);
    setConversation([...conversation, newMessage]);
    setMessage('');
    
    // Reset link information
    setLinkType('');
    setLinkId('');
    setShowLinkMenu(false);
    
    // Redirect to the Messages page after sending a message
    navigate('/messages');
    if (onClose) onClose();
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
  
  // Function to handle clicking on a link in a message
  const handleLinkClick = (link) => {
    if (!link || !link.type || !link.id) return;
    
    switch (link.type) {
      case 'reservation':
        navigate(`/reservations/${link.id}`);
        break;
      case 'offer':
        navigate(`/offers/${link.id}`);
        break;
      case 'quotation':
        navigate(`/quotations/view/${link.id}`);
        break;
      default:
        break;
    }
  };

  // Styles
  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    maxWidth: '90%',
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#222' : '#f8f8f8',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: theme === 'dark' ? '#fff' : '#333'
  };

  const conversationStyle = {
    padding: '15px',
    overflowY: 'auto',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const messageStyle = (isSender) => ({
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: '18px',
    backgroundColor: isSender 
      ? (theme === 'dark' ? '#0078ff' : '#1a73e8') 
      : (theme === 'dark' ? '#444' : '#e9e9e9'),
    color: isSender ? '#fff' : (theme === 'dark' ? '#fff' : '#333'),
    alignSelf: isSender ? 'flex-end' : 'flex-start',
    wordBreak: 'break-word'
  });

  const timestampStyle = {
    fontSize: '11px',
    marginTop: '4px',
    opacity: 0.7,
    textAlign: 'right'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
  };

  const inputStyle = {
    padding: '12px 15px',
    borderRadius: '20px',
    border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#444' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    resize: 'none',
    marginBottom: '10px'
  };

  const notifyContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const checkboxStyle = {
    marginRight: '8px'
  };

  const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
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

  if (!employee) return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Message {employee.name}</h3>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={conversationStyle}>
        {conversation.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.7, margin: '20px 0' }}>
            No messages yet. Start a conversation!
          </div>
        ) : (
          conversation.map(msg => {
            const parsedContent = parseMessageContent(msg.content);
            const hasLink = parsedContent.link && parsedContent.link.type && parsedContent.link.id;
            
            return (
              <div
                key={msg.id}
                style={messageStyle(msg.sender !== employee.username)}
              >
                {parsedContent.text}
                
                {hasLink && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-block'
                    }}
                    onClick={() => handleLinkClick(parsedContent.link)}
                  >
                    <span style={{ fontSize: '14px' }}>
                      🔗 {parsedContent.link.type.charAt(0).toUpperCase() + parsedContent.link.type.slice(1)} #{parsedContent.link.id}
                    </span>
                  </div>
                )}
                
                <div style={timestampStyle}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form style={formStyle} onSubmit={handleSendMessage}>
        <textarea
          style={inputStyle}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={3}
        />
        
        {showLinkMenu && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: theme === 'dark' ? '#444' : '#f0f0f0',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={linkType}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  setLinkType(selectedType);
                  setLinkId('');
                  
                  if (selectedType) {
                    const links = fetchAvailableLinks(selectedType);
                    setAvailableLinks(links);
                    setShowLinkDropdown(links.length > 0);
                  } else {
                    setAvailableLinks([]);
                    setShowLinkDropdown(false);
                  }
                }}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: theme === 'dark' ? '#555' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  border: theme === 'dark' ? '1px solid #666' : '1px solid #ddd',
                  marginRight: '10px'
                }}
              >
                <option value="">Select link type</option>
                <option value="reservation">Reservation</option>
                <option value="offer">Offer</option>
                <option value="quotation">Quotation</option>
              </select>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input
                  type="text"
                  placeholder="Enter ID (e.g., file number, offer ID)"
                  value={linkId}
                  onChange={(e) => {
                    setLinkId(e.target.value);
                    setShowLinkDropdown(true);
                  }}
                  onFocus={() => setShowLinkDropdown(true)}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: theme === 'dark' ? '#555' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                    border: theme === 'dark' ? '1px solid #666' : '1px solid #ddd',
                    width: '200px'
                  }}
                />
                
                {showLinkDropdown && availableLinks.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: theme === 'dark' ? '#444' : '#fff',
                    border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd',
                    borderRadius: '4px',
                    zIndex: 10,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    {availableLinks
                      .filter(link =>
                        link.id.toString().includes(linkId) ||
                        link.label.toLowerCase().includes(linkId.toLowerCase())
                      )
                      .map(link => (
                        <div
                          key={link.id}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: theme === 'dark' ? '1px solid #555' : '1px solid #eee',
                            backgroundColor: theme === 'dark' ? '#444' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = theme === 'dark' ? '#555' : '#f5f5f5';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = theme === 'dark' ? '#444' : '#fff';
                          }}
                          onClick={() => {
                            setLinkId(link.id.toString());
                            setShowLinkDropdown(false);
                          }}
                        >
                          {link.label}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={() => {
                  setLinkType('');
                  setLinkId('');
                  setShowLinkMenu(false);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <div style={notifyContainerStyle}>
            <input
              type="checkbox"
              id="notify"
              checked={notify}
              onChange={() => setNotify(!notify)}
              style={checkboxStyle}
            />
            <label htmlFor="notify">Notify recipient</label>
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => setShowLinkMenu(!showLinkMenu)}
              style={{
                marginRight: '10px',
                padding: '8px 12px',
                backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add link to reservation, offer, or quotation"
            >
              <span style={{ fontSize: '14px' }}>🔗 Add Link</span>
            </button>
            
            <button style={buttonStyle} type="submit">Send Message</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeMessaging;