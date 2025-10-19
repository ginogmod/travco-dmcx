# HR System Documentation

## Employee Directory with Centralized Information Access

This document describes the implementation of the centralized employee information access system through the employee directory page.

### Overview

The HR system has been restructured to centralize all employee information access through the employee directory page. An "Info" button has been added next to each employee listing, which reveals a comprehensive tabbed interface displaying Warning History, Leave Records, Payroll Information, and other relevant employee data.

### Features

1. **Info Button**
   - Added next to each employee in the directory
   - Only visible to users with HR, General Manager, or Administrator roles
   - Opens a modal with detailed employee information

2. **Tabbed Interface**
   - **Overview Tab**: Basic employee information (visible to all users with access to the Info button)
   - **Warning History Tab**: Displays employee warnings with severity levels and acknowledgment status
   - **Leave Records Tab**: Shows employee leave history with types, dates, and approval status
   - **Payroll Information Tab**: Displays employee payroll history with salary details

3. **Role-Based Access Control**
   - Only users with HR, General Manager, or Administrator roles can see the Info button
   - Only users with these roles can access the sensitive tabs (Warning History, Leave Records, Payroll)
   - Attempts to access restricted tabs by unauthorized users will show an error message

### Implementation Details

The implementation is located in the following files:

- `src/pages/TravcoJordan/Employees.jsx`: Contains the employee directory and the Info button implementation
- `src/components/LeaveHistory.jsx`: Component for displaying leave history
- `src/components/PayrollHistory.jsx`: Component for displaying payroll information
- `src/components/WarningNotification.jsx`: Component for displaying warnings

### Role-Based Access Control

Access to sensitive employee information is restricted based on user roles:

```javascript
// Check if user has permission to view employee info
const canViewEmployeeInfo = user.role === 'HR Administrator' ||
                           user.role === 'General Manager' ||
                           user.role === 'Administrator' ||
                           user.department === 'HR';
```

### Testing

To test the implementation with different user roles:

1. Log in as a user with HR, General Manager, or Administrator role to see the Info button and access all tabs
2. Log in as a regular user to verify that the Info button is not visible
3. Console logs have been added to help with testing:
   ```javascript
   console.log('User role:', user.role);
   console.log('User department:', user.department);
   console.log('Can view sensitive info:', canViewSensitiveInfo);
   ```

### Future Improvements

Potential future improvements to the system:

1. Add ability to edit employee information directly from the tabbed interface
2. Implement real-time updates for employee data
3. Add more detailed reporting and analytics features
4. Enhance the UI with additional visualizations for leave balances and payroll history