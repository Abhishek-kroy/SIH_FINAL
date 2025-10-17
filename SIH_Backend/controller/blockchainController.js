const { getProvider, getContract } = require("../utils/blockchain");
const { ethers } = require("ethers");
const User = require("../models/User");

// Helper to handle errors from blockchain calls
function handleError(res, error) {
  console.error("Blockchain error:", error);
  if (error.code === "CALL_EXCEPTION") {
    return res.status(400).json({ success: false, message: "Blockchain call reverted" });
  }
  return res.status(500).json({ success: false, message: "Internal server error" });
}

// Role enums for clarity
const Roles = {
  NONE: 0,
  ADMIN: 1,
  BANK: 2,
  CHANNEL_PARTNER: 3,
  AUDITOR: 4,
  BENEFICIARY: 5,
};

// Assign role (Admin only)
exports.assignRole = async (req, res) => {
  try {
    const { accountNumber, ifscCode, role } = req.body;
    if (!accountNumber || !ifscCode || role === undefined) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode and role are required" });
    }
    const accessControl = getContract("AccessControl");
    const tx = await accessControl.assignRoleByBeneficiary(accountNumber, ifscCode, role);
    await tx.wait();
    return res.json({ success: true, message: "Role assigned successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Remove role (Admin only)
exports.removeRole = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.body;
    if (!accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "accountNumber and ifscCode are required" });
    }
    const accessControl = getContract("AccessControl");
    const tx = await accessControl.removeRoleByBeneficiary(accountNumber, ifscCode);
    await tx.wait();
    return res.json({ success: true, message: "Role removed successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Set beneficiary address (Admin or Bank only)
exports.setBeneficiaryAddress = async (req, res) => {
  try {
    const { accountNumber, ifscCode, address } = req.body;
    if (!accountNumber || !ifscCode || !address) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode and address are required" });
    }
    const accessControl = getContract("AccessControl");
    const tx = await accessControl.setBeneficiaryAddress(accountNumber, ifscCode, address);
    await tx.wait();
    return res.json({ success: true, message: "Beneficiary address set successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get role of an address
exports.getRole = async (req, res) => {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    const accessControl = getContract("AccessControl");
    const role = await accessControl.getRole(address);
    return res.json({ success: true, role: role.toString() });
  } catch (error) {
    return handleError(res, error);
  }
};

// Add beneficiary
exports.addBeneficiary = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode } = req.body;
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "accountHolderName, accountNumber, and ifscCode are required" });
    }
    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.addBeneficiary(accountHolderName, accountNumber, ifscCode);
    await tx.wait();
    return res.json({ success: true, message: "Beneficiary added successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get beneficiary data 
// const { getProvider, getContract } = require("../utils/blockchain");
// const { ethers } = require("ethers");

exports.getBeneficiary = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    if (!accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "accountNumber and ifscCode are required" });
    }

    const creditScoring = getContract("CreditScoring");
    const beneficiary = await creditScoring.getBeneficiary(accountNumber, ifscCode);

    const beneficiaryData = {
      accountHolderName: beneficiary.accountHolderName,
      accountNumber: beneficiary.accountNumber,
      ifscCode: beneficiary.ifscCode,
      creditScore: beneficiary.creditScore.toString(),
      riskBand: beneficiary.riskBand,
      loanApproved: beneficiary.loanApproved,
      totalLoanAmount: beneficiary.totalLoanAmount.toString(),
      amountRepaid: beneficiary.amountRepaid.toString(),
      consumptionDataHash: beneficiary.consumptionDataHash,
      lastUpdated: beneficiary.lastUpdated.toString(),
    };

    return res.json({ success: true, beneficiary: beneficiaryData });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update credit score
exports.updateCreditScore = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    const { score, riskBand } = req.body;
    console.log(req.body);
    console.log(accountNumber, ifscCode, score, riskBand);
    if (!accountNumber || !ifscCode || score === undefined || !riskBand) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode, score and riskBand are required" });
    }
    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.updateCreditScore(accountNumber, ifscCode, score, riskBand);
    await tx.wait();
    return res.json({ success: true, message: "Credit score updated" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Approve loan
exports.approveLoan = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    const { amount } = req.body;

    if (!accountNumber || !ifscCode || amount === undefined) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode and amount are required" });
    }

    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.approveLoan(accountNumber, ifscCode, amount);
    await tx.wait();

    return res.json({ success: true, message: "Loan approved" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Revoke loan
exports.revokeLoan = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    if (!accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "accountNumber and ifscCode are required" });
    }
    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.revokeLoan(accountNumber, ifscCode);
    await tx.wait();
    return res.json({ success: true, message: "Loan revoked" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Record repayment
exports.recordRepayment = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    const { amount } = req.body;

    if (!accountNumber || !ifscCode || amount === undefined) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode and amount are required" });
    }

    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.recordRepayment(accountNumber, ifscCode, amount);
    await tx.wait();

    return res.json({ success: true, message: "Repayment recorded" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update risk band
exports.updateRiskBand = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    const { newRiskBand } = req.body;
    if (!accountNumber || !ifscCode || !newRiskBand) {
      return res.status(400).json({ success: false, message: "accountNumber, ifscCode and newRiskBand are required" });
    }
    const creditScoring = getContract("CreditScoring");
    const tx = await creditScoring.updateRiskBand(accountNumber, ifscCode, newRiskBand);
    await tx.wait();
    return res.json({ success: true, message: "Risk band updated" });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get outstanding loan
exports.getOutstandingLoan = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    if (!accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: "accountNumber and ifscCode are required" });
    }
    const creditScoring = getContract("CreditScoring");
    const amount = await creditScoring.getOutstandingLoan(accountNumber, ifscCode);
    return res.json({ success: true, outstandingLoan: amount.toString() });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get transaction count
exports.getTransactionCount = async (req, res) => {
  try {
    const creditScoring = getContract("CreditScoring");
    const count = await creditScoring.getTransactionCount();
    return res.json({ success: true, count: count.toString() });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get transaction by index
exports.getTransaction = async (req, res) => {
  try {
    const { index } = req.params;

    const transactionHistory = getContract("TransactionHistory");

    const [amount, timestamp, beneficiaryKey, txType, details] = await transactionHistory.getTransaction(index);

    return res.json({
      success: true,
      transaction: {
        amount: amount.toString(),
        timestamp: timestamp.toString(),
        beneficiaryKey: beneficiaryKey,
        txType: txType,
        details: details
      }
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message
    });
  }
};

// Health check for contract connectivity
exports.healthCheck = async (req, res) => {
  try {
    const provider = getContract("CreditScoring").runner.provider;
    const network = await provider.getNetwork();
    return res.json({ success: true, network });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Blockchain connectivity failed" });
  }
};

// Get all transactions for a beneficiary
// controller/blockchainController.js
exports.getTransactionsForBeneficiary = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.params;
    if (!accountNumber || !ifscCode) {
      return res
        .status(400)
        .json({ success: false, message: "accountNumber and ifscCode are required" });
    }

    const transactionHistory = getContract("TransactionHistory");

    // Compute the beneficiary key
    const beneficiaryKey = ethers.keccak256(ethers.toUtf8Bytes(accountNumber + ifscCode));

    // ✅ Directly get count for this beneficiary from smart contract
    const beneficiaryCount = await transactionHistory.getTransactionCountForBeneficiary(accountNumber, ifscCode);
    console.log(`Total transactions for beneficiary ${accountNumber}:`, beneficiaryCount.toString());
    const transactions = [];

    // We still loop all transactions because getTransactionCountForBeneficiary
    // does not return indices. For optimization, you’d need a mapping in Solidity.
    for (let i = 0; i < beneficiaryCount; i++) {
      const [amount, timestamp, bKey, txType, details] =
        await transactionHistory.getTransaction(i);

      if (bKey === beneficiaryKey) {
        transactions.push({
          beneficiaryId: accountNumber, // Return accountNumber as beneficiaryId for clarity
          txType,
          amount: amount.toString(),
          timestamp: timestamp.toString(),
          details,
        });
      }
    }

    return res.json({
      success: true,
      count: beneficiaryCount.toString(),
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions for beneficiary:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch transactions" });
  }
};
