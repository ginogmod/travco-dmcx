import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import WarningHistory from "./pages/HR/WarningHistory";
import Home from "./pages/Home";
import Reservations from "./pages/Reservations";
import ReservationsList from "./pages/ReservationsList";
import NewReservation from "./pages/NewReservation";
import HotelContracts from "./pages/Incoming/HotelContracts";
import HotelContractsView from "./pages/Incoming/HotelContractsView";
import ContractingList from "./pages/Contracting/ContractingList";
import ContractView from "./pages/Contracting/ContractView";
import AgentContract from "./pages/Contracting/AgentContract";
import MarketContract from "./pages/Contracting/MarketContract";
import logo from "./assets/logo.png";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Inbox from "./components/Inbox";
import WarningNotification from "./components/WarningNotification";
import { useTheme } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import { initGlobalRovingFocus } from "./utils/keyboardNav";

// ✅ CRM Section imports
import Transportation from "./pages/CRM/Transportation";
import TravelAgents from "./pages/CRM/TravelAgents";
import Facilities from "./pages/CRM/Facilities";
import Tasks from "./pages/CRM/Tasks";
import Files from "./pages/CRM/Files";
import AIAssistant from "./pages/CRM/AIAssistant";

// ✅ Offers Section imports
import Offers from "./pages/Offers/Offers";
import AddOffer from "./pages/Offers/AddOffer";
import OfferView from "./pages/Offers/OfferView";
import GroupSeriesOfferList from "./pages/Offers/GroupSeriesOfferList";
import GroupSeriesAddOffer from "./pages/Offers/GroupSeriesAddOffer";

// ✅ Closing Section imports
import WrapUp from "./pages/Closing/WrapUp";

// ✅ Travco Jordan imports
import Employees from "./pages/TravcoJordan/Employees";
import Messages from "./pages/Messages";

// ✅ HR Section imports
import HRDashboard from "./pages/HR/Dashboard";
import EmployeePortal from "./pages/HR/EmployeePortal";

// ✅ Marketing Section imports
import PointsSystem from "./pages/Marketing/PointsSystem";
import LoyaltyProgram from "./pages/Marketing/LoyaltyProgram";
import AgencyLoginPage from "./pages/AgencyLogin";
import AgencyDashboard from "./pages/AgencyDashboard";

// ✅ Quotations Page import
import QuotationsPage from "./pages/Quotations/Quotations";
import SpecialQuotationsPage from "./pages/Quotations/SpecialQuotations";
import QuotationView from "./pages/Quotations/QuotationView";
import QuotationsList from "./pages/Quotations/QuotationsList";
import QuotationHelpSheet from "./pages/Quotations/QuotationHelpSheet";
import GroupSeriesQuotationCreator from "./pages/Quotations/GroupSeriesQuotationCreator";
import GroupSeriesQuotationsList from "./pages/Quotations/GroupSeriesQuotationsList";
import GroupSeriesQuotationView from "./pages/Quotations/GroupSeriesQuotationView";

// ✅ Hotel Rates Page import
import HotelRatesEntry from "./pages/HotelRatesEntry";
import EntranceFeeRates from "./pages/Data/EntranceFeeRates";
import TransportationData from "./pages/Data/Transportation";
import Guides from "./pages/Data/Guides";
import SpecialHotelRates from "./pages/Data/SpecialHotelRates";
import AgentHotelRates from "./pages/Data/AgentHotelRates";
import RestaurantRatesEntry from "./pages/Data/RestaurantRatesEntry";
import Operations from "./pages/Reports/Operations";

const ROLES = {
  GENERAL_MANAGER: 'General Manager',
  ADMINISTRATOR: 'Administrator',
  SALES_MARKETING_MANAGER: 'Sales & Marketing Manager',
  HR_ADMIN: 'HR Administrator',
  DATA_ENTRY: 'Data Entry Agent',
  CRM: 'CRM Agent',
  RESERVATIONS: 'Reservations Agent',
  EXPERT_TOUR_OPERATOR: 'Expert Tour Operator',
  FINANCE: 'Finance Agent',
  AGENCY: 'Agency',
  DEPARTMENT_HEAD: 'Department Head',
  OPERATIONS: 'Operations Agent',
  SALES_MARKETING: 'Sales & Marketing Agent',
  DRIVER: 'Driver',
};

// HR roles
const hrRoles = [ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.HR_ADMIN, ROLES.DEPARTMENT_HEAD];

const allAccessRoles = [ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.HR_ADMIN, ROLES.DATA_ENTRY, ROLES.DEPARTMENT_HEAD];
const employeeManagementRoles = [ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.HR_ADMIN, ROLES.DEPARTMENT_HEAD];
// All roles have access to messages
const allRoles = Object.values(ROLES);

const navLinks = [
  {
    section: 'Home',
    links: [
      { to: '/home', label: 'Home', roles: allRoles },
    ],
  },
  {
    section: 'Messages',
    links: [
      { to: '/messages', label: 'Messages', roles: allRoles },
    ],
  },
  {
    section: 'Incoming',
    links: [
      {
        to: '/reservations-list',
        label: 'Reservations',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]
      },
      {
        to: '/reservations/new',
        label: 'New Reservation',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]
      },
    ],
  },
  {
    section: 'Contracting',
    links: [
      {
        to: '/contracting',
        label: 'Contracting List',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]
      },
    ],
  },
  {
    section: 'Reports',
    links: [
      {
        to: '/reports/operations',
        label: 'Operations',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: [...allAccessRoles, ROLES.FINANCE]
      },
      {
        to: '/reports/profit-loss',
        label: 'Profit & Loss',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: [...allAccessRoles, ROLES.FINANCE]
      },
    ],
  },
  {
    section: 'Quotations',
    links: [
      { to: '/quotations/quotations-list', label: 'Quotations List', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/quotations/quotations', label: 'New Quotation', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/quotations/special-quotations', label: 'New Special Quotation', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/quotations/group-series-creator', label: 'New Group Series Quotation', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/quotations/group-series-list', label: 'Group Series Quotations', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
    ],
  },
  {
    section: 'Offers',
    links: [
      { to: '/offers', label: 'Offers List', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/offers/new', label: 'Add New Offer', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/offers/group-series-list', label: 'Group Series Offers', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
      { to: '/offers/group-series-new', label: 'New Group Series Offer', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
    ],
  },
  {
    section: 'Marketing',
    links: [
      { to: '/marketing/points-system', label: 'Points System', roles: [ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.SALES_MARKETING_MANAGER] },
      { to: '/marketing/loyalty-program', label: 'Loyalty Program', roles: [ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.SALES_MARKETING_MANAGER] },
    ],
  },
  {
    section: 'Closing',
    links: [
      { to: '/closing/wrap-up', label: 'Wrap Up', roles: [...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR] },
    ],
  },
  {
    section: 'CRM',
    links: [
      { to: '/crm/transportation', label: 'Transportation', roles: [...allAccessRoles, ROLES.CRM] },
      { to: '/crm/travel-agents', label: 'Travel Agents', roles: [...allAccessRoles, ROLES.CRM] },
      { to: '/crm/facilities', label: 'Facilities', roles: [...allAccessRoles, ROLES.CRM] },
      { to: '/crm/tasks', label: 'Tasks', roles: [...allAccessRoles, ROLES.CRM] },
      { to: '/crm/files', label: 'Files', roles: [...allAccessRoles, ROLES.CRM] },
      { to: '/crm/ai-assistant', label: 'AI Assistant', roles: [...allAccessRoles, ROLES.CRM] },
    ],
  },
  {
    section: 'Data',
    links: [
      { to: '/hotel-rates', label: 'Hotel Rates', roles: allAccessRoles },
      { to: '/data/special-hotel-rates', label: 'Special Hotel Rates', roles: allAccessRoles },
      { to: '/data/entrance-fees', label: 'Entrance Fees', roles: allAccessRoles },
      { to: '/data/transportation', label: 'Transportation', roles: allAccessRoles },
      { to: '/data/guides', label: 'Guides', roles: allAccessRoles },
      { to: '/data/restaurants', label: 'Restaurant Rates', roles: allAccessRoles },
    ],
  },
  {
    section: 'Travco Jordan',
    links: [
      { to: '/travco-jordan/employees', label: 'Employees', roles: employeeManagementRoles },
      { to: '/travco-jordan/dashboard', label: 'HR Dashboard', roles: hrRoles },
      {
        to: '/travco-jordan/employee-portal',
        label: 'Employee Portal',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: allRoles
      },
      {
        to: '/travco-jordan/warning-history',
        label: 'Warning History',
        tag: { text: 'Under Development', color: '#FF9800' },
        roles: allRoles
      },
    ],
  },
];

function App() {
  const { user, logout } = useAuth();
  // Consume theme (body gets class from ThemeProvider; we keep dark palette and invert for light in CSS)
  const { theme } = useTheme();

  useEffect(() => {
    initGlobalRovingFocus();
  }, []);

  // Removed the visibilitychange event listener that was causing page refresh
  // when tabbing out and back in

  const layoutStyle = {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#121212",
    fontFamily: "Segoe UI, sans-serif",
    color: "white"
  };

  const sidebarStyle = {
    width: "240px",
    backgroundColor: "#1f1f1f",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    borderRight: "1px solid #333"
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  };

  const sectionHeader = {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "6px",
    borderBottom: "1px solid #333",
    paddingBottom: "4px"
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
    padding: "5px 10px",
    borderRadius: "6px"
  };

  const contentStyle = {
    flex: 1,
    padding: "40px",
    position: "relative",
    overflowX: "auto",
    backgroundColor: "#121212"
  };

  const logoStyle = {
    position: "absolute",
    top: "20px",
    right: "30px",
    height: "80px",
    width: "auto",
    zIndex: 999
  };

  const userInfoStyle = {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  };

  const Sidebar = () => (
    <aside style={sidebarStyle}>
      <div style={userInfoStyle}>
        <div>{user.name}</div>
        <div>{user.role}</div>
      </div>
      <ThemeToggle />
      {navLinks.map(section => {
        const accessibleLinks = section.links.filter(link => {
          if (link.roles.includes(user.role)) return true;
          // Allow all users in the Inbound department to see the Data section links
          if (section.section === 'Data' && user?.department === 'Inbound') return true;
          return false;
        });
        if (accessibleLinks.length === 0) return null;

        return (
          <div key={section.section} style={sectionStyle} data-kb-nav="1" data-kb-axis="vertical" data-kb-wrap="true">
            <div style={sectionHeader}>{section.section}</div>
            {accessibleLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={linkStyle}
                tabIndex={0}
                data-kb-item
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = link.to;
                }}
              >
                {link.label}
                {link.tag && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '10px',
                    padding: '2px 4px',
                    backgroundColor: link.tag.color || '#FF9800',
                    color: 'white',
                    borderRadius: '4px',
                    fontWeight: 'normal',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}>
                    {link.tag.text}
                  </span>
                )}
              </Link>
            ))}
          </div>
        );
      })}
      <button onClick={logout} style={{ ...linkStyle, background: 'red', color: 'white', marginTop: 'auto' }}>Logout</button>
    </aside>
  );

  return (
    <Router>
      <div style={layoutStyle}>
        {user && user.role !== 'Agency' && <Sidebar />}
        <div style={contentStyle}>
          {user && <img src={logo} alt="Travco Logo" style={logoStyle} />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/agency/login" element={<AgencyLoginPage />} />
            <Route path="/" element={user ? (user.role === 'Agency' ? <Navigate to="/agency/dashboard" /> : <Navigate to="/home" />) : <Navigate to="/login" />} />
            
            <>
              <Route path="/home" element={<ProtectedRoute allowedRoles={Object.values(ROLES)}><Home /></ProtectedRoute>} />
              <Route path="/reservations-list" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><ReservationsList /></ProtectedRoute>} />
              <Route path="/reservations/new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><NewReservation /></ProtectedRoute>} />
              <Route path="/reservations/:fileNo" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><Reservations /></ProtectedRoute>} />
              <Route path="/hotel-contracts/new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><HotelContracts /></ProtectedRoute>} />
              <Route path="/hotel-contracts/hotel/:hotelName" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><HotelContractsView /></ProtectedRoute>} />
              <Route path="/hotel-contracts/view/:contractId" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><HotelContracts /></ProtectedRoute>} />
              <Route path="/contracting" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><ContractingList /></ProtectedRoute>} />
              <Route path="/agent-contracts" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AgentContract /></ProtectedRoute>} />
              <Route path="/agent-contracts/new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AgentContract /></ProtectedRoute>} />
              <Route path="/agent-contracts/agent/:agentName" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AgentContract /></ProtectedRoute>} />
              <Route path="/agent-contracts/view/:contractId" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AgentContract /></ProtectedRoute>} />
              <Route path="/market-contracts" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><MarketContract /></ProtectedRoute>} />
              <Route path="/market-contracts/new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><MarketContract /></ProtectedRoute>} />
              <Route path="/market-contracts/market/:marketName" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><MarketContract /></ProtectedRoute>} />
              <Route path="/market-contracts/view/:contractId" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><MarketContract /></ProtectedRoute>} />
              <Route path="/crm/transportation" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><Transportation /></ProtectedRoute>} />
              <Route path="/crm/travel-agents" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><TravelAgents /></ProtectedRoute>} />
              <Route path="/crm/facilities" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><Facilities /></ProtectedRoute>} />
              <Route path="/crm/tasks" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><Tasks /></ProtectedRoute>} />
              <Route path="/crm/files" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><Files /></ProtectedRoute>} />
              <Route path="/crm/ai-assistant" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.CRM]}><AIAssistant /></ProtectedRoute>} />
              <Route path="/reports/operations" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.FINANCE]}><Operations /></ProtectedRoute>} />
              <Route path="/reports/profit-loss" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.FINANCE]}><h2>Profit & Loss Report</h2></ProtectedRoute>} />
              <Route path="/quotations/quotations" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><QuotationsPage /></ProtectedRoute>} />
              <Route path="/quotations/special-quotations" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><SpecialQuotationsPage /></ProtectedRoute>} />
              <Route path="/quotations/view/:id" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><QuotationView /></ProtectedRoute>} />
              <Route path="/quotations/quotations-list" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><QuotationsList /></ProtectedRoute>} />
              <Route path="/quotations/group-series-creator" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesQuotationCreator /></ProtectedRoute>} />
              <Route path="/quotations/group-series-list" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesQuotationsList /></ProtectedRoute>} />
              <Route path="/quotations/group-series-view/:id" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesQuotationView /></ProtectedRoute>} />
              <Route path="/quotation-help" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><QuotationHelpSheet /></ProtectedRoute>} />
              <Route path="/offers" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><Offers /></ProtectedRoute>} />
              <Route path="/offers/new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AddOffer key="new-offer" /></ProtectedRoute>} />
              <Route path="/offers/:id" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><OfferView /></ProtectedRoute>} />
              <Route path="/offers/edit/:id" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><AddOffer key="edit-offer" /></ProtectedRoute>} />
              <Route path="/offers/group-series-list" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesOfferList /></ProtectedRoute>} />
              <Route path="/offers/group-series-new" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesAddOffer key="new-group-series-offer" /></ProtectedRoute>} />
              <Route path="/offers/group-series/:id" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><GroupSeriesAddOffer key="view-group-series-offer" /></ProtectedRoute>} />
              <Route path="/closing/wrap-up" element={<ProtectedRoute allowedRoles={[...allAccessRoles, ROLES.RESERVATIONS, ROLES.EXPERT_TOUR_OPERATOR]}><WrapUp /></ProtectedRoute>} />
              <Route path="/marketing/points-system" element={<ProtectedRoute allowedRoles={[ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.SALES_MARKETING_MANAGER]}><PointsSystem /></ProtectedRoute>} />
              <Route path="/marketing/loyalty-program" element={<ProtectedRoute allowedRoles={[ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR, ROLES.SALES_MARKETING_MANAGER]}><LoyaltyProgram /></ProtectedRoute>} />
              <Route path="/agency/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.AGENCY]}><AgencyDashboard /></ProtectedRoute>} />
              <Route path="/hotel-rates" element={<ProtectedRoute allowedRoles={allAccessRoles}><HotelRatesEntry /></ProtectedRoute>} />
              <Route path="/data/special-hotel-rates" element={<ProtectedRoute allowedRoles={allAccessRoles}><SpecialHotelRates /></ProtectedRoute>} />
              <Route path="/data/special-hotel-rates/:agentId" element={<ProtectedRoute allowedRoles={allAccessRoles}><AgentHotelRates /></ProtectedRoute>} />
              <Route path="/data/entrance-fees" element={<ProtectedRoute allowedRoles={allAccessRoles}><EntranceFeeRates /></ProtectedRoute>} />
              <Route path="/data/transportation" element={<ProtectedRoute allowedRoles={allAccessRoles}><TransportationData /></ProtectedRoute>} />
              <Route path="/data/guides" element={<ProtectedRoute allowedRoles={[ROLES.GENERAL_MANAGER, ROLES.ADMINISTRATOR]}><Guides /></ProtectedRoute>} />
              <Route path="/data/restaurants" element={<ProtectedRoute allowedRoles={allAccessRoles}><RestaurantRatesEntry /></ProtectedRoute>} />
              <Route path="/travco-jordan/employees" element={<ProtectedRoute allowedRoles={employeeManagementRoles}><Employees /></ProtectedRoute>} />
              <Route path="/travco-jordan/dashboard" element={<ProtectedRoute allowedRoles={hrRoles}><HRDashboard /></ProtectedRoute>} />
              <Route path="/travco-jordan/employee-portal" element={<ProtectedRoute allowedRoles={Object.values(ROLES)}><EmployeePortal /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute allowedRoles={Object.values(ROLES)}><Messages /></ProtectedRoute>} />
            </>
            <Route path="*" element={<Navigate to={user ? (user.role === 'Agency' ? '/agency/dashboard' : '/home') : '/login'} replace />} />
            {/* All routes are defined above. No duplicate routes needed here. */}
          </Routes>
          {user && <WarningNotification />}
        </div>
      </div>
    </Router>
  );
}

export default App;
