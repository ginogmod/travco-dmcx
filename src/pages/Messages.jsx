import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeMessaging from '../components/EmployeeMessaging';
// Import employees data directly to ensure roles are available
import employeesData from '../data/employeesData';
import { getAllFromStorage } from '../assets/utils/storage';

const Messages = () => {
  const { user } = useAuth();
  const { getUnreadMessages, getUserMessages, sendMessage } = useMessages();
  
  // Define roles for special message styling with colors
  const ROLE_COLORS = {
    'Department Head': '#104f2a', // Bright Green
    'General Manager': '#782525', // Bright Red
    'Reservations Agent': '#ffffff', // Deep Sky Blue
    'Operations Agent': '#ffffff', // Orange
    'Finance Agent': '#ffffff', // Dark Orchid
    'Sales & Marketing Manager': '#104f2a', // Gold
    'Administrator': '#FF00FF', // Magenta
    'HR Administrator': '#4a3670', // Dodger Blue
    'Driver': '#ffffff', // Lime Green
    'Sales & Marketing Agent': '#ffffff' // Tomato
  };
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkType, setLinkType] = useState('');
  const [linkId, setLinkId] = useState('');
  const [availableLinks, setAvailableLinks] = useState([]);
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Dark theme as default
  const theme = 'dark';

  // Get all employees from messages
  const getUniqueEmployees = () => {
    const uniqueEmployees = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender === user.username ? msg.receiver : msg.sender;
      const otherName = msg.sender === user.username ?
        (msg.receiverName || otherUser) :
        (msg.senderName || otherUser);
      
      // Get role from employees data if available
      let otherRole = '';
      
      // Use the imported employeesData instead of requiring it again
      const employeeData = employeesData.find(emp => emp.username === otherUser);
      if (employeeData) {
        otherRole = employeeData.role;
        console.log(`Found role for ${otherUser}: ${otherRole}`);
      } else {
        // Fallback to message role if available
        otherRole = msg.sender === user.username ?
          (msg.receiverRole || '') :
          (msg.senderRole || '');
        console.log(`Using fallback role for ${otherUser}: ${otherRole}`);
      }
      
      if (!uniqueEmployees.has(otherUser)) {
        uniqueEmployees.set(otherUser, {
          username: otherUser,
          name: otherName,
          role: otherRole,
          lastMessage: msg,
          unread: !msg.read && msg.receiver === user.username
        });
      } else {
        const existing = uniqueEmployees.get(otherUser);
        if (safeCompareDate(msg.timestamp, existing.lastMessage.timestamp) > 0) {
          existing.lastMessage = msg;
          existing.unread = existing.unread || (!msg.read && msg.receiver === user.username);
          uniqueEmployees.set(otherUser, existing);
        }
      }
    });
    
    return Array.from(uniqueEmployees.values())
      .sort((a, b) => {
        // Sort by unread first, then by timestamp
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return safeCompareDate(b.lastMessage.timestamp, a.lastMessage.timestamp);
      });
  };

  // Function to fetch available links based on type
  const fetchAvailableLinks = async (type) => {
    let links = [];
    
    try {
      switch(type) {
        case 'reservation':
          // Fetch reservations from storage utility
          try {
            const reservations = await getAllFromStorage('reservations') || [];
            links = reservations.map(res => ({
              id: res.fileNo || res.id,
              label: `${res.fileNo || res.id} - ${res.clientName || 'Reservation'}`
            }));
          } catch (e) {
            console.error("Error fetching reservations", e);
            // Fallback to localStorage
            try {
              const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
              links = reservations.map(res => ({
                id: res.fileNo || res.id,
                label: `${res.fileNo || res.id} - ${res.clientName || 'Reservation'}`
              }));
            } catch (localError) {
              console.error("Error fetching reservations from localStorage", localError);
            }
          }
          break;
          
        case 'offer':
          // Fetch offers from storage utility
          try {
            const offers = await getAllFromStorage('offers') || [];
            links = offers.map(offer => ({
              id: offer.id,
              label: `${offer.id} - ${offer.title || offer.groupName || 'Offer'}`
            }));
          } catch (e) {
            console.error("Error fetching offers", e);
            // Fallback to localStorage
            try {
              const offers = JSON.parse(localStorage.getItem('offers')) || [];
              links = offers.map(offer => ({
                id: offer.id,
                label: `${offer.id} - ${offer.title || offer.groupName || 'Offer'}`
              }));
            } catch (localError) {
              console.error("Error fetching offers from localStorage", localError);
            }
          }
          break;
          
        case 'quotation':
          // Fetch quotations from storage utility
          try {
            const quotations = await getAllFromStorage('quotations') || [];
            links = quotations.map(quote => ({
              id: quote.id,
              label: `${quote.id} - ${quote.clientName || quote.group || 'Quotation'}`
            }));
          } catch (e) {
            console.error("Error fetching quotations", e);
            // Fallback to localStorage
            try {
              const quotations = JSON.parse(localStorage.getItem('quotations')) || [];
              links = quotations.map(quote => ({
                id: quote.id,
                label: `${quote.id} - ${quote.clientName || quote.group || 'Quotation'}`
              }));
            } catch (localError) {
              console.error("Error fetching quotations from localStorage", localError);
            }
          }
          break;
          
        default:
          links = [];
      }
    } catch (error) {
      console.error("Error in fetchAvailableLinks:", error);
    }
    
    return links;
  };

  // Function to show notification for unread messages
  const showNotification = (message) => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
      const notification = new Notification("New Message", {
        body: `${message.senderName || message.sender}: ${parseMessageContent(message.content).text}`,
        icon: "/logo.png"
      });
      
      notification.onclick = function() {
        window.focus();
        // Navigate to the messages page and select the sender
        const sender = {
          username: message.sender,
          name: message.senderName || message.sender,
          role: message.senderRole || ''
        };
        localStorage.setItem('selectedMessageEmployee', JSON.stringify(sender));
        window.location.href = '/messages';
      };
    }
    // Otherwise, request permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          showNotification(message);
        }
      });
    }
  };

  // Safe date comparison function
  const safeCompareDate = (date1, date2) => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // Check if dates are valid
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        console.warn('Invalid date comparison:', date1, date2);
        return 0;
      }
      
      return d1.getTime() - d2.getTime();
    } catch (error) {
      console.error('Error comparing dates:', error);
      return 0;
    }
  };

  // Check for messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const allMessages = await getUserMessages();
        setMessages(allMessages || []);
        
        // Check for unread messages and show notifications
        const unreadMessages = (allMessages || []).filter(msg =>
          !msg.read && msg.receiver === user.username
        );
        
        // Request notification permission on component mount
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
          Notification.requestPermission();
        }
        
        // Show notifications for unread messages
        unreadMessages.forEach(msg => {
          showNotification(msg);
        });
        
        // Check if there's a selected employee in localStorage
        const storedEmployee = localStorage.getItem('selectedMessageEmployee');
        if (storedEmployee) {
          try {
            const employee = JSON.parse(storedEmployee);
            setSelectedEmployee(employee);
            
            // Get conversation with this employee
            const conversation = (allMessages || []).filter(msg =>
              (msg.sender === user.username && msg.receiver === employee.username) ||
              (msg.sender === employee.username && msg.receiver === user.username)
            ).sort((a, b) => safeCompareDate(a.timestamp, b.timestamp));
            
            setActiveConversation(conversation);
            
            // Clear the stored employee
            localStorage.removeItem('selectedMessageEmployee');
          } catch (error) {
            console.error("Error parsing stored employee:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };
    
    fetchMessages();
    
    // Set up interval to check for new messages
    const interval = setInterval(async () => {
      try {
        const newAllMessages = await getUserMessages();
        setMessages(newAllMessages || []);
        
        // Update active conversation if one is selected
        if (selectedEmployee) {
          const updatedConversation = (newAllMessages || []).filter(msg =>
            (msg.sender === user.username && msg.receiver === selectedEmployee.username) ||
            (msg.sender === selectedEmployee.username && msg.receiver === user.username)
          ).sort((a, b) => safeCompareDate(a.timestamp, b.timestamp));
          
          setActiveConversation(updatedConversation);
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [getUserMessages, user.username]);

  // Scroll to bottom only when sending a new message, not when selecting a conversation
  useEffect(() => {
    // Only scroll to bottom when a new message is sent, not when selecting a conversation
    const lastMessage = activeConversation && activeConversation.length > 0
      ? activeConversation[activeConversation.length - 1]
      : null;
    
    // Check if the last message is from the current user and was just sent
    if (lastMessage && lastMessage.sender === user.username) {
      try {
        const messageTime = new Date(lastMessage.timestamp).getTime();
        if (!isNaN(messageTime) && messageTime > Date.now() - 2000) {
          // Use a small timeout to ensure the DOM has updated
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        console.error('Error checking message time:', error);
        // Fallback: scroll anyway
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [activeConversation, user.username]);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    
    // Get conversation with this employee
    const conversation = messages.filter(msg =>
      (msg.sender === user.username && msg.receiver === employee.username) ||
      (msg.sender === employee.username && msg.receiver === user.username)
    ).sort((a, b) => safeCompareDate(a.timestamp, b.timestamp));
    
    // Set active conversation without triggering auto-scroll
    setActiveConversation(conversation);
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in formatTimestamp:', timestamp);
        return 'Unknown time';
      }
      
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
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedEmployee) return;

    let messageContent = newMessage;
    
    // Add link information if available
    if (linkType && linkId) {
      const linkInfo = {
        type: linkType,
        id: linkId
      };
      
      // Add link information to the message in a format that can be parsed
      messageContent = JSON.stringify({
        text: newMessage,
        link: linkInfo
      });
    }

    try {
      // Send the message
      const sentMessage = await sendMessage(selectedEmployee.username, messageContent, true);
      
      // Update the active conversation
      if (sentMessage) {
        setActiveConversation(prev => [...prev, sentMessage]);
      }
      
      setNewMessage('');
      
      // Reset link information
      setLinkType('');
      setLinkId('');
      setShowLinkMenu(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
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

  const filteredEmployees = () => {
    const employees = getUniqueEmployees();
    if (!searchTerm) return employees;
    
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    height: 'calc(100vh - 120px)',
    backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    margin: '20px 0'
  };

  const sidebarStyle = {
    width: '350px',
    borderRight: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff'
  };

  const sidebarHeaderStyle = {
    padding: '20px',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const searchStyle = {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '20px',
    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
    color: theme === 'dark' ? '#fff' : '#333',
    marginTop: '10px'
  };

  const conversationListStyle = {
    overflowY: 'auto',
    flex: 1
  };

  const conversationItemStyle = (isActive, hasUnread) => ({
    padding: '15px 20px',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: isActive 
      ? (theme === 'dark' ? '#333' : '#e6f2ff') 
      : (hasUnread ? (theme === 'dark' ? '#2a2a2a' : '#f0f7ff') : 'transparent')
  });

  const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: theme === 'dark' ? '#444' : '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#666'
  };

  const conversationInfoStyle = {
    flex: 1
  };

  const nameStyle = {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: theme === 'dark' ? '#fff' : '#333',
    display: 'flex',
    alignItems: 'center'
  };

  const unreadDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    marginLeft: '8px'
  };

  const previewStyle = {
    fontSize: '14px',
    color: theme === 'dark' ? '#aaa' : '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px'
  };

  const timeStyle = {
    fontSize: '12px',
    color: theme === 'dark' ? '#888' : '#999',
    marginLeft: '10px'
  };

  const chatAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8'
  };

  const chatHeaderStyle = {
    padding: '20px',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff'
  };

  const messagesContainerStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    scrollBehavior: 'smooth'
  };

  const messageStyle = (isSender) => ({
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    backgroundColor: isSender
      ? (theme === 'dark' ? '#0078ff' : '#1a73e8')
      : (theme === 'dark' ? '#333' : '#e9e9e9'),
    color: isSender ? '#fff' : (theme === 'dark' ? '#fff' : '#333'),
    alignSelf: isSender ? 'flex-end' : 'flex-start',
    wordBreak: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    margin: '2px 0'
  });

  const messageTimeStyle = {
    fontSize: '11px',
    marginTop: '4px',
    opacity: 0.7,
    textAlign: 'right'
  };

  const inputAreaStyle = {
    padding: '15px 20px',
    borderTop: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff'
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '20px',
    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
    color: theme === 'dark' ? '#fff' : '#333',
    resize: 'none'
  };

  const sendButtonStyle = {
    marginLeft: '10px',
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme === 'dark' ? '#888' : '#999',
    textAlign: 'center',
    padding: '20px'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const employees = filteredEmployees();

  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: theme === 'dark' ? '#fff' : '#333' }}>Messages</h1>
      
      <div style={containerStyle}>
        {/* Sidebar with conversations */}
        <div style={sidebarStyle}>
          <div style={sidebarHeaderStyle}>
            <h2 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>Conversations</h2>
          </div>
          
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchStyle}
          />
          
          <div style={conversationListStyle} data-kb-nav="1" data-kb-axis="vertical" data-kb-wrap="true">
            {employees.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: theme === 'dark' ? '#888' : '#999' }}>
                No conversations yet
              </div>
            ) : (
              employees.map(employee => {
                const isActive = selectedEmployee && selectedEmployee.username === employee.username;
                return (
                  <div
                    key={employee.username}
                    style={conversationItemStyle(isActive, employee.unread)}
                    onClick={() => handleSelectEmployee(employee)}
                    role="button"
                    tabIndex={0}
                    data-kb-item
                  >
                    <div style={avatarStyle}>
                      {getInitials(employee.name)}
                    </div>
                    <div style={conversationInfoStyle}>
                      <div style={nameStyle}>
                        <span style={{
                          color: ROLE_COLORS[employee.role] || (theme === 'dark' ? '#fff' : '#333'),
                          fontWeight: ROLE_COLORS[employee.role] ? 'bold' : 'normal',
                          textShadow: ROLE_COLORS[employee.role] ? '0px 0px 1px rgba(0,0,0,0.5)' : 'none',
                          // Add !important to ensure the color is applied
                          WebkitTextFillColor: ROLE_COLORS[employee.role] ? `${ROLE_COLORS[employee.role]} !important` : 'inherit'
                        }}>
                          {employee.name}
                          {employee.role === 'Department Head' && ' (Head)'}
                          {employee.role === 'General Manager' && ' (GM)'}
                        </span>
                        {employee.unread && <div style={unreadDotStyle}></div>}
                      </div>
                      <div style={previewStyle}>
                        {(() => {
                          const parsedContent = parseMessageContent(employee.lastMessage.content);
                          return parsedContent.text;
                        })()}
                      </div>
                    </div>
                    <div style={timeStyle}>
                      {formatTimestamp(employee.lastMessage.timestamp)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div style={chatAreaStyle}>
          {selectedEmployee ? (
            <>
              <div style={chatHeaderStyle}>
                <div style={avatarStyle}>
                  {getInitials(selectedEmployee.name)}
                </div>
                <h2 style={{
                  margin: 0,
                  color: ROLE_COLORS[selectedEmployee.role] || (theme === 'dark' ? '#fff' : '#333'),
                  textShadow: ROLE_COLORS[selectedEmployee.role] ? '0px 0px 1px rgba(0,0,0,0.5)' : 'none',
                  // Add !important to ensure the color is applied
                  WebkitTextFillColor: ROLE_COLORS[selectedEmployee.role] ? `${ROLE_COLORS[selectedEmployee.role]} !important` : 'inherit'
                }}>
                  {selectedEmployee.name}
                  {selectedEmployee.role === 'Department Head' && ' (Head)'}
                  {selectedEmployee.role === 'General Manager' && ' (GM)'}
                </h2>
              </div>
              
              <div style={messagesContainerStyle}>
                {activeConversation.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <p>No messages yet</p>
                    <p>Start a conversation with {selectedEmployee.name}</p>
                  </div>
                ) : (
                  activeConversation.map(msg => {
                    const parsedContent = parseMessageContent(msg.content);
                    const hasLink = parsedContent.link && parsedContent.link.type && parsedContent.link.id;
                    
                    return (
                      <div
                        key={msg.id}
                        style={messageStyle(msg.sender === user.username)}
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
                        
                        <div style={messageTimeStyle}>
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form style={inputAreaStyle} onSubmit={handleSendMessage}>
                {showLinkMenu && (
                  <div style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
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
                            // Use async function to fetch links
                            const fetchLinks = async () => {
                              try {
                                const links = await fetchAvailableLinks(selectedType);
                                setAvailableLinks(links);
                                setShowLinkDropdown(links.length > 0);
                              } catch (error) {
                                console.error("Error fetching links:", error);
                                setAvailableLinks([]);
                                setShowLinkDropdown(false);
                              }
                            };
                            fetchLinks();
                          } else {
                            setAvailableLinks([]);
                            setShowLinkDropdown(false);
                          }
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          backgroundColor: theme === 'dark' ? '#333' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#333',
                          border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
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
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                            border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
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
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
                            borderRadius: '4px',
                            zIndex: 10,
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                          }}>
                            {availableLinks.map(link => (
                              <div
                                key={link.id}
                                style={{
                                  padding: '8px',
                                  cursor: 'pointer',
                                  borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
                                }}
                                onClick={() => {
                                  setLinkId(link.id);
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
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setShowLinkMenu(false)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: theme === 'dark' ? '#444' : '#ddd',
                          color: theme === 'dark' ? '#fff' : '#333',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (linkType && linkId) {
                            setShowLinkMenu(false);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: linkType && linkId ? '#1a73e8' : (theme === 'dark' ? '#555' : '#ccc'),
                          color: '#fff',
                          cursor: linkType && linkId ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={inputStyle}
                />
                
                <button
                  type="button"
                  onClick={() => setShowLinkMenu(!showLinkMenu)}
                  style={{
                    marginLeft: '10px',
                    padding: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                    color: theme === 'dark' ? '#fff' : '#333',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  🔗
                </button>
                
                <button type="submit" style={sendButtonStyle}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={emptyStateStyle}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;