const User = require("../models/User");
const { getContract } = require("../utils/blockchain");
const { callMlPredict, buildPayloadFromUser } = require("../utils/mlClient");

// POST /api/loan-request
exports.requestLoan = async (req, res) => {
  try {
    // Inputs the user can provide
    const {
      userId,
      amount,
      tenure,
      purpose,             // optional
      avg_recharge_amount,
      avg_kwh_30d,
      var_kwh_30d,
      last_recharge_days
    } = req.body;

    // Validate required minimal fields; feature fields can be taken from user state
    if (!userId || !amount || !tenure) {
      return res.status(400).json({ success: false, message: "userId, amount and tenure are required." });
    }

    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // CHECK RISK ASSESSMENT FLAG INSTEAD OF DATE
    if (!user.riskAssessmentCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: "Please complete risk assessment before applying for a loan." 
      });
    }

    // Merge demographic fields if provided, else keep existing
    const next_household_size = (req.body.household_size !== undefined && req.body.household_size !== null)
      ? Number(req.body.household_size) : Number(user.household_size || 0);
    const next_education_level = req.body.education_level ?? user.education_level;
    const next_occupation = req.body.occupation ?? user.occupation;
    const next_income_band = req.body.income_band ?? user.income_band;
    const next_region = req.body.region ?? user.region;

    user.household_size = next_household_size;
    user.education_level = next_education_level;
    user.occupation = next_occupation;
    user.income_band = next_income_band;
    user.region = next_region;

    // Determine feature values from body or fall back to user's existing state
    const next_avg_recharge_amount = (avg_recharge_amount !== undefined && avg_recharge_amount !== null)
      ? Number(avg_recharge_amount) : Number(user.avg_recharge_amount || 0);
    const next_avg_kwh_30d = (avg_kwh_30d !== undefined && avg_kwh_30d !== null)
      ? Number(avg_kwh_30d) : Number(user.avg_kwh_30d || 0);
    const next_var_kwh_30d = (var_kwh_30d !== undefined && var_kwh_30d !== null)
      ? Number(var_kwh_30d) : Number(user.var_kwh_30d || 0);
    const next_last_recharge_days = (last_recharge_days !== undefined && last_recharge_days !== null)
      ? Number(last_recharge_days) : Number(user.last_recharge_days || 0);

    // Update user's ML input fields with resolved values
    user.avg_recharge_amount = next_avg_recharge_amount;
    user.avg_kwh_30d = next_avg_kwh_30d;
    user.var_kwh_30d = next_var_kwh_30d;
    user.last_recharge_days = next_last_recharge_days;

    // Create new loan entry
    const newLoan = {
      amount,
      tenureMonths: tenure,
      repaidAmount: 0,
      outstandingAmount: Number(amount),
      status: "Pending",
      borrowedAt: new Date(),
      purpose,
    };

    // Add to user's loanHistory
    user.loanHistory.push(newLoan);
    user.totalLoanAmount += Number(amount);
    user.num_loans = user.loanHistory.length;

    // Recalculate avg_loan_amount
    const totalAmount = user.loanHistory.reduce((sum, loan) => sum + loan.amount, 0);
    user.avg_loan_amount = totalAmount / user.num_loans;

    // RESET RISK ASSESSMENT FLAG TO FALSE AFTER SUCCESSFUL LOAN APPLICATION
    user.riskAssessmentCompleted = false;

    // Call ML service to compute latest score snapshot
    let mlSnapshot = null;
    try {
      const payload = buildPayloadFromUser(user);
      const mlResponse = await callMlPredict(payload);
      if (mlResponse && mlResponse.success && mlResponse.predictions) {
        const p = mlResponse.predictions;
        mlSnapshot = {
          creditScore: Number((p.composite_credit_score || 0) * 1000),
          riskBand: p.default_risk_category || null,
          defaultRiskProbability: p.default_risk_probability,
          customerSegment: p.customer_segment,
          predictedIncomeBand: p.predicted_income_band,
          recommendations: Array.isArray(p.recommendations) ? p.recommendations : [],
        };
        // Persist snapshot at user level as well
        user.creditScore = mlSnapshot.creditScore;
        user.riskBand = mlSnapshot.riskBand;
        user.defaultRiskProbability = mlSnapshot.defaultRiskProbability;
        user.customerSegment = mlSnapshot.customerSegment;
        user.predictedIncomeBand = mlSnapshot.predictedIncomeBand;
        user.recommendations = mlSnapshot.recommendations;
        user.lastScoredAt = new Date();
      }
    } catch (e) {
      console.error("ML scoring failed:", e.message);
    }

    // Attach ML snapshot to the latest loan
    if (mlSnapshot) {
      const idx = user.loanHistory.length - 1;
      user.loanHistory[idx].creditScore = mlSnapshot.creditScore;
      user.loanHistory[idx].riskBand = mlSnapshot.riskBand;
      user.loanHistory[idx].defaultRiskProbability = mlSnapshot.defaultRiskProbability;
      user.loanHistory[idx].customerSegment = mlSnapshot.customerSegment;
      user.loanHistory[idx].predictedIncomeBand = mlSnapshot.predictedIncomeBand;
      user.loanHistory[idx].recommendations = mlSnapshot.recommendations;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Loan request submitted successfully.",
      loan: newLoan,
      score: user.creditScore,
      riskBand: user.riskBand,
      recommendations: user.recommendations,
      totalLoanAmount: user.totalLoanAmount,
      riskAssessmentCompleted: false // Inform frontend that flag is now reset
    });
  } catch (err) {
    console.error("Loan request error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


// PUT /api/loan/:userId/:loanIndex/approve
exports.approveLoanByBank = async (req, res) => {
  try {
    const { userId, loanIndex } = req.params;
    const { installmentFrequency = "monthly" } = req.body; // future use

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const loan = user.loanHistory[Number(loanIndex)];
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found." });
    if (loan.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending loans can be approved." });

    // compute EMI simple interest-free installment: amount / tenureMonths
    const totalInstallments = loan.tenureMonths;
    const installmentAmount = Math.ceil(loan.amount / totalInstallments);

    loan.installmentAmount = installmentAmount;
    loan.totalInstallments = totalInstallments;
    loan.installmentsPaid = 0;
    loan.outstandingAmount = loan.amount;
    loan.approved = true;
    loan.rejected = false;
    loan.status = "Approved";
    loan.decisionBy = req.user.id;
    loan.decisionAt = new Date();
    // set next due date one month from now
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    loan.nextDueDate = next;

    // Update aggregates
    user.totalLoanAmount = (user.totalLoanAmount || 0) + loan.amount;

    await user.save();

    // Write to blockchain
    try {
      const creditScoring = getContract("CreditScoring");
      const tx = await creditScoring.approveLoan(user.accountNumber, user.ifscCode, loan.amount);
      await tx.wait();
    } catch (bcErr) {
      console.error("Blockchain approveLoan failed:", bcErr);
      // Non-fatal: keep DB approval but report warning
    }

    return res.json({ success: true, message: "Loan approved", loan });
  } catch (err) {
    console.error("Approve loan error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/loan/:userId/:loanIndex/reject
exports.rejectLoanByBank = async (req, res) => {
  try {
    const { userId, loanIndex } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const loan = user.loanHistory[Number(loanIndex)];
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found." });
    if (loan.status !== "Pending") return res.status(400).json({ success: false, message: "Only pending loans can be rejected." });

    loan.approved = false;
    loan.rejected = true;
    loan.status = "Rejected";
    loan.decisionBy = req.user.id;
    loan.decisionAt = new Date();

    await user.save();
    return res.json({ success: true, message: "Loan rejected", loan });
  } catch (err) {
    console.error("Reject loan error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/loan/:userId/:loanIndex/repay
exports.recordRepayment = async (req, res) => {
  try {
    const { userId, loanIndex } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Valid amount required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const loan = user.loanHistory[Number(loanIndex)];
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found." });
    if (!loan.approved || loan.status === "Repaid") return res.status(400).json({ success: false, message: "Loan not active." });

    // update amounts
    loan.repaidAmount += Number(amount);
    loan.outstandingAmount = Math.max(0, loan.amount - loan.repaidAmount);
    loan.lastPaymentAt = new Date();
    loan.payments.push({ amount: Number(amount), paidAt: loan.lastPaymentAt });

    // update installment counters when threshold crossed
    while (loan.installmentsPaid < loan.totalInstallments && (loan.repaidAmount >= (loan.installmentsPaid + 1) * loan.installmentAmount)) {
      loan.installmentsPaid += 1;
      // move next due one month ahead each paid installment
      const next = loan.nextDueDate ? new Date(loan.nextDueDate) : new Date();
      next.setMonth(next.getMonth() + 1);
      loan.nextDueDate = next;
    }

    // mark repaid if fully paid
    if (loan.outstandingAmount === 0) {
      loan.status = "Repaid";
      user.default_flag = false;
    }

    await user.save();

    // Write repayment to blockchain
    try {
      const creditScoring = getContract("CreditScoring");
      const tx = await creditScoring.recordRepayment(user.accountNumber, user.ifscCode, Number(amount));
      await tx.wait();
    } catch (bcErr) {
      console.error("Blockchain recordRepayment failed:", bcErr);
    }

    return res.json({ success: true, message: "Repayment recorded", loan });
  } catch (err) {
    console.error("Record repayment error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/loan/:userId/:loanIndex/mark-default
exports.markDefaulted = async (req, res) => {
  try {
    const { userId, loanIndex } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const loan = user.loanHistory[Number(loanIndex)];
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found." });
    if (loan.status === "Repaid") return res.status(400).json({ success: false, message: "Loan already repaid." });

    loan.status = "Defaulted";
    user.num_defaults = (user.num_defaults || 0) + 1;
    user.default_flag = true;
    await user.save();
    return res.json({ success: true, message: "Loan marked defaulted", loan });
  } catch (err) {
    console.error("Mark defaulted error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/loan/bank/pending
exports.listPendingLoans = async (req, res) => {
  try {
    const users = await User.find({ "loanHistory.status": "Pending" }).select("name email accountNumber ifscCode loanHistory creditScore riskBand defaultRiskProbability customerSegment");
    const items = [];
    users.forEach(u => {
      u.loanHistory.forEach((loan, idx) => {
        if (loan.status === "Pending") {
          items.push({
            userId: u._id,
            userName: u.name,
            email: u.email,
            accountNumber: u.accountNumber,
            ifscCode: u.ifscCode,
            loanIndex: idx,
            amount: loan.amount,
            tenureMonths: loan.tenureMonths,
            requestedAt: loan.borrowedAt,
            purpose: loan.purpose,
            creditScore: loan.creditScore ?? u.creditScore,
            riskBand: loan.riskBand ?? u.riskBand,
            defaultRiskProbability: loan.defaultRiskProbability ?? u.defaultRiskProbability,
            customerSegment: loan.customerSegment ?? u.customerSegment,
            recommendations: loan.recommendations && loan.recommendations.length ? loan.recommendations : u.recommendations || []
          });
        }
      });
    });
    return res.json({ success: true, count: items.length, loans: items });
  } catch (err) {
    console.error("List pending loans error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/loan/bank/active
exports.listActiveLoans = async (req, res) => {
  try {
    const users = await User.find({ "loanHistory.status": "Approved" }).select("name accountNumber ifscCode loanHistory creditScore riskBand defaultRiskProbability customerSegment");
    const items = [];
    users.forEach(u => {
      u.loanHistory.forEach((loan, idx) => {
        if (loan.status === "Approved") {
          items.push({
            userId: u._id,
            userName: u.name,
            accountNumber: u.accountNumber,
            ifscCode: u.ifscCode,
            loanIndex: idx,
            amount: loan.amount,
            outstandingAmount: loan.outstandingAmount,
            installmentAmount: loan.installmentAmount,
            nextDueDate: loan.nextDueDate,
            installmentsPaid: loan.installmentsPaid,
            totalInstallments: loan.totalInstallments,
            creditScore: loan.creditScore ?? u.creditScore,
            riskBand: loan.riskBand ?? u.riskBand,
            defaultRiskProbability: loan.defaultRiskProbability ?? u.defaultRiskProbability,
            customerSegment: loan.customerSegment ?? u.customerSegment
          });
        }
      });
    });
    return res.json({ success: true, count: items.length, loans: items });
  } catch (err) {
    console.error("List active loans error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
