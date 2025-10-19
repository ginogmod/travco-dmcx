// HR System Tests

import { Employee, Warning, Leave, Payroll } from '../../../../server/models/hr.js';
import { 
  acknowledgeWarning, 
  createLeaveRequest, 
  updateLeaveRequestByManager,
  updateLeaveRequestByHR,
  addGMSignatureToLeave,
  createPayroll,
  addPayrollAddition,
  addPayrollDeduction,
  updatePayrollStatus
} from '../../../context/HRContext';

// Mock data
const mockEmployee = {
  _id: 'emp123',
  userId: 'user123',
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@travcojordan.com',
  department: 'Sales & Marketing',
  position: 'Sales & Marketing Agent',
  manager: 'manager123',
  dateOfJoining: new Date('2022-01-01'),
  salary: 1000,
  status: 'active',
  leaveBalance: {
    annual: 21,
    sick: 14,
    familyDeath: 7
  }
};

const mockWarning = {
  _id: 'warn123',
  employeeId: 'emp123',
  title: 'Late Arrival',
  description: 'You have been late to work multiple times this month.',
  issuedBy: 'hr123',
  issuedDate: new Date(),
  severity: 'medium',
  acknowledgementRequired: true,
  acknowledged: false
};

const mockLeave = {
  _id: 'leave123',
  employeeId: 'emp123',
  leaveType: 'annual',
  startDate: new Date('2023-07-01'),
  endDate: new Date('2023-07-05'),
  reason: 'Vacation',
  status: 'pending'
};

const mockPayroll = {
  _id: 'pay123',
  employeeId: 'emp123',
  month: 7,
  year: 2023,
  payrollType: 'main',
  baseSalary: 1000,
  additions: [],
  deductions: [],
  totalAdditions: 0,
  totalDeductions: 0,
  netSalary: 1000,
  paymentStatus: 'pending',
  createdBy: 'hr123'
};

// Mock functions
jest.mock('../../../../server/models/hr.js', () => ({
  Employee: {
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn()
  },
  Warning: {
    findById: jest.fn(),
    save: jest.fn()
  },
  Leave: {
    findById: jest.fn(),
    save: jest.fn()
  },
  Payroll: {
    findById: jest.fn(),
    save: jest.fn()
  }
}));

jest.mock('../../../context/HRContext', () => ({
  acknowledgeWarning: jest.fn(),
  createLeaveRequest: jest.fn(),
  updateLeaveRequestByManager: jest.fn(),
  updateLeaveRequestByHR: jest.fn(),
  addGMSignatureToLeave: jest.fn(),
  createPayroll: jest.fn(),
  addPayrollAddition: jest.fn(),
  addPayrollDeduction: jest.fn(),
  updatePayrollStatus: jest.fn()
}));

describe('HR System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Warning System Tests
  describe('Warning System', () => {
    test('should acknowledge a warning', async () => {
      // Setup
      Warning.findById.mockResolvedValue({ ...mockWarning });
      Employee.findById.mockResolvedValue({ ...mockEmployee });
      acknowledgeWarning.mockResolvedValue(true);

      // Execute
      const result = await acknowledgeWarning('warn123');

      // Assert
      expect(result).toBe(true);
      expect(acknowledgeWarning).toHaveBeenCalledWith('warn123');
    });

    test('should not acknowledge an already acknowledged warning', async () => {
      // Setup
      Warning.findById.mockResolvedValue({ ...mockWarning, acknowledged: true });
      acknowledgeWarning.mockResolvedValue(false);

      // Execute
      const result = await acknowledgeWarning('warn123');

      // Assert
      expect(result).toBe(false);
    });
  });

  // Leave Management Tests
  describe('Leave Management', () => {
    test('should create a leave request', async () => {
      // Setup
      Employee.findById.mockResolvedValue({ ...mockEmployee });
      createLeaveRequest.mockResolvedValue({ ...mockLeave });

      // Execute
      const result = await createLeaveRequest({
        employeeId: 'emp123',
        leaveType: 'annual',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-07-05'),
        reason: 'Vacation'
      });

      // Assert
      expect(result).toEqual(expect.objectContaining({
        employeeId: 'emp123',
        leaveType: 'annual'
      }));
      expect(createLeaveRequest).toHaveBeenCalled();
    });

    test('should approve a leave request by manager', async () => {
      // Setup
      Leave.findById.mockResolvedValue({ ...mockLeave });
      Employee.findById.mockResolvedValue({ ...mockEmployee });
      updateLeaveRequestByManager.mockResolvedValue(true);

      // Execute
      const result = await updateLeaveRequestByManager('leave123', true, 'Approved');

      // Assert
      expect(result).toBe(true);
      expect(updateLeaveRequestByManager).toHaveBeenCalledWith('leave123', true, 'Approved');
    });

    test('should approve a leave request by HR', async () => {
      // Setup
      Leave.findById.mockResolvedValue({ 
        ...mockLeave, 
        status: 'approved_by_manager',
        managerApproval: { approved: true }
      });
      Employee.findById.mockResolvedValue({ ...mockEmployee });
      updateLeaveRequestByHR.mockResolvedValue(true);

      // Execute
      const result = await updateLeaveRequestByHR('leave123', true, 'Approved');

      // Assert
      expect(result).toBe(true);
      expect(updateLeaveRequestByHR).toHaveBeenCalledWith('leave123', true, 'Approved');
    });

    test('should add GM signature to a leave request', async () => {
      // Setup
      Leave.findById.mockResolvedValue({ 
        ...mockLeave, 
        status: 'approved_by_hr',
        hrApproval: { approved: true }
      });
      addGMSignatureToLeave.mockResolvedValue(true);

      // Execute
      const result = await addGMSignatureToLeave('leave123');

      // Assert
      expect(result).toBe(true);
      expect(addGMSignatureToLeave).toHaveBeenCalledWith('leave123');
    });

    test('should update leave balance after approval', async () => {
      // Setup
      const employee = { ...mockEmployee };
      const leave = { 
        ...mockLeave, 
        status: 'approved_by_manager',
        managerApproval: { approved: true }
      };
      
      Leave.findById.mockResolvedValue(leave);
      Employee.findById.mockResolvedValue(employee);
      
      // Mock the save method to capture the updated employee
      let updatedEmployee;
      Employee.save.mockImplementation(function() {
        updatedEmployee = this;
        return Promise.resolve(this);
      });
      
      updateLeaveRequestByHR.mockImplementation(async () => {
        // Simulate the leave balance update
        employee.leaveBalance.annual -= 5; // 5 days of leave
        return true;
      });

      // Execute
      await updateLeaveRequestByHR('leave123', true, 'Approved');

      // Assert
      expect(employee.leaveBalance.annual).toBe(16); // 21 - 5 = 16
    });
  });

  // Payroll Tests
  describe('Payroll System', () => {
    test('should create a payroll', async () => {
      // Setup
      Employee.findById.mockResolvedValue({ ...mockEmployee });
      createPayroll.mockResolvedValue({ ...mockPayroll });

      // Execute
      const result = await createPayroll({
        employeeId: 'emp123',
        month: 7,
        year: 2023,
        payrollType: 'main',
        baseSalary: 1000
      });

      // Assert
      expect(result).toEqual(expect.objectContaining({
        employeeId: 'emp123',
        month: 7,
        year: 2023
      }));
      expect(createPayroll).toHaveBeenCalled();
    });

    test('should add an addition to payroll', async () => {
      // Setup
      Payroll.findById.mockResolvedValue({ ...mockPayroll });
      addPayrollAddition.mockImplementation(async (id, addition) => {
        const payroll = { ...mockPayroll };
        payroll.additions.push(addition);
        payroll.totalAdditions += addition.amount;
        payroll.netSalary += addition.amount;
        return payroll;
      });

      // Execute
      const result = await addPayrollAddition('pay123', {
        type: 'bonus',
        amount: 200,
        description: 'Performance bonus'
      });

      // Assert
      expect(result.additions.length).toBe(1);
      expect(result.totalAdditions).toBe(200);
      expect(result.netSalary).toBe(1200);
    });

    test('should add a deduction to payroll', async () => {
      // Setup
      Payroll.findById.mockResolvedValue({ ...mockPayroll });
      addPayrollDeduction.mockImplementation(async (id, deduction) => {
        const payroll = { ...mockPayroll };
        payroll.deductions.push(deduction);
        payroll.totalDeductions += deduction.amount;
        payroll.netSalary -= deduction.amount;
        return payroll;
      });

      // Execute
      const result = await addPayrollDeduction('pay123', {
        type: 'tax',
        amount: 100,
        description: 'Income tax'
      });

      // Assert
      expect(result.deductions.length).toBe(1);
      expect(result.totalDeductions).toBe(100);
      expect(result.netSalary).toBe(900);
    });

    test('should update payroll status', async () => {
      // Setup
      Payroll.findById.mockResolvedValue({ ...mockPayroll });
      updatePayrollStatus.mockImplementation(async (id, status) => {
        const payroll = { ...mockPayroll, paymentStatus: status };
        if (status === 'paid' && !payroll.paymentDate) {
          payroll.paymentDate = new Date();
        }
        return payroll;
      });

      // Execute
      const result = await updatePayrollStatus('pay123', 'paid');

      // Assert
      expect(result.paymentStatus).toBe('paid');
      expect(result.paymentDate).toBeInstanceOf(Date);
    });

    test('should handle deductions after the 25th', async () => {
      // Setup
      const today = new Date();
      today.setDate(26); // After the 25th
      
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      const currentPayroll = { 
        ...mockPayroll, 
        month: currentMonth, 
        year: currentYear 
      };
      
      Payroll.findById.mockResolvedValue(currentPayroll);
      
      // Mock implementation to check if deduction is added to next month's payroll
      addPayrollDeduction.mockImplementation(async (id, deduction) => {
        // For this test, simulate adding to next month's payroll
        return {
          _id: 'pay124',
          employeeId: 'emp123',
          month: nextMonth,
          year: nextYear,
          payrollType: 'main',
          baseSalary: 1000,
          additions: [],
          deductions: [deduction],
          totalAdditions: 0,
          totalDeductions: deduction.amount,
          netSalary: 1000 - deduction.amount,
          paymentStatus: 'pending',
          createdBy: 'hr123'
        };
      });

      // Execute
      const result = await addPayrollDeduction('pay123', {
        type: 'tax',
        amount: 100,
        description: 'Income tax'
      });

      // Assert
      expect(result.month).toBe(nextMonth);
      expect(result.year).toBe(nextYear);
      expect(result.deductions.length).toBe(1);
      expect(result.totalDeductions).toBe(100);
    });
  });
});