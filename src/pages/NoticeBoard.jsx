import React, { useState, useEffect } from 'react';
import { useNotice } from '../context/NoticeContext';
import { useAuth } from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const { 
    loading, 
    getAllNotices, 
    getNoticesByCategory, 
    getCommentsForNotice, 
    createNotice, 
    addComment, 
    likeNotice, 
    likeComment, 
    togglePinNotice,
    getTodaysBirthdays
  } = useNotice();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [notices, setNotices] = useState([]);
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('general');
  const [newComment, setNewComment] = useState('');
  const [showNewNoticeForm, setShowNewNoticeForm] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  
  // Dark theme as default (matching the app's theme)
  const theme = 'dark';
  
  // Load notices based on active category
  useEffect(() => {
    if (activeCategory === 'all') {
      setNotices(getAllNotices());
    } else {
      setNotices(getNoticesByCategory(activeCategory));
    }
  }, [activeCategory, getAllNotices, getNoticesByCategory]);
  
  // Check for birthdays
  useEffect(() => {
    setBirthdays(getTodaysBirthdays());
  }, [getTodaysBirthdays]);
  
  // Handle creating a new notice
  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    
    createNotice(newNoticeTitle, newNoticeContent, newNoticeCategory)
      .then(() => {
        // Reset form
        setNewNoticeTitle('');
        setNewNoticeContent('');
        setNewNoticeCategory('general');
        setShowNewNoticeForm(false);
        
        // Refresh notices
        if (activeCategory === 'all' || activeCategory === newNoticeCategory) {
          if (activeCategory === 'all') {
            setNotices(getAllNotices());
          } else {
            setNotices(getNoticesByCategory(activeCategory));
          }
        }
      });
  };
  
  // Handle adding a comment
  const handleAddComment = (noticeId) => {
    if (!newComment.trim()) return;
    
    addComment(noticeId, newComment)
      .then(() => {
        // Reset form
        setNewComment('');
        
        // Refresh expanded notice to show new comment
        if (expandedNotice && expandedNotice.id === noticeId) {
          const updatedNotice = notices.find(n => n.id === noticeId);
          if (updatedNotice) {
            setExpandedNotice({
              ...updatedNotice,
              comments: getCommentsForNotice(noticeId)
            });
          }
        }
      });
  };
  
  // Handle expanding a notice to show comments
  const handleExpandNotice = (notice) => {
    if (expandedNotice && expandedNotice.id === notice.id) {
      setExpandedNotice(null); // Collapse if already expanded
    } else {
      setExpandedNotice({
        ...notice,
        comments: getCommentsForNotice(notice.id)
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Check if user can pin notices (admin, manager, hr)
  const canPinNotices = user && ['admin', 'manager', 'hr'].includes(user.role);
  
  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 120px)',
    backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    margin: '20px 0'
  };
  
  const headerStyle = {
    padding: '30px',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  };
  
  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: theme === 'dark' ? '#fff' : '#333'
  };
  
  const subtitleStyle = {
    fontSize: '16px',
    color: theme === 'dark' ? '#aaa' : '#666',
    maxWidth: '800px'
  };
  
  const tabsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '15px 0',
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd'
  };
  
  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    margin: '0 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: isActive 
      ? (theme === 'dark' ? '#333' : '#e6f2ff') 
      : 'transparent',
    color: isActive
      ? (theme === 'dark' ? '#fff' : '#1a73e8')
      : (theme === 'dark' ? '#aaa' : '#666'),
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  });
  
  const contentStyle = {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
    backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8'
  };
  
  const noticeCardStyle = (pinned) => ({
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: theme === 'dark' 
      ? (pinned ? '#2d2d2d' : '#1a1a1a') 
      : (pinned ? '#f0f7ff' : '#fff'),
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderLeft: pinned 
      ? (theme === 'dark' ? '4px solid #4caf50' : '4px solid #4caf50')
      : 'none'
  });
  
  const noticeHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };
  
  const noticeTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333'
  };
  
  const noticeMetaStyle = {
    fontSize: '14px',
    color: theme === 'dark' ? '#aaa' : '#666',
    marginBottom: '15px'
  };
  
  const noticeContentStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: theme === 'dark' ? '#ddd' : '#444',
    marginBottom: '15px',
    whiteSpace: 'pre-wrap'
  };
  
  const noticeActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px'
  };
  
  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: theme === 'dark' ? '#333' : '#e6f2ff',
    color: theme === 'dark' ? '#fff' : '#1a73e8',
    transition: 'all 0.2s ease'
  };
  
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1a73e8',
    color: '#fff'
  };
  
  const iconButtonStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: theme === 'dark' ? '#aaa' : '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };
  
  const commentsContainerStyle = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: theme === 'dark' ? '#252525' : '#f5f5f5',
    borderRadius: '8px'
  };
  
  const commentStyle = {
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    borderRadius: '4px'
  };
  
  const commentHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '14px'
  };
  
  const commentAuthorStyle = {
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333'
  };
  
  const commentDateStyle = {
    color: theme === 'dark' ? '#aaa' : '#666'
  };
  
  const commentContentStyle = {
    fontSize: '14px',
    lineHeight: '1.5',
    color: theme === 'dark' ? '#ddd' : '#444',
    whiteSpace: 'pre-wrap'
  };
  
  const formStyle = {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
    fontSize: '14px'
  };
  
  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
  };
  
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    paddingRight: '30px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${theme === 'dark' ? '%23ffffff' : '%23333333'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '16px'
  };
  
  const birthdayBannerStyle = {
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f0f7ff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #ff9800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };
  
  const birthdayIconStyle = {
    fontSize: '24px',
    color: '#ff9800'
  };
  
  const birthdayTextStyle = {
    fontSize: '16px',
    color: theme === 'dark' ? '#fff' : '#333'
  };
  
  const categoryBadgeStyle = (category) => {
    const colors = {
      'general': { bg: '#1a73e8', text: '#fff' },
      'team-building': { bg: '#4caf50', text: '#fff' },
      'vacancy': { bg: '#ff9800', text: '#fff' },
      'announcement': { bg: '#9c27b0', text: '#fff' }
    };
    
    const color = colors[category] || colors['general'];
    
    return {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: color.bg,
      color: color.text,
      marginRight: '10px'
    };
  };
  
  // Render birthday banner if there are birthdays today
  const renderBirthdayBanner = () => {
    if (birthdays.length === 0) return null;
    
    return (
      <div style={birthdayBannerStyle}>
        <span style={birthdayIconStyle}>🎂</span>
        <span style={birthdayTextStyle}>
          Today is {birthdays.map(b => b.name).join(', ')}'s birthday! Wish them a happy birthday!
        </span>
      </div>
    );
  };
  
  // Render notice cards
  const renderNotices = () => {
    if (loading) {
      return <div style={{textAlign: 'center', padding: '20px'}}>Loading notices...</div>;
    }
    
    if (notices.length === 0) {
      return (
        <div style={{textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#aaa' : '#666'}}>
          No notices found in this category. Be the first to post!
        </div>
      );
    }
    
    return notices.map(notice => (
      <div key={notice.id} style={noticeCardStyle(notice.pinned)}>
        <div style={noticeHeaderStyle}>
          <div>
            <div style={noticeTitleStyle}>{notice.title}</div>
            <div style={noticeMetaStyle}>
              <span style={categoryBadgeStyle(notice.category)}>
                {notice.category === 'team-building' ? 'Team Building' : 
                 notice.category === 'vacancy' ? 'Job Vacancy' : 
                 notice.category === 'announcement' ? 'Announcement' : 
                 'General'}
              </span>
              Posted by {notice.authorName} • {formatDate(notice.timestamp)}
            </div>
          </div>
          {canPinNotices && (
            <button 
              style={iconButtonStyle} 
              onClick={() => togglePinNotice(notice.id)}
              title={notice.pinned ? "Unpin notice" : "Pin notice"}
            >
              📌 {notice.pinned ? "Unpin" : "Pin"}
            </button>
          )}
        </div>
        
        <div style={noticeContentStyle}>{notice.content}</div>
        
        <div style={noticeActionsStyle}>
          <button 
            style={iconButtonStyle} 
            onClick={() => likeNotice(notice.id)}
          >
            {notice.likes.includes(user.username) ? "❤️" : "🤍"} 
            {notice.likes.length > 0 && notice.likes.length}
          </button>
          
          <button 
            style={buttonStyle} 
            onClick={() => handleExpandNotice(notice)}
          >
            {expandedNotice && expandedNotice.id === notice.id ? "Hide Comments" : "Show Comments"}
          </button>
        </div>
        
        {expandedNotice && expandedNotice.id === notice.id && (
          <div style={commentsContainerStyle}>
            <h4 style={{marginBottom: '15px', color: theme === 'dark' ? '#fff' : '#333'}}>
              Comments ({expandedNotice.comments.length})
            </h4>
            
            {expandedNotice.comments.length > 0 ? (
              expandedNotice.comments.map(comment => (
                <div key={comment.id} style={commentStyle}>
                  <div style={commentHeaderStyle}>
                    <span style={commentAuthorStyle}>{comment.authorName}</span>
                    <span style={commentDateStyle}>{formatDate(comment.timestamp)}</span>
                  </div>
                  <div style={commentContentStyle}>{comment.content}</div>
                  <div style={{marginTop: '5px'}}>
                    <button 
                      style={iconButtonStyle} 
                      onClick={() => likeComment(comment.id)}
                    >
                      {comment.likes.includes(user.username) ? "❤️" : "🤍"} 
                      {comment.likes.length > 0 && comment.likes.length}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{textAlign: 'center', padding: '10px', color: theme === 'dark' ? '#aaa' : '#666'}}>
                No comments yet. Be the first to comment!
              </div>
            )}
            
            <div style={{marginTop: '15px'}}>
              <textarea 
                style={inputStyle}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                style={primaryButtonStyle}
                onClick={() => handleAddComment(notice.id)}
              >
                Add Comment
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  };
  
  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: theme === 'dark' ? '#fff' : '#333' }}>Notice Board</h1>
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={titleStyle}>Company Notice Board</div>
          <div style={subtitleStyle}>
            Stay updated with company announcements, team building activities, and internal opportunities.
          </div>
        </div>
        
        <div style={tabsContainerStyle}>
          <div 
            style={tabStyle(activeCategory === 'all')}
            onClick={() => setActiveCategory('all')}
          >
            All Notices
          </div>
          <div 
            style={tabStyle(activeCategory === 'announcement')}
            onClick={() => setActiveCategory('announcement')}
          >
            Announcements
          </div>
          <div 
            style={tabStyle(activeCategory === 'team-building')}
            onClick={() => setActiveCategory('team-building')}
          >
            Team Building
          </div>
          <div 
            style={tabStyle(activeCategory === 'vacancy')}
            onClick={() => setActiveCategory('vacancy')}
          >
            Job Vacancies
          </div>
        </div>
        
        <div style={contentStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <button 
              style={primaryButtonStyle}
              onClick={() => setShowNewNoticeForm(!showNewNoticeForm)}
            >
              {showNewNoticeForm ? 'Cancel' : 'Create New Notice'}
            </button>
          </div>
          
          {showNewNoticeForm && (
            <div style={formStyle}>
              <h3 style={{marginBottom: '15px', color: theme === 'dark' ? '#fff' : '#333'}}>
                Create New Notice
              </h3>
              <form onSubmit={handleCreateNotice}>
                <input 
                  style={inputStyle}
                  type="text"
                  placeholder="Title"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  required
                />
                
                <select 
                  style={selectStyle}
                  value={newNoticeCategory}
                  onChange={(e) => setNewNoticeCategory(e.target.value)}
                  required
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="team-building">Team Building</option>
                  {user && ['admin', 'manager', 'hr'].includes(user.role) && (
                    <option value="vacancy">Job Vacancy</option>
                  )}
                </select>
                
                <textarea 
                  style={textareaStyle}
                  placeholder="Content"
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  required
                />
                
                <button 
                  style={primaryButtonStyle}
                  type="submit"
                >
                  Post Notice
                </button>
              </form>
            </div>
          )}
          
          {renderBirthdayBanner()}
          
          {renderNotices()}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;