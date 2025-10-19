// Script to seed test messages for the messaging system
// This will add messages between different employees with various roles

// Import employees data
import employees from './data/employeesData';

// Function to seed messages
export const seedMessages = () => {
  // Get current user from localStorage
  const currentUserStr = localStorage.getItem('travcoUser');
  if (!currentUserStr) {
    console.error('No user logged in. Please log in first.');
    return;
  }
  
  const currentUser = JSON.parse(currentUserStr);
  console.log(`Seeding messages for ${currentUser.name}`);
  
  // Create sample messages with different employees
  const messages = [];
  const now = new Date();
  
  // Get a subset of employees with different roles to create conversations with
  const conversationPartners = employees
    .filter(emp => emp.username !== currentUser.username)
    .reduce((acc, emp) => {
      // Only include one employee per role to ensure we have different roles
      if (!acc.some(e => e.role === emp.role)) {
        acc.push(emp);
      }
      return acc;
    }, [])
    .slice(0, 5); // Limit to 5 conversations
  
  console.log(`Creating conversations with ${conversationPartners.length} employees`);
  
  // For each conversation partner, create a thread of messages
  conversationPartners.forEach((partner, index) => {
    // Create 3-5 messages per conversation
    const messageCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < messageCount; i++) {
      // Alternate between sent and received messages
      const isSent = i % 2 === 0;
      const timestamp = new Date(now.getTime() - (index * 3600000) - (i * 600000)).toISOString();
      
      messages.push({
        id: Date.now() + index * 100 + i,
        sender: isSent ? currentUser.username : partner.username,
        senderName: isSent ? currentUser.name : partner.name,
        senderRole: isSent ? currentUser.role : partner.role,
        receiver: isSent ? partner.username : currentUser.username,
        receiverName: isSent ? partner.name : currentUser.name,
        receiverRole: isSent ? partner.role : currentUser.role,
        content: `Test message ${i + 1} in conversation with ${partner.name}`,
        timestamp: timestamp,
        read: true, // Mark all as read initially
        notify: false
      });
    }
    
    // Add one unread message from the partner in each conversation
    messages.push({
      id: Date.now() + index * 100 + messageCount,
      sender: partner.username,
      senderName: partner.name,
      senderRole: partner.role,
      receiver: currentUser.username,
      receiverName: currentUser.name,
      receiverRole: currentUser.role,
      content: `This is an unread message from ${partner.name}`,
      timestamp: new Date(now.getTime() - (index * 60000)).toISOString(),
      read: false,
      notify: true
    });
  });
  
  // Save messages to localStorage
  const existingMessagesStr = localStorage.getItem('travcoMessages');
  let existingMessages = [];
  
  if (existingMessagesStr) {
    try {
      existingMessages = JSON.parse(existingMessagesStr);
    } catch (e) {
      console.error('Error parsing existing messages:', e);
    }
  }
  
  // Combine existing and new messages
  const allMessages = [...existingMessages, ...messages];
  
  // Save to localStorage
  localStorage.setItem('travcoMessages', JSON.stringify(allMessages));
  
  console.log(`Added ${messages.length} test messages to localStorage`);
  return messages;
};

// Auto-execute if this script is run directly
if (typeof window !== 'undefined') {
  seedMessages();
}

export default seedMessages;