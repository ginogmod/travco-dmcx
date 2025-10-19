import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Employee, Warning, Leave, Payroll } from './hr.js';
import { Notice, NoticeComment } from './notice.js';

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'agent'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  notify: {
    type: Boolean,
    default: false
  }
});

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: String,
    ref: 'User'
  },
  generalData: {
    groupName: String,
    agent: String,
    nationality: String,
    reservationCode: String,
    clientName: String,
    depTax: String,
    visa: String,
    entries: String,
    tips: String
  },
  ArrDep: [{
    arr: Boolean,
    dep: Boolean,
    date: String,
    from: String,
    to: String,
    border: String,
    flight: String,
    time: String,
    pax: String,
    meetBy: String,
    driverName: String,
    notes: String
  }],
  Hotels: [{
    hotelName: String,
    checkIn: String,
    checkOut: String,
    nights: Number,
    roomType: String,
    meal: String,
    pax: String,
    sgl: String,
    dbl: String,
    trp: String,
    invoiceReceived: Boolean,
    notes: String,
    specialRates: String,
    addNotes: String,
    status: String,
    bookedBy: String,
    cancelDate: String,
    other: String,
    confNo: String,
    ref: String
  }],
  Entrance: [{
    date: String,
    day: String,
    entrance: String,
    itinerary: String,
    pax: String,
    time: String,
    notes: String,
    invRec: Boolean
  }],
  Guides: [{
    guideName: String,
    language: String,
    fromDate: String,
    toDate: String,
    notes: String,
    specialRates: String,
    status: String,
    days: String,
    overnight: String,
    invRec: Boolean
  }],
  Itineraries: [{
    date: String,
    day: String,
    itinerary: String,
    serviceType: String,
    guideName: String,
    accNights: Boolean
  }],
  pax: String,
  inclusions: String,
  exclusions: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Quotation Schema
const quotationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  group: String,
  agent: String,
  agentId: String,
  arrivalDate: String,
  departureDate: String,
  createdBy: String,
  quotations: [{
    pax: Number,
    paxRange: String,
    agent: String,
    agentId: String,
    group: String,
    arrivalDate: String,
    departureDate: String,
    createdBy: String,
    itinerary: [{
      date: String,
      day: String,
      itinerary: String,
      transportType: String,
      guideRequired: Boolean,
      guideLanguage: String,
      guideType: String,
      entrances: [String],
      jeep: Boolean,
      jeepService: String,
      mealIncluded: Boolean,
      accNights: Boolean
    }],
    options: [{
      accommodations: [{
        hotelName: String,
        city: String,
        stars: String,
        dblRate: Number,
        hbRate: Number,
        sglRate: Number,
        specialComment: String
      }],
      totalCost: Number
    }]
  }],
  options: [{
    name: String,
    description: String,
    price: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Offer Schema
const offerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  fileNo: String,
  groupName: String,
  agent: String,
  nationality: String,
  dateArr: String,
  dateDep: String,
  message: String,
  itinerary: String,
  inclusions: String,
  exclusions: String,
  createdBy: String,
  signatureKey: String,
  generalNotes: String,
  isConfirmed: {
    type: Boolean,
    default: false
  },
  validityFrom: String,
  validityTo: String,
  cancellationFees: String,
  bookingsGuarantee: String,
  bookingProcess: String,
  ratesAndTaxes: String,
  childrenPolicy: String,
  checkInOutTimes: String,
  tripleRooms: String,
  bankAccountDetails: String,
  mainImage: String,
  smallImage1: String,
  smallImage2: String,
  smallImage3: String,
  quotations: [{
    type: mongoose.Schema.Types.Mixed
  }],
  options: [{
    type: mongoose.Schema.Types.Mixed
  }],
  isSpecial: {
    type: Boolean,
    default: false
  },
  isGroupSeries: {
    type: Boolean,
    default: false
  },
  quotationId: String,
  entranceFees: [String],
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
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Quotation = mongoose.model('Quotation', quotationSchema);
const Offer = mongoose.model('Offer', offerSchema);

export { User, Message, Reservation, Quotation, Offer, Employee, Warning, Leave, Payroll, Notice, NoticeComment };