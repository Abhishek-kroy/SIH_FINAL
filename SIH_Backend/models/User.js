const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
});

const RepaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  verificationStatus: {
    type: String,
    enum: ["PENDING", "verified", "Reject"],
    default: "PENDING",
  },
  paymentProof: { type: String }, // Cloudinary URL
});

const LoanHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  repaidAmount: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  installmentAmount: { type: Number, default: 0 },
  totalInstallments: { type: Number, default: 0 },
  installmentsPaid: { type: Number, default: 0 },
  nextDueDate: { type: Date },
  lastPaymentAt: { type: Date },
  payments: { type: [PaymentSchema], default: [] },
  repayments: { type: [RepaymentSchema], default: [] },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decisionAt: { type: Date },
  approved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Repaid", "Defaulted"], default: "Pending" },
  
  borrowedAt: { type: Date, default: Date.now },
  purpose: { type: String },
  // ML scoring snapshot at request time
  creditScore: { type: Number },
  riskBand: { type: String },
  defaultRiskProbability: { type: Number },
  customerSegment: { type: String },
  predictedIncomeBand: { type: String },
  recommendations: { type: [String], default: [] },
});

const UserSchema = new mongoose.Schema({
  // Personal info
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  contact: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  region: { type: String },                   // New field
  household_size: { type: Number },           // New field
  education_level: { type: String },          // New field
  occupation: { type: String },               // New field
  income_band: { type: String },              // New field

  // Role: blockchain roles
  //0 -> beeficiary, 1-> admin
  role: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
  blockchainAddress: { type: String, required: false },

  // Banking details
  accountNumber: { type: String, required: true, unique: true },
  ifscCode: { type: String, required: true },
  accountHolderName: { type: String, required: true },

  // Loan-related info
  totalLoanAmount: { type: Number, default: 0 },
  num_loans: { type: Number, default: 0 },       // New field
  avg_loan_amount: { type: Number, default: 0 }, // New field
  on_time_ratio: { type: Number, default: 0 },   // New field
  avg_days_late: { type: Number, default: 0 },   // New field
  max_dpd: { type: Number, default: 0 },         // New field
  num_defaults: { type: Number, default: 0 },    // New field
  default_flag: { type: Boolean, default: false }, // New field
  loanHistory: [LoanHistorySchema],

  // Consumption metrics
  avg_kwh_30d: { type: Number, default: 0 },    // New field
  var_kwh_30d: { type: Number, default: 0 },    // New field
  seasonality_index: { type: Number, default: 0 }, // New field

  // Recharge / prepaid metrics
  avg_recharge_amount: { type: Number, default: 0 }, // New field
  recharge_freq_30d: { type: Number, default: 0 },   // New field
  last_recharge_days: { type: Number, default: 0 },  // New field

  // Bill payment behavior
  bill_on_time_ratio: { type: Number, default: 0 }, // New field
  avg_bill_delay: { type: Number, default: 0 },     // New field
  avg_bill_amount: { type: Number, default: 0 },    // New field

  // Asset & ML metrics
  asset_score: { type: Number, default: 0 },       // New field
  electricityUsage: { type: Number },              // existing
  mobileRechargeAmount: { type: Number },          // existing
  utilityBills: { type: Number },                  // existing
  creditScore: { type: Number },
  riskBand: { type: String },
  defaultRiskProbability: { type: Number },
  customerSegment: { type: String },
  predictedIncomeBand: { type: String },
  recommendations: { type: [String], default: [] },
  lastScoredAt: { type: Date },
  riskAssessedAt: { type: Date },
  riskAssessmentCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now },
  resetOTP: String,
  otpExpiry: Date,
});

module.exports = mongoose.model("User", UserSchema);      