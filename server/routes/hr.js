import express from 'express';
import { Employee, Warning, Leave, Payroll, User } from '../models/index.js';
import { authenticateUser } from '../middleware/auth.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'hr');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image, PDF, and Word document files are allowed'));
  }
});

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Middleware to check if user is HR or admin
const isHROrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.department === 'HR') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. HR or admin role required.' });
  }
};

// Middleware to check if user is a manager
const isManager = (req, res, next) => {
  if (req.user.role === 'Department Head' || req.user.role === 'General Manager') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Manager role required.' });
  }
};

// Middleware to check if user is General Manager
const isGeneralManager = (req, res, next) => {
  if (req.user.role === 'General Manager') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. General Manager role required.' });
  }
};

// ===== EMPLOYEE ROUTES =====

// @route   GET /api/hr/employees
// @desc    Get all employees
// @access  Private (HR, Admin)
router.get('/employees', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ lastName: 1, firstName: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/employees/:id
// @desc    Get employee by ID
// @access  Private (HR, Admin, Self)
router.get('/employees/:id', authenticateUser, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is HR, admin, or the employee themselves
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/hr/employees
// @desc    Create a new employee
// @access  Private (HR, Admin)
router.post('/employees', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const {
      userId,
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      manager,
      dateOfBirth,
      dateOfJoining,
      salary,
      status,
      leaveBalance
    } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ $or: [{ userId }, { employeeId }, { email }] });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }
    
    // Create new employee
    const employee = new Employee({
      userId,
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      manager,
      dateOfBirth,
      dateOfJoining,
      salary,
      status,
      leaveBalance
    });
    
    await employee.save();
    
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/employees/:id
// @desc    Update an employee
// @access  Private (HR, Admin)
router.put('/employees/:id', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update fields
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/hr/employees/:id
// @desc    Delete an employee
// @access  Private (HR, Admin)
router.delete('/employees/:id', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== WARNING ROUTES =====

// @route   GET /api/hr/warnings
// @desc    Get all warnings
// @access  Private (HR, Admin)
router.get('/warnings', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const warnings = await Warning.find().sort({ issuedDate: -1 });
    res.json(warnings);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/warnings/user/:username
// @desc    Get warnings for a specific user
// @access  Private (HR, Admin, Self)
router.get('/warnings/user/:username', authenticateUser, async (req, res) => {
  try {
    // Find the employee by username
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const employee = await Employee.findOne({ userId: user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is HR, admin, or the employee themselves
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && req.user.username !== req.params.username) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const warnings = await Warning.find({ employeeId: employee._id }).sort({ issuedDate: -1 });
    res.json(warnings);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/warnings/:id
// @desc    Get warning by ID
// @access  Private (HR, Admin, Self)
router.get('/warnings/:id', authenticateUser, async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ message: 'Warning not found' });
    }
    
    const employee = await Employee.findById(warning.employeeId);
    
    // Check if user is HR, admin, or the employee themselves
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(warning);
  } catch (error) {
    console.error('Error fetching warning:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/hr/warnings
// @desc    Create a new warning
// @access  Private (HR, Admin)
router.post('/warnings', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const {
      employeeId,
      title,
      description,
      severity,
      acknowledgementRequired,
      expiryDate
    } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Create new warning
    const warning = new Warning({
      employeeId,
      title,
      description,
      issuedBy: req.user.id,
      severity: severity || 'low',
      acknowledgementRequired: acknowledgementRequired !== undefined ? acknowledgementRequired : true,
      expiryDate
    });
    
    await warning.save();
    
    res.status(201).json(warning);
  } catch (error) {
    console.error('Error creating warning:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/warnings/:id/acknowledge
// @desc    Acknowledge a warning
// @access  Private (Self)
router.put('/warnings/:id/acknowledge', authenticateUser, async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ message: 'Warning not found' });
    }
    
    const employee = await Employee.findById(warning.employeeId);
    
    // Check if user is the employee
    if (employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update warning
    warning.acknowledged = true;
    warning.acknowledgedDate = Date.now();
    warning.updatedAt = Date.now();
    
    await warning.save();
    
    res.json(warning);
  } catch (error) {
    console.error('Error acknowledging warning:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/hr/warnings/:id
// @desc    Delete a warning
// @access  Private (HR, Admin)
router.delete('/warnings/:id', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const warning = await Warning.findById(req.params.id);
    
    if (!warning) {
      return res.status(404).json({ message: 'Warning not found' });
    }
    
    await Warning.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Warning deleted' });
  } catch (error) {
    console.error('Error deleting warning:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== LEAVE ROUTES =====

// @route   GET /api/hr/leaves
// @desc    Get all leaves
// @access  Private (HR, Admin, Managers)
router.get('/leaves', authenticateUser, async (req, res) => {
  try {
    // Check if user is HR, admin, or a manager
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && req.user.role !== 'Department Head' && req.user.role !== 'General Manager') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    let query = {};
    
    // If user is a manager, only show leaves for their department
    if (req.user.role === 'Department Head') {
      // Get the manager's department
      const manager = await Employee.findOne({ userId: req.user.id });
      if (manager) {
        // Find employees in the manager's department
        const departmentEmployees = await Employee.find({ department: manager.department });
        const employeeIds = departmentEmployees.map(emp => emp._id);
        
        // Filter leaves by these employee IDs
        query = { employeeId: { $in: employeeIds } };
      }
    }
    
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/leaves/user/:username
// @desc    Get leaves for a specific user
// @access  Private (HR, Admin, Self, Manager)
router.get('/leaves/user/:username', authenticateUser, async (req, res) => {
  try {
    // Find the employee by username
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const employee = await Employee.findOne({ userId: user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is HR, admin, the employee themselves, or their manager
    const isManager = req.user.role === 'Department Head' || req.user.role === 'General Manager';
    const isEmployeeManager = isManager && (await Employee.findOne({ userId: req.user.id, department: employee.department }));
    
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && req.user.username !== req.params.username && !isEmployeeManager) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/leaves/:id
// @desc    Get leave by ID
// @access  Private (HR, Admin, Self, Manager)
router.get('/leaves/:id', authenticateUser, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    const employee = await Employee.findById(leave.employeeId);
    
    // Check if user is HR, admin, the employee themselves, or their manager
    const isManager = req.user.role === 'Department Head' || req.user.role === 'General Manager';
    const isEmployeeManager = isManager && (await Employee.findOne({ userId: req.user.id, department: employee.department }));
    
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && employee.userId !== req.user.id && !isEmployeeManager) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(leave);
  } catch (error) {
    console.error('Error fetching leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/hr/leaves
// @desc    Create a new leave request
// @access  Private (All employees)
router.post('/leaves', authenticateUser, upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason
    } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is the employee or HR/admin
    if (employee.userId !== req.user.id && req.user.role !== 'admin' && req.user.department !== 'HR') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      name: file.originalname,
      path: file.path,
      uploadDate: Date.now()
    })) : [];
    
    // Create new leave request
    const leave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      attachments,
      status: leaveType === 'sick' ? 'approved_by_manager' : 'pending' // Auto-approve sick leave at manager level
    });
    
    await leave.save();
    
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/leaves/:id/manager-approval
// @desc    Update leave request with manager approval
// @access  Private (Managers)
router.put('/leaves/:id/manager-approval', authenticateUser, isManager, async (req, res) => {
  try {
    const { approved, comments } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    const employee = await Employee.findById(leave.employeeId);
    
    // Check if user is the employee's manager
    const manager = await Employee.findOne({ userId: req.user.id });
    if (manager.department !== employee.department && req.user.role !== 'General Manager') {
      return res.status(403).json({ message: 'Access denied. Not the employee\'s manager.' });
    }
    
    // Update leave request
    leave.managerApproval = {
      approved,
      approvedBy: req.user.id,
      approvedDate: Date.now(),
      comments
    };
    
    leave.status = approved ? 'approved_by_manager' : 'rejected_by_manager';
    leave.updatedAt = Date.now();
    
    await leave.save();
    
    res.json(leave);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/leaves/:id/hr-approval
// @desc    Update leave request with HR approval
// @access  Private (HR, Admin)
router.put('/leaves/:id/hr-approval', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const { approved, comments } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // Check if leave has manager approval
    if (leave.status !== 'approved_by_manager' && !leave.managerApproval?.approved) {
      return res.status(400).json({ message: 'Leave request needs manager approval first' });
    }
    
    // Update leave request
    leave.hrApproval = {
      approved,
      approvedBy: req.user.id,
      approvedDate: Date.now(),
      comments
    };
    
    leave.status = approved ? 'approved_by_hr' : 'rejected_by_hr';
    leave.updatedAt = Date.now();
    
    await leave.save();
    
    // If approved, update employee's leave balance
    if (approved) {
      const employee = await Employee.findById(leave.employeeId);
      
      // Calculate leave duration in days
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      // Update leave balance based on leave type
      if (leave.leaveType === 'annual' && employee.leaveBalance.annual >= diffDays) {
        employee.leaveBalance.annual -= diffDays;
      } else if (leave.leaveType === 'sick' && employee.leaveBalance.sick >= diffDays) {
        employee.leaveBalance.sick -= diffDays;
      } else if (leave.leaveType.startsWith('family_death') && employee.leaveBalance.familyDeath >= diffDays) {
        employee.leaveBalance.familyDeath -= diffDays;
      }
      
      await employee.save();
    }
    
    res.json(leave);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/leaves/:id/gm-signature
// @desc    Add GM signature to leave request
// @access  Private (General Manager)
router.put('/leaves/:id/gm-signature', authenticateUser, isGeneralManager, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // Check if leave has HR approval
    if (leave.status !== 'approved_by_hr' && !leave.hrApproval?.approved) {
      return res.status(400).json({ message: 'Leave request needs HR approval first' });
    }
    
    // Update leave request
    leave.gmSignature = {
      signed: true,
      signedBy: req.user.id,
      signedDate: Date.now()
    };
    
    leave.status = 'completed';
    leave.updatedAt = Date.now();
    
    await leave.save();
    
    res.json(leave);
  } catch (error) {
    console.error('Error adding GM signature:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/hr/leaves/:id
// @desc    Delete a leave request
// @access  Private (HR, Admin)
router.delete('/leaves/:id', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // Delete attachments
    if (leave.attachments && leave.attachments.length > 0) {
      leave.attachments.forEach(attachment => {
        try {
          fs.unlinkSync(attachment.path);
        } catch (err) {
          console.error('Error deleting attachment file:', err);
        }
      });
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== PAYROLL ROUTES =====

// @route   GET /api/hr/payroll
// @desc    Get all payrolls
// @access  Private (HR, Admin)
router.get('/payroll', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/payroll/user/:username
// @desc    Get payrolls for a specific user
// @access  Private (HR, Admin, Self)
router.get('/payroll/user/:username', authenticateUser, async (req, res) => {
  try {
    // Find the employee by username
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const employee = await Employee.findOne({ userId: user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if user is HR, admin, or the employee themselves
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && req.user.username !== req.params.username) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const payrolls = await Payroll.find({ employeeId: employee._id }).sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/hr/payroll/:id
// @desc    Get payroll by ID
// @access  Private (HR, Admin, Self)
router.get('/payroll/:id', authenticateUser, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    const employee = await Employee.findById(payroll.employeeId);
    
    // Check if user is HR, admin, or the employee themselves
    if (req.user.role !== 'admin' && req.user.department !== 'HR' && employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/hr/payroll
// @desc    Create a new payroll
// @access  Private (HR, Admin)
router.post('/payroll', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      payrollType,
      baseSalary,
      additions,
      deductions,
      netSalary,
      paymentDate,
      paymentStatus
    } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if payroll already exists for this employee, month, year, and type
    const existingPayroll = await Payroll.findOne({
      employeeId,
      month,
      year,
      payrollType
    });
    
    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll already exists for this employee, month, year, and type' });
    }
    
    // Calculate total additions
    const totalAdditions = additions ? additions.reduce((sum, addition) => sum + addition.amount, 0) : 0;
    
    // Calculate total deductions
    const totalDeductions = deductions ? deductions.reduce((sum, deduction) => sum + deduction.amount, 0) : 0;
    
    // Calculate net salary if not provided
    const calculatedNetSalary = netSalary || (baseSalary + totalAdditions - totalDeductions);
    
    // Create new payroll
    const payroll = new Payroll({
      employeeId,
      month,
      year,
      payrollType: payrollType || 'main',
      baseSalary,
      additions: additions || [],
      deductions: deductions || [],
      totalAdditions,
      totalDeductions,
      netSalary: calculatedNetSalary,
      paymentDate,
      paymentStatus: paymentStatus || 'pending',
      createdBy: req.user.id
    });
    
    await payroll.save();
    
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/payroll/:id/addition
// @desc    Add an addition to a payroll
// @access  Private (HR, Admin)
router.put('/payroll/:id/addition', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Create new addition
    const addition = {
      type,
      amount,
      description,
      approvedBy: req.user.id,
      approvedDate: Date.now()
    };
    
    // Add to payroll
    payroll.additions.push(addition);
    
    // Update total additions
    payroll.totalAdditions += amount;
    
    // Update net salary
    payroll.netSalary = payroll.baseSalary + payroll.totalAdditions - payroll.totalDeductions;
    
    payroll.updatedAt = Date.now();
    
    await payroll.save();
    
    res.json(payroll);
  } catch (error) {
    console.error('Error adding payroll addition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/payroll/:id/deduction
// @desc    Add a deduction to a payroll
// @access  Private (HR, Admin)
router.put('/payroll/:id/deduction', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Check if deduction is being applied after the 25th of the month
    const today = new Date();
    const isAfter25th = today.getDate() > 25;
    
    // Create new deduction
    const deduction = {
      type,
      amount,
      description,
      appliedDate: Date.now(),
      appliedBy: req.user.id
    };
    
    // If deduction is after 25th and payroll is for current month,
    // add to next month's payroll instead
    if (isAfter25th && payroll.month === today.getMonth() + 1 && payroll.year === today.getFullYear()) {
      // Find or create next month's payroll
      let nextMonth = payroll.month + 1;
      let nextYear = payroll.year;
      
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      
      let nextMonthPayroll = await Payroll.findOne({
        employeeId: payroll.employeeId,
        month: nextMonth,
        year: nextYear,
        payrollType: 'main'
      });
      
      if (nextMonthPayroll) {
        // Add deduction to next month's payroll
        nextMonthPayroll.deductions.push(deduction);
        nextMonthPayroll.totalDeductions += amount;
        nextMonthPayroll.netSalary = nextMonthPayroll.baseSalary + nextMonthPayroll.totalAdditions - nextMonthPayroll.totalDeductions;
        nextMonthPayroll.updatedAt = Date.now();
        
        await nextMonthPayroll.save();
        
        return res.json({
          message: 'Deduction added to next month\'s payroll',
          payroll: nextMonthPayroll
        });
      } else {
        // Create next month's payroll with this deduction
        const employee = await Employee.findById(payroll.employeeId);
        
        const newPayroll = new Payroll({
          employeeId: payroll.employeeId,
          month: nextMonth,
          year: nextYear,
          payrollType: 'main',
          baseSalary: employee.salary,
          additions: [],
          deductions: [deduction],
          totalAdditions: 0,
          totalDeductions: amount,
          netSalary: employee.salary - amount,
          paymentStatus: 'pending',
          createdBy: req.user.id
        });
        
        await newPayroll.save();
        
        return res.json({
          message: 'Created next month\'s payroll with this deduction',
          payroll: newPayroll
        });
      }
    } else {
      // Add to current payroll
      payroll.deductions.push(deduction);
      payroll.totalDeductions += amount;
      payroll.netSalary = payroll.baseSalary + payroll.totalAdditions - payroll.totalDeductions;
      payroll.updatedAt = Date.now();
      
      await payroll.save();
      
      return res.json(payroll);
    }
  } catch (error) {
    console.error('Error adding payroll deduction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hr/payroll/:id/status
// @desc    Update payroll status
// @access  Private (HR, Admin)
router.put('/payroll/:id/status', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Update payroll status
    payroll.paymentStatus = status;
    
    // If status is 'paid', set payment date to now
    if (status === 'paid' && !payroll.paymentDate) {
      payroll.paymentDate = Date.now();
    }
    
    payroll.updatedAt = Date.now();
    
    await payroll.save();
    
    res.json(payroll);
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/hr/payroll/:id
// @desc    Delete a payroll
// @access  Private (HR, Admin)
router.delete('/payroll/:id', authenticateUser, isHROrAdmin, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Only allow deletion if payroll is pending
    if (payroll.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete a processed or paid payroll' });
    }
    
    await Payroll.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Payroll deleted' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;