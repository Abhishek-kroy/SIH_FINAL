const mongoose = require("mongoose");

// --- Repayment Schema ---
const RepaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  verificationStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending",
  },
  paymentProof: { type: String }, // e.g., image URL, file path, or transaction hash
});

// --- Loan Schema ---
const LoanSchema = new mongoose.Schema({
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Core loan info
  amount: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  purpose: { type: String },

  // Repayment info
  repaidAmount: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  installmentAmount: { type: Number, default: 0 },
  totalInstallments: { type: Number, default: 0 },
  installmentsPaid: { type: Number, default: 0 },
  nextDueDate: { type: Date },
  lastPaymentAt: { type: Date },
  repayments: { type: [RepaymentSchema], default: [] },

  // Loan status & decision details
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin ID
  decisionAt: { type: Date },
  approved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Repaid", "Defaulted"],
    default: "Pending",
  },
  borrowedAt: { type: Date, default: Date.now },

  // ML Scoring snapshot (at time of approval)
  creditScore: { type: Number },
  riskBand: { type: String },
  defaultRiskProbability: { type: Number },
  customerSegment: { type: String },
  predictedIncomeBand: { type: String },
  recommendations: { type: [String], default: [] },

  // Blockchain & verification metadata (if needed later)
  blockchainTxHash: { type: String },
  verifiedOnChain: { type: Boolean, default: false },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update `updatedAt` timestamp
LoanSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Loan", LoanSchema);
