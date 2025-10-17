const express = require("express");
const { auth, isAdmin, isUser } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  getUserById,
  updateUserById,
  deleteUser,
  getDashboardStats,
  calculateCreditScore,
  getUserLoanHistory,
  uploadDocuments,
  submitManualRepayment,
  verifyProof,
  verifyProfile,
  riskAssessment,
  getCreditScore,
  updateCreditScore,
  editprofile
} = require("../controller/userController");

const router = express.Router();

// User routes
router.get("/", auth,isAdmin, getAllUsers);
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.get("/dashboard/stats", auth, getDashboardStats);
router.post("/calculate-credit-score", auth, calculateCreditScore);
router.get("/loan-history", auth, getUserLoanHistory);
router.post("/upload-documents", auth, uploadDocuments);
router.post("/loans/:loanId/proof", auth, ...submitManualRepayment);
router.post("/verify-proof", auth, verifyProof);
router.post("/verify-profile", auth, verifyProfile);
router.post("/risk-assessment", auth, riskAssessment);
router.put("/edit-profile", auth, editprofile);
// Admin-only routes
router.get("/:id", auth, isAdmin, getUserById);
router.put("/:id", auth, isAdmin, updateUserById);
router.delete("/:id", auth, isAdmin, deleteUser);
router.post('/update-credit-score', auth, updateCreditScore);
router.get('/credit-score', auth, getCreditScore);

module.exports = router;