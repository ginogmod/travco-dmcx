import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NoticeBoard from './NoticeBoard';

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('welcome');
  const videoRef = useRef(null);
  
  // Dark theme as default (matching the app's theme)
  const theme = 'dark';

  // Play/pause video when tab changes
  useEffect(() => {
    if (activeTab === 'welcome' && videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play error:", err));
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [activeTab]);

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

  const welcomeTextStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: theme === 'dark' ? '#fff' : '#333'
  };

  const subTextStyle = {
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

  const videoContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  };

  const videoStyle = {
    width: '80%',
    maxHeight: '70%',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  };

  const sectionStyle = {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: theme === 'dark' ? '#fff' : '#333',
    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
    paddingBottom: '10px'
  };

  const sectionContentStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: theme === 'dark' ? '#ddd' : '#444'
  };

  const linkStyle = {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 'bold'
  };

  // Tab content components
  const WelcomeTab = () => (
    <div style={videoContainerStyle}>
      <video 
        ref={videoRef}
        style={videoStyle}
        autoPlay
        loop
        muted
        controls
      >
        <source src="/Untitled Video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={{marginTop: '30px', textAlign: 'center', maxWidth: '800px'}}>
        <h2 style={{color: theme === 'dark' ? '#fff' : '#333', marginBottom: '15px'}}>
          Welcome to Travco DMCx 
        </h2>
        <p style={{color: theme === 'dark' ? '#ddd' : '#444', lineHeight: '1.6'}}>
          This platform is designed to streamline our operations and enhance collaboration across all departments.
          Explore the different tabs to learn more about the system and how to use it effectively.
        </p>
      </div>
    </div>
  );

  const AboutTab = () => (
    <div>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>About Travco DMC</h3>
        <div style={sectionContentStyle}>
          <p>
            Travco DMC is a leading Destination Management Company specializing in providing comprehensive travel services.
            Our internal management system is designed to streamline operations, enhance collaboration, and provide
            efficient service to our clients.
          </p>
          <p style={{marginTop: '15px'}}>
            This platform integrates various aspects of our business including reservations, quotations, offers,
            messaging, and more into a single, unified interface.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Our Mission</h3>
        <div style={sectionContentStyle}>
          <p>
            Our mission is to provide exceptional travel experiences through efficient operations, personalized service,
            and innovative solutions. This platform helps us achieve that mission by:
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li>Centralizing all operations in one system</li>
            <li>Facilitating seamless communication between departments</li>
            <li>Providing real-time access to critical information</li>
            <li>Streamlining workflows to enhance productivity</li>
            <li>Ensuring consistent service quality across all touchpoints</li>
          </ul>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Key Features</h3>
        <div style={sectionContentStyle}>
          <p>
            Our platform offers a comprehensive set of features designed to support all aspects of our operations:
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Reservations Management:</strong> Create, track, and manage client reservations</li>
            <li><strong>Quotation System:</strong> Generate detailed quotations for clients</li>
            <li><strong>Offers Management:</strong> Create and track special offers</li>
            <li><strong>Messaging System:</strong> Internal communication between employees</li>
            <li><strong>CRM Tools:</strong> Manage client relationships and information</li>
            <li><strong>Data Management:</strong> Access and update rates, guides, and other essential data</li>
            <li><strong>Reporting:</strong> Generate and view operational reports</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const InstructionsTab = () => (
    <div>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Navigation Overview</h3>
        <div style={sectionContentStyle}>
          <p>
            The sidebar on the left contains all the main sections of the application. Each section expands to show
            the available pages. Your access to these sections depends on your role in the organization.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Messages</h3>
        <div style={sectionContentStyle}>
          <p>
            The Messages page allows you to communicate with other employees within the system.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Conversations:</strong> View and search for conversations with other employees</li>
            <li><strong>Messaging:</strong> Send and receive messages in real-time</li>
            <li><strong>Link Sharing:</strong> Share links to reservations, offers, and quotations directly in messages</li>
            <li><strong>Notifications:</strong> Receive notifications for new messages</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            To start a conversation, select an employee from the list on the left. Type your message in the input field
            at the bottom and click "Send". You can also attach links to reservations, offers, or quotations by clicking
            the link icon.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Incoming</h3>
        <div style={sectionContentStyle}>
          <p>
            The Incoming section manages all incoming reservations and hotel contracts.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Reservations List:</strong> View all reservations in the system</li>
            <li><strong>New Reservation:</strong> Create a new reservation for clients</li>
            <li><strong>Hotel Contracts:</strong> Manage contracts with hotels</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            To create a new reservation, navigate to "New Reservation" and fill in the required information.
            You can view existing reservations in the "Reservations List" and click on any reservation to view its details.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Contracting</h3>
        <div style={sectionContentStyle}>
          <p>
            The Contracting section manages contracts with various partners.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Contracting List:</strong> View all contracts in the system</li>
            <li><strong>Agent Contracts:</strong> Manage contracts with travel agents</li>
            <li><strong>Market Contracts:</strong> Manage contracts for specific markets</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            The contracting system allows you to create, view, and manage different types of contracts.
            Each contract type has specific fields and requirements based on its purpose.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Reports</h3>
        <div style={sectionContentStyle}>
          <p>
            The Reports section provides various operational and financial reports.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Operations:</strong> View operational reports and statistics</li>
            <li><strong>Profit & Loss:</strong> View financial performance reports</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            Reports provide valuable insights into the performance of different aspects of the business.
            They can be filtered by date range and other parameters to focus on specific data points.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Quotations</h3>
        <div style={sectionContentStyle}>
          <p>
            The Quotations section manages all client quotations.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Quotations List:</strong> View all quotations in the system</li>
            <li><strong>New Quotation:</strong> Create a new standard quotation</li>
            <li><strong>New Special Quotation:</strong> Create a new special quotation with custom parameters</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            Quotations are detailed price estimates provided to clients. They can be converted to reservations
            once the client confirms. The system calculates prices based on the selected services, dates, and rates.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Offers</h3>
        <div style={sectionContentStyle}>
          <p>
            The Offers section manages special promotional offers.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Offers List:</strong> View all offers in the system</li>
            <li><strong>Add New Offer:</strong> Create a new promotional offer</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            Offers are special promotions that can be shared with clients or travel agents. They typically include
            package deals, discounts, or special services for specific dates or destinations.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Marketing</h3>
        <div style={sectionContentStyle}>
          <p>
            The Marketing section manages marketing initiatives and loyalty programs.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Points System:</strong> Manage the client points reward system</li>
            <li><strong>Loyalty Program:</strong> Configure and track loyalty program benefits</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            The marketing tools help engage clients through rewards and loyalty programs.
            Points can be awarded for bookings and redeemed for benefits or discounts on future services.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>CRM</h3>
        <div style={sectionContentStyle}>
          <p>
            The CRM (Customer Relationship Management) section manages client relationships and related services.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Transportation:</strong> Manage transportation providers and services</li>
            <li><strong>Travel Agents:</strong> Manage relationships with travel agents</li>
            <li><strong>Facilities:</strong> Manage facilities and venues</li>
            <li><strong>Tasks:</strong> Create and track tasks related to client management</li>
            <li><strong>Files:</strong> Store and manage client-related files</li>
            <li><strong>AI Assistant:</strong> Get AI-powered assistance for CRM tasks</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            The CRM tools help maintain strong relationships with clients and partners by organizing
            information, tracking interactions, and managing related services.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Data</h3>
        <div style={sectionContentStyle}>
          <p>
            The Data section manages rates and information for various services.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Hotel Rates:</strong> Manage standard hotel rates</li>
            <li><strong>Special Hotel Rates:</strong> Manage special or seasonal hotel rates</li>
            <li><strong>Entrance Fees:</strong> Manage entrance fees for attractions</li>
            <li><strong>Transportation:</strong> Manage transportation rates</li>
            <li><strong>Guides:</strong> Manage guide information and rates</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            The data management tools ensure that all rates and information used in quotations and reservations
            are up-to-date and accurate. Regular updates to these data points are essential for providing
            accurate pricing to clients.
          </p>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Travco Jordan</h3>
        <div style={sectionContentStyle}>
          <p>
            The Travco Jordan section manages internal company information.
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Employees:</strong> Manage employee information and access</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            This section is primarily for administrative purposes, allowing management to maintain
            employee records and system access permissions.
          </p>
        </div>
      </div>
    </div>
  );

  const ResourcesTab = () => (
    <div>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Useful Resources</h3>
        <div style={sectionContentStyle}>
          <p>
            Here are some useful resources to help you make the most of the Travco DMC system:
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li>
              <strong>Training Materials:</strong> Access training documents and videos to learn how to use the system effectively.
            </li>
            <li>
              <strong>Standard Operating Procedures:</strong> Reference guides for common tasks and workflows.
            </li>
            <li>
              <strong>Contact Directory:</strong> Find contact information for key personnel and departments.
            </li>
            <li>
              <strong>FAQ:</strong> Answers to frequently asked questions about the system.
            </li>
          </ul>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Best Practices</h3>
        <div style={sectionContentStyle}>
          <p>
            Follow these best practices to ensure efficient use of the system:
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li>Update client information regularly to maintain accurate records</li>
            <li>Use the messaging system for all internal communications related to bookings</li>
            <li>Attach relevant documents to reservations and quotations for easy reference</li>
            <li>Check for existing quotations before creating new ones for the same client</li>
            <li>Regularly review and update rates in the Data section</li>
            <li>Use standardized naming conventions for files and documents</li>
            <li>Log out when not using the system to maintain security</li>
          </ul>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Support</h3>
        <div style={sectionContentStyle}>
          <p>
            If you encounter any issues or have questions about the system, contact the IT support team:
          </p>
          <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
            <li><strong>Email:</strong> support@travco-jordan.com</li>
            <li><strong>Phone:</strong> Internal Extension 123</li>
            <li><strong>Hours:</strong> Sunday-Thursday, 9:00 AM - 5:00 PM</li>
          </ul>
          <p style={{marginTop: '15px'}}>
            For urgent issues outside of regular hours, please contact the on-call support at Extension 999.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: theme === 'dark' ? '#fff' : '#333' }}>Home</h1>
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={welcomeTextStyle}>Welcome, {user.name}!</div>
          <div style={subTextStyle}>
            Access all your tools and resources from this central dashboard. Explore the tabs below to learn more about the system.
          </div>
        </div>
        
        <div style={tabsContainerStyle}>
          <div
            style={tabStyle(activeTab === 'welcome')}
            onClick={() => setActiveTab('welcome')}
          >
            Welcome
          </div>
          <div
            style={tabStyle(activeTab === 'about')}
            onClick={() => setActiveTab('about')}
          >
            About
          </div>
          <div
            style={tabStyle(activeTab === 'instructions')}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </div>
          <div
            style={tabStyle(activeTab === 'resources')}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </div>
          <div
            style={tabStyle(activeTab === 'noticeboard')}
            onClick={() => setActiveTab('noticeboard')}
          >
            Notice Board
          </div>
        </div>
        
        <div style={contentStyle}>
          {activeTab === 'welcome' && <WelcomeTab />}
          {activeTab === 'about' && <AboutTab />}
          {activeTab === 'instructions' && <InstructionsTab />}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'noticeboard' && <NoticeBoard />}
        </div>
      </div>
    </div>
  );
};

export default Home;