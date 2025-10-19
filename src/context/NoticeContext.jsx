import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAllFromStorage, saveToStorage, updateInStorage, getAllFromStorageSync } from '../assets/utils/storage';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
    const { user, isAuthenticated, serverAvailable } = useAuth();
    const [notices, setNotices] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Load notices and comments on component mount
    useEffect(() => {
        const fetchNotices = async () => {
            if (isAuthenticated) {
                setLoading(true);
                
                // Always load from localStorage first for immediate display
                const savedNotices = localStorage.getItem('travcoNotices');
                const savedComments = localStorage.getItem('travcoNoticeComments');
                let localNotices = [];
                let localComments = [];
                
                if (savedNotices) {
                    try {
                        localNotices = JSON.parse(savedNotices);
                        setNotices(localNotices);
                    } catch (parseError) {
                        console.error('Error parsing local notices:', parseError);
                    }
                }
                
                if (savedComments) {
                    try {
                        localComments = JSON.parse(savedComments);
                        setComments(localComments);
                    } catch (parseError) {
                        console.error('Error parsing local comments:', parseError);
                    }
                }
                
                try {
                    // Try to fetch notices from server or localStorage
                    const fetchedNotices = await getAllFromStorage('notices');
                    
                    // Only update if we got different data
                    if (JSON.stringify(fetchedNotices) !== JSON.stringify(localNotices)) {
                        setNotices(fetchedNotices);
                    }
                    
                    // Try to fetch comments from server or localStorage
                    const fetchedComments = await getAllFromStorage('noticeComments');
                    
                    // Only update if we got different data
                    if (JSON.stringify(fetchedComments) !== JSON.stringify(localComments)) {
                        setComments(fetchedComments);
                    }
                } catch (error) {
                    console.error('Error fetching notices or comments:', error);
                    // We already loaded from localStorage, so no need for another fallback
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchNotices();
        
        // Set up interval to periodically refresh notices
        const intervalId = setInterval(fetchNotices, 30000); // Every 30 seconds
        
        return () => clearInterval(intervalId);
    }, [user, isAuthenticated]);

    // Save notices to localStorage whenever they change
    useEffect(() => {
        if (notices.length > 0) {
            localStorage.setItem('travcoNotices', JSON.stringify(notices));
        }
    }, [notices]);

    // Save comments to localStorage whenever they change
    useEffect(() => {
        if (comments.length > 0) {
            localStorage.setItem('travcoNoticeComments', JSON.stringify(comments));
        }
    }, [comments]);

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

    // Create a new notice post
    const createNotice = async (title, content, category) => {
        if (!user) return null;
        
        // Create notice object
        const newNotice = {
            author: user.username,
            authorName: user.name,
            authorRole: user.role,
            title,
            content,
            category,
            timestamp: formatDate(),
            likes: [],
            pinned: false
        };
        
        try {
            // Save notice using storage utility (which handles both server and localStorage)
            const savedNotice = await saveToStorage('notices', newNotice);
            
            // Update local state
            setNotices(prevNotices => [...prevNotices, savedNotice]);
            
            return savedNotice;
        } catch (error) {
            console.error('Error creating notice:', error);
            
            // If saveToStorage completely fails, create a fallback notice
            const fallbackNotice = {
                ...newNotice,
                id: Date.now()
            };
            
            // Update local state
            setNotices(prevNotices => [...prevNotices, fallbackNotice]);
            
            // Update localStorage directly as last resort
            try {
                const allNotices = JSON.parse(localStorage.getItem('travcoNotices') || '[]');
                allNotices.push(fallbackNotice);
                localStorage.setItem('travcoNotices', JSON.stringify(allNotices));
            } catch (localStorageError) {
                console.error('Failed to save to localStorage:', localStorageError);
            }
            
            return fallbackNotice;
        }
    };

    // Add a comment to a notice
    const addComment = async (noticeId, content) => {
        if (!user) return null;
        
        // Create comment object
        const newComment = {
            noticeId,
            author: user.username,
            authorName: user.name,
            authorRole: user.role,
            content,
            timestamp: formatDate(),
            likes: []
        };
        
        try {
            // Save comment using storage utility
            const savedComment = await saveToStorage('noticeComments', newComment);
            
            // Update local state
            setComments(prevComments => [...prevComments, savedComment]);
            
            return savedComment;
        } catch (error) {
            console.error('Error adding comment:', error);
            
            // If saveToStorage completely fails, create a fallback comment
            const fallbackComment = {
                ...newComment,
                id: Date.now()
            };
            
            // Update local state
            setComments(prevComments => [...prevComments, fallbackComment]);
            
            // Update localStorage directly as last resort
            try {
                const allComments = JSON.parse(localStorage.getItem('travcoNoticeComments') || '[]');
                allComments.push(fallbackComment);
                localStorage.setItem('travcoNoticeComments', JSON.stringify(allComments));
            } catch (localStorageError) {
                console.error('Failed to save to localStorage:', localStorageError);
            }
            
            return fallbackComment;
        }
    };

    // Like a notice
    const likeNotice = async (noticeId) => {
        if (!user) return null;
        
        const notice = notices.find(n => n.id === noticeId);
        if (!notice) return null;
        
        // Check if user already liked this notice
        const alreadyLiked = notice.likes.includes(user.username);
        
        // Create updated likes array
        const updatedLikes = alreadyLiked
            ? notice.likes.filter(username => username !== user.username)
            : [...notice.likes, user.username];
        
        try {
            // Update notice using storage utility
            const updatedNotice = await updateInStorage('notices', noticeId, { likes: updatedLikes });
            
            // Update local state
            setNotices(prevNotices =>
                prevNotices.map(n =>
                    n.id === noticeId ? { ...n, likes: updatedLikes } : n
                )
            );
            
            return updatedNotice;
        } catch (error) {
            console.error('Error liking notice:', error);
            
            // Update local state anyway for responsive UI
            setNotices(prevNotices =>
                prevNotices.map(n =>
                    n.id === noticeId ? { ...n, likes: updatedLikes } : n
                )
            );
            
            // Update localStorage directly as last resort
            try {
                const allNotices = JSON.parse(localStorage.getItem('travcoNotices') || '[]');
                const updatedNotices = allNotices.map(n =>
                    n.id === noticeId ? { ...n, likes: updatedLikes } : n
                );
                localStorage.setItem('travcoNotices', JSON.stringify(updatedNotices));
            } catch (localStorageError) {
                console.error('Failed to update localStorage:', localStorageError);
            }
            
            return { ...notice, likes: updatedLikes };
        }
    };

    // Like a comment
    const likeComment = async (commentId) => {
        if (!user) return null;
        
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return null;
        
        // Check if user already liked this comment
        const alreadyLiked = comment.likes.includes(user.username);
        
        // Create updated likes array
        const updatedLikes = alreadyLiked
            ? comment.likes.filter(username => username !== user.username)
            : [...comment.likes, user.username];
        
        try {
            // Update comment using storage utility
            const updatedComment = await updateInStorage('noticeComments', commentId, { likes: updatedLikes });
            
            // Update local state
            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === commentId ? { ...c, likes: updatedLikes } : c
                )
            );
            
            return updatedComment;
        } catch (error) {
            console.error('Error liking comment:', error);
            
            // Update local state anyway for responsive UI
            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === commentId ? { ...c, likes: updatedLikes } : c
                )
            );
            
            // Update localStorage directly as last resort
            try {
                const allComments = JSON.parse(localStorage.getItem('travcoNoticeComments') || '[]');
                const updatedComments = allComments.map(c =>
                    c.id === commentId ? { ...c, likes: updatedLikes } : c
                );
                localStorage.setItem('travcoNoticeComments', JSON.stringify(updatedComments));
            } catch (localStorageError) {
                console.error('Failed to update localStorage:', localStorageError);
            }
            
            return { ...comment, likes: updatedLikes };
        }
    };

    // Pin/unpin a notice (admin only)
    const togglePinNotice = async (noticeId) => {
        if (!user || !['admin', 'manager', 'hr'].includes(user.role)) return null;
        
        const notice = notices.find(n => n.id === noticeId);
        if (!notice) return null;
        
        // Toggle pinned status
        const pinned = !notice.pinned;
        
        try {
            // Update notice using storage utility
            const updatedNotice = await updateInStorage('notices', noticeId, { pinned });
            
            // Update local state
            setNotices(prevNotices =>
                prevNotices.map(n =>
                    n.id === noticeId ? { ...n, pinned } : n
                )
            );
            
            return updatedNotice;
        } catch (error) {
            console.error('Error toggling pin status:', error);
            
            // Update local state anyway for responsive UI
            setNotices(prevNotices =>
                prevNotices.map(n =>
                    n.id === noticeId ? { ...n, pinned } : n
                )
            );
            
            // Update localStorage directly as last resort
            try {
                const allNotices = JSON.parse(localStorage.getItem('travcoNotices') || '[]');
                const updatedNotices = allNotices.map(n =>
                    n.id === noticeId ? { ...n, pinned } : n
                );
                localStorage.setItem('travcoNotices', JSON.stringify(updatedNotices));
            } catch (localStorageError) {
                console.error('Failed to update localStorage:', localStorageError);
            }
            
            return { ...notice, pinned };
        }
    };

    // Get all notices
    const getAllNotices = () => {
        return [...notices].sort((a, b) => {
            // Pinned notices first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            // Then sort by date (newest first)
            try {
                return new Date(b.timestamp) - new Date(a.timestamp);
            } catch (error) {
                console.error('Error comparing dates:', error);
                return 0;
            }
        });
    };

    // Get notices by category
    const getNoticesByCategory = (category) => {
        return getAllNotices().filter(notice => notice.category === category);
    };

    // Get comments for a specific notice
    const getCommentsForNotice = (noticeId) => {
        return comments
            .filter(comment => comment.noticeId === noticeId)
            .sort((a, b) => {
                // Sort by date (oldest first for comments)
                try {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                } catch (error) {
                    console.error('Error comparing dates:', error);
                    return 0;
                }
            });
    };

    // Check if today is someone's birthday
    const getTodaysBirthdays = () => {
        // This would typically fetch from employee data
        // For now, we'll return a placeholder
        return []; // Will be implemented when we have access to employee birthday data
    };

    return (
        <NoticeContext.Provider value={{ 
            notices,
            comments,
            loading,
            createNotice,
            addComment,
            likeNotice,
            likeComment,
            togglePinNotice,
            getAllNotices,
            getNoticesByCategory,
            getCommentsForNotice,
            getTodaysBirthdays
        }}>
            {children}
        </NoticeContext.Provider>
    );
};

export const useNotice = () => {
    return useContext(NoticeContext);
};