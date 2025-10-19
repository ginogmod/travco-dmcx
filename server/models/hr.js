import mongoose from 'mongoose';

// Employee Schema (extends the User schema with HR-specific fields)
const employeeSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  manager: {
    type: String,
    ref: 'Employee'
  },
  dateOfBirth: {
    type: Date
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  leaveBalance: {
    annual: {
      type: Number,
      default: 21 // Default annual leave days
    },
    sick: {
      type: Number,
      default: 14 // Default sick leave days
    },
    familyDeath: {
      type: Number,
      default: 7 // Default family death leave days
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Warning Schema
const warningSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    ref: 'Employee',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  issuedBy: {
    type: String,
    ref: 'User',
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  acknowledgementRequired: {
    type: Boolean,
    default: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Leave Schema
const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'family_death_level1', 'family_death_level2', 'family_death_level3'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  attachments: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved_by_manager', 'rejected_by_manager', 'approved_by_hr', 'rejected_by_hr', 'completed'],
    default: 'pending'
  },
  managerApproval: {
    approved: Boolean,
    approvedBy: {
      type: String,
      ref: 'User'
    },
    approvedDate: Date,
    comments: String
  },
  hrApproval: {
    approved: Boolean,
    approvedBy: {
      type: String,
      ref: 'User'
    },
    approvedDate: Date,
    comments: String
  },
  gmSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedBy: {
      type: String,
      ref: 'User'
    },
    signedDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Payroll Schema
const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payrollType: {
    type: String,
    enum: ['main', 'additional', 'overtime'],
    default: 'main'
  },
  baseSalary: {
    type: Number,
    required: true
  },
  additions: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    approvedBy: {
      type: String,
      ref: 'User'
    },
    approvedDate: Date
  }],
  deductions: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    appliedDate: {
      type: Date,
      default: Date.now
    },
    appliedBy: {
      type: String,
      ref: 'User'
    }
  }],
  totalAdditions: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const Employee = mongoose.model('Employee', employeeSchema);
const Warning = mongoose.model('Warning', warningSchema);
const Leave = mongoose.model('Leave', leaveSchema);
const Payroll = mongoose.model('Payroll', payrollSchema);

export { Employee, Warning, Leave, Payroll };