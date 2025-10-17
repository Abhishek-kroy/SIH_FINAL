const express = require("express");
const router = express.Router();
const blockchainController = require("../controller/blockchainController");
const { auth, isAdmin, isBank, isBeneficiary } = require("../middlewares/authMiddleware");

// Auth routes for blockchain roles
router.post("/roles/assign", auth, isAdmin, blockchainController.assignRole);
router.post("/roles/remove", auth, isAdmin, blockchainController.removeRole);
router.post("/roles/set-beneficiary-address", auth, isBank, blockchainController.setBeneficiaryAddress);
router.get("/roles/get/:address", auth, blockchainController.getRole);

// Beneficiary routes
router.post("/beneficiaries/add", auth, isBank, blockchainController.addBeneficiary);
router.get("/beneficiaries/:accountNumber/:ifscCode", auth, blockchainController.getBeneficiary);
router.put("/beneficiaries/:accountNumber/:ifscCode/credit-score", auth, isBank, blockchainController.updateCreditScore);
router.post("/beneficiaries/:accountNumber/:ifscCode/loan/approve", auth, isBank, blockchainController.approveLoan);
router.post("/beneficiaries/:accountNumber/:ifscCode/repayment", auth, isBeneficiary, blockchainController.recordRepayment);

// Loan routes
router.post("/beneficiaries/:accountNumber/:ifscCode/loan/revoke", auth, isBank, blockchainController.revokeLoan);
router.put("/beneficiaries/:accountNumber/:ifscCode/risk-band", auth, isBank, blockchainController.updateRiskBand);
router.get("/beneficiaries/:accountNumber/:ifscCode/outstanding-loan", auth, blockchainController.getOutstandingLoan);

// Transaction routes
router.get("/transactions", auth, blockchainController.getTransactionCount);
router.get("/transactions/:index", auth, blockchainController.getTransaction);

// Dashboard routes
router.get("/dashboard/beneficiaries", auth, isAdmin, async (req, res) => {
  // Placeholder for list of beneficiaries, perhaps from DB or blockchain
  // For now, return empty
  res.json({ success: true, beneficiaries: [] });
});
router.get("/dashboard/stats", auth, async (req, res) => {
  // Placeholder for system stats
  res.json({ success: true, stats: { totalBeneficiaries: 0, totalLoans: 0 } });
});

// Health check
router.get("/health", blockchainController.healthCheck);

// New route to get all transactions for a beneficiary
router.get("/beneficiaries/:accountNumber/:ifscCode/transactions", auth, blockchainController.getTransactionsForBeneficiary);

module.exports = router;
