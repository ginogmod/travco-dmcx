import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAllFromStorage, saveToStorage, updateInStorage, getAllFromStorageSync } from '../assets/utils/storage';

const MessagesContext = createContext(null);

export const MessagesProvider = ({ children }) => {
    const { user, isAuthenticated, serverAvailable } = useAuth();
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load messages on component mount
    useEffect(() => {
        const fetchMessages = async () => {
            if (isAuthenticated && user) {
                setLoading(true);
                
                // Always load from localStorage first for immediate display
                const savedMessages = localStorage.getItem('travcoMessages');
                let localMessages = [];
                
                if (savedMessages) {
                    try {
                        localMessages = JSON.parse(savedMessages);
                        setMessages(localMessages);
                        
                        // Calculate unread messages
                        const userUnreadMessages = localMessages.filter(msg =>
                            msg.receiver === user.username &&
                            !msg.read &&
                            msg.notify
                        ).map(msg => msg.id);
                        
                        setUnreadMessages(userUnreadMessages);
                    } catch (parseError) {
                        console.error('Error parsing local messages:', parseError);
                    }
                }
                
                try {
                    // Try to fetch messages from server or localStorage
                    const fetchedMessages = await getAllFromStorage('messages');
                    
                    // Only update if we got different data
                    if (JSON.stringify(fetchedMessages) !== JSON.stringify(localMessages)) {
                        setMessages(fetchedMessages);
                        
                        // Calculate unread messages for current user
                        const userUnreadMessages = fetchedMessages.filter(msg =>
                            msg.receiver === user.username &&
                            !msg.read &&
                            msg.notify
                        ).map(msg => msg.id);
                        
                        setUnreadMessages(userUnreadMessages);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    // We already loaded from localStorage, so no need for another fallback
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMessages();
        
        // Set up interval to periodically refresh messages
        const intervalId = setInterval(fetchMessages, 30000); // Every 30 seconds
        
        return () => clearInterval(intervalId);
    }, [user, isAuthenticated]);

    // Save messages to localStorage whenever they change (for backward compatibility)
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('travcoMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // Save unread messages to localStorage whenever they change (for backward compatibility)
    useEffect(() => {
        if (user && unreadMessages.length > 0) {
            localStorage.setItem(`unreadMessages_${user.username}`, JSON.stringify(unreadMessages));
        }
    }, [unreadMessages, user]);

    // Format date safely
    const formatDate = () => {
        try {
            return new Date().toISOString();
        } catch (error) {
            console.error('Error formatting date:', error);
            // Return a fallback date format
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.000Z`;
        }
    };

    // Send a message to another employee
    const sendMessage = async (receiverUsername, content, notify = false) => {
        if (!user) return null;
        
        // Create message object
        const newMessage = {
            sender: user.username,
            senderName: user.name,
            senderRole: user.role,
            receiver: receiverUsername,
            content,
            timestamp: formatDate(),
            read: false,
            notify
        };
        
        try {
            // Save message using storage utility (which handles both server and localStorage)
            const savedMessage = await saveToStorage('messages', newMessage);
            
            // Update local state
            setMessages(prevMessages => [...prevMessages, savedMessage]);
            
            return savedMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            
            // If saveToStorage completely fails, create a fallback message
            const fallbackMessage = {
                ...newMessage,
                id: Date.now()
            };
            
            // Update local state
            setMessages(prevMessages => [...prevMessages, fallbackMessage]);
            
            // Update localStorage directly as last resort
            try {
                const allMessages = JSON.parse(localStorage.getItem('travcoMessages') || '[]');
                allMessages.push(fallbackMessage);
                localStorage.setItem('travcoMessages', JSON.stringify(allMessages));
            } catch (localStorageError) {
                console.error('Failed to save to localStorage:', localStorageError);
            }
            
            return fallbackMessage;
        }
    };

    // Mark a message as read
    const markAsRead = async (messageId) => {
        // Update local state immediately for responsive UI
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
            )
        );
        
        setUnreadMessages(prevUnread =>
            prevUnread.filter(id => id !== messageId)
        );
        
        try {
            // Update message using storage utility (which handles both server and localStorage)
            await updateInStorage('messages', messageId, { read: true });
        } catch (error) {
            console.error('Error marking message as read:', error);
            
            // If updateInStorage completely fails, update localStorage directly
            try {
                const allMessages = JSON.parse(localStorage.getItem('travcoMessages') || '[]');
                const updatedMessages = allMessages.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                );
                localStorage.setItem('travcoMessages', JSON.stringify(updatedMessages));
            } catch (localStorageError) {
                console.error('Failed to update localStorage:', localStorageError);
            }
        }
    };

    // Mark all messages as read
    const markAllAsRead = async () => {
        if (!user) return;
        
        // Update local state immediately for responsive UI
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.receiver === user.username ? { ...msg, read: true } : msg
            )
        );
        
        setUnreadMessages([]);
        localStorage.removeItem(`unreadMessages_${user.username}`);
        
        try {
            if (serverAvailable) {
                // Try to use API endpoint with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                await fetch('/api/messages/read-all', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    signal: controller.signal
                }).catch(() => null);
                
                clearTimeout(timeoutId);
            }
            
            // Update localStorage directly as well
            try {
                const allMessages = JSON.parse(localStorage.getItem('travcoMessages') || '[]');
                const updatedMessages = allMessages.map(msg =>
                    msg.receiver === user.username ? { ...msg, read: true } : msg
                );
                localStorage.setItem('travcoMessages', JSON.stringify(updatedMessages));
            } catch (localStorageError) {
                console.error('Failed to update localStorage:', localStorageError);
            }
        } catch (error) {
            console.error('Error marking all messages as read:', error);
        }
    };

    // Get unread messages for current user
    const getUnreadMessages = () => {
        if (!user) return [];
        
        return messages.filter(msg => 
            msg.receiver === user.username && 
            !msg.read && 
            msg.notify
        );
    };

    // Get all messages for current user (sent and received)
    const getUserMessages = () => {
        if (!user) return [];
        
        return messages.filter(msg => 
            msg.sender === user.username || 
            msg.receiver === user.username
        );
    };

    // Get conversation between current user and another user
    const getConversation = (otherUsername) => {
        if (!user) return [];
        
        return messages.filter(msg => 
            (msg.sender === user.username && msg.receiver === otherUsername) ||
            (msg.sender === otherUsername && msg.receiver === user.username)
        ).sort((a, b) => {
            // Safe date comparison
            try {
                return new Date(a.timestamp) - new Date(b.timestamp);
            } catch (error) {
                console.error('Error comparing dates:', error);
                return 0; // Keep original order if dates can't be compared
            }
        });
    };

    return (
        <MessagesContext.Provider value={{ 
            messages, 
            sendMessage, 
            markAsRead, 
            markAllAsRead,
            getUnreadMessages,
            getUserMessages,
            getConversation,
            unreadMessages,
            loading
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    return useContext(MessagesContext);
};