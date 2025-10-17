const express = require("express");
const router = express.Router();
const { auth, isBank } = require("../middlewares/authMiddleware");
const { requestLoan, approveLoanByBank, rejectLoanByBank, recordRepayment, markDefaulted, listPendingLoans, listActiveLoans } = require("../controller/loanController");     

// POST loan request
router.post("/loan-request", requestLoan);

// Bank endpoints
router.put("/:userId/:loanIndex/approve", auth, isBank, approveLoanByBank);
router.put("/:userId/:loanIndex/reject", auth, isBank, rejectLoanByBank);
router.post("/:userId/:loanIndex/repay", auth, recordRepayment);
router.put("/:userId/:loanIndex/mark-default", auth, isBank, markDefaulted);
router.get("/bank/pending", auth,isBank, listPendingLoans);
router.get("/bank/active", auth, isBank, listActiveLoans);

module.exports = router;
