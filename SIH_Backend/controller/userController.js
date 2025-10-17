const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});
// const Loan = require("../models/Loan");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      contact,
      email,
      region,
      household_size,
      education_level,
      occupation,
      income_band,
      accountNumber,
      ifscCode,
      accountHolderName,
      electricityUsage,
      mobileRechargeAmount,
      utilityBills,
      blockchainAddress,
    } = req.body;

    // Fields that can be updated by user
    const updateFields = {
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(contact !== undefined && { contact }),
      ...(email !== undefined && { email }),
      ...(region !== undefined && { region }),
      ...(household_size !== undefined && { household_size }),
      ...(education_level !== undefined && { education_level }),
      ...(occupation !== undefined && { occupation }),
      ...(income_band !== undefined && { income_band }),
      ...(accountNumber !== undefined && { accountNumber }),
      ...(ifscCode !== undefined && { ifscCode }),
      ...(accountHolderName !== undefined && { accountHolderName }),
      ...(electricityUsage !== undefined && { electricityUsage }),
      ...(mobileRechargeAmount !== undefined && { mobileRechargeAmount }),
      ...(utilityBills !== undefined && { utilityBills }),
      ...(blockchainAddress !== undefined && { blockchainAddress }),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUserById = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      creditScore,
      riskBand,
      totalLoanAmount,
    } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(creditScore !== undefined && { creditScore }),
      ...(riskBand && { riskBand }),
      ...(totalLoanAmount !== undefined && { totalLoanAmount }),
      ...(creditScore !== undefined && { lastScoredAt: new Date() }),
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has any loans
    const userLoans = await Loan.find({ user: req.params.id });
    if (userLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active loans. Please reassign or delete loans first.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's loans for more detailed stats
    const userLoans = await Loan.find({ user: req.user.id });
    
    const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = userLoans.reduce((sum, loan) => sum + (loan.repaidAmount || 0), 0);
    const activeLoans = userLoans.filter(loan => 
      loan.status === 'active' || loan.status === 'pending'
    ).length;
    const completedLoans = userLoans.filter(loan => 
      loan.status === 'completed'
    ).length;

    const stats = {
      totalLoanAmount: user.totalLoanAmount || 0,
      creditScore: user.creditScore || "Not scored yet",
      riskBand: user.riskBand || "Not assessed",
      loanHistoryCount: user.loanHistory ? user.loanHistory.length : 0,
      activeLoans,
      completedLoans,
      totalBorrowed,
      totalRepaid,
      outstandingBalance: totalBorrowed - totalRepaid,
      lastScoredAt: user.lastScoredAt,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};

// @desc    Calculate credit score (AI/ML simulation)
// @route   POST /api/users/calculate-credit-score
// @access  Private
exports.calculateCreditScore = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Advanced credit scoring algorithm
    let score = 300; // Base score
    
    // Factor 1: Utility bills consistency (higher bills = more stable)
    if (user.utilityBills && user.utilityBills > 0) {
      if (user.utilityBills > 2000) score += 60;
      else if (user.utilityBills > 1000) score += 40;
      else score += 20;
    }
    
    // Factor 2: Mobile recharge amount (higher = more stable income)
    if (user.mobileRechargeAmount && user.mobileRechargeAmount > 0) {
      if (user.mobileRechargeAmount > 500) score += 40;
      else if (user.mobileRechargeAmount > 200) score += 25;
      else score += 10;
    }
    
    // Factor 3: Electricity usage (moderate usage = stable lifestyle)
    if (user.electricityUsage && user.electricityUsage > 0) {
      if (user.electricityUsage >= 100 && user.electricityUsage <= 500) score += 50;
      else if (user.electricityUsage > 500) score += 30;
      else score += 10;
    }
    
    // Factor 4: Age (older = more stable, but not too old)
    if (user.age) {
      if (user.age >= 25 && user.age <= 55) score += 30;
      else if (user.age > 55) score += 15;
      else score += 5;
    }
    
    // Factor 5: Contact information completeness
    if (user.contact) score += 20;
    
    // Factor 6: Loan history performance
    if (user.loanHistory && user.loanHistory.length > 0) {
      const totalLoans = user.loanHistory.length;
      const repaidLoans = user.loanHistory.filter(loan => loan.status === "Repaid").length;
      const defaultedLoans = user.loanHistory.filter(loan => loan.status === "Defaulted").length;
      
      const repaymentRate = repaidLoans / totalLoans;
      
      if (repaymentRate >= 0.8) score += 80;
      else if (repaymentRate >= 0.5) score += 40;
      else score += 10;
      
      // Penalize defaults heavily
      score -= defaultedLoans * 60;
    }
    
    // Factor 7: Total loan amount (moderate borrowing = good)
    if (user.totalLoanAmount && user.totalLoanAmount > 0) {
      if (user.totalLoanAmount > 50000) score += 30;
      else if (user.totalLoanAmount > 10000) score += 50;
      else score += 20;
    }
    
    // Cap score between 300-900
    score = Math.max(300, Math.min(900, Math.round(score)));
    
    // Determine risk band based on score
    let riskBand = "High Risk";
    if (score >= 750) riskBand = "Low Risk - High Priority";
    else if (score >= 650) riskBand = "Low Risk";
    else if (score >= 550) riskBand = "Medium Risk";
    else if (score >= 450) riskBand = "Moderate Risk";
    
    // Update user with new score
    user.creditScore = score;
    user.riskBand = riskBand;
    user.lastScoredAt = new Date();
    
    await user.save();
    
    // Prepare detailed breakdown for the response
    const scoringFactors = {
      baseScore: 300,
      utilityBills: user.utilityBills || 0,
      mobileRecharge: user.mobileRechargeAmount || 0,
      electricityUsage: user.electricityUsage || 0,
      age: user.age || 'Not provided',
      contactProvided: !!user.contact,
      loanHistoryCount: user.loanHistory ? user.loanHistory.length : 0,
      totalLoanAmount: user.totalLoanAmount || 0,
    };
    
    res.json({
      success: true,
      message: "Credit score calculated successfully",
      creditScore: score,
      riskBand: riskBand,
      factors: scoringFactors,
      interpretation: getScoreInterpretation(score),
      recommendations: getRecommendations(score, riskBand),
    });
  } catch (error) {
    console.error("Calculate credit score error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating credit score",
    });
  }
};

// @desc    Get user's loan history
// @route   GET /api/users/loan-history
// @access  Private
exports.getUserLoanHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loanHistory');

    res.json({
      success: true,
      count: user.loanHistory.length,
      loans: user.loanHistory,
    });
  } catch (error) {
    console.error("Get loan history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching loan history",
    });
  }
};

// Helper function to interpret credit score
function getScoreInterpretation(score) {
  if (score >= 750) return "Excellent - Highly creditworthy";
  if (score >= 650) return "Good - Favorable credit terms";
  if (score >= 550) return "Fair - Standard credit terms";
  if (score >= 450) return "Below Average - Higher interest rates may apply";
  return "Poor - Credit improvement needed";
}

// Helper function to provide recommendations
function getRecommendations(score, riskBand) {
  const recommendations = [];
  
  if (score < 500) {
    recommendations.push(
      "Consider starting with smaller loan amounts",
      "Improve utility bill payment consistency",
      "Maintain stable mobile recharge patterns",
      "Build positive loan repayment history"
    );
  } else if (score < 650) {
    recommendations.push(
      "Continue maintaining current financial habits",
      "Consider diversifying your credit profile",
      "Keep utility payments consistent"
    );
  } else {
    recommendations.push(
      "Excellent credit profile maintained",
      "Eligible for preferential loan terms",
      "Consider strategic borrowing for growth"
    );
  }
  
  return recommendations;
}

// @desc    Upload user documents (placeholder for future implementation)
// @route   POST /api/users/upload-documents
// @access  Private
exports.uploadDocuments = async (req, res) => {
  try {
    // This is a placeholder for document upload functionality
    // In a real implementation, you would handle file uploads here

    res.json({
      success: true,
      message: "Document upload endpoint ready for implementation",
      note: "Integrate with cloud storage service like AWS S3 or Cloudinary",
    });
  } catch (error) {
    console.error("Upload documents error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing documents",
    });
  }
};

// @desc    Submit manual repayment with payment proof
// @route   POST /api/users/loans/:loanId/proof
// @access  Private
exports.submitManualRepayment = [
  upload.single('paymentProof'),
  async (req, res) => {
    try {
      const { loanId } = req.params;
      const { amount, verificationStatus, submittedAt } = req.body;
      console.log(req.user, "req.user");
      const userId = req.user.id;
      

      // Find the user and the specific loan
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const loan = user.loanHistory.id(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Upload file to Cloudinary
      let paymentProofUrl = '';
      if (req.file) {
        const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64String, {
          folder: 'loan_payment_proofs',
          resource_type: 'auto',
        });
        paymentProofUrl = result.secure_url;
      }

      // Create repayment record
      const repayment = {
        amount: parseFloat(amount) || 0,
        submittedAt: submittedAt || new Date(),
        verificationStatus: verificationStatus || 'PENDING',
        paymentProof: paymentProofUrl,
      };

      // Add repayment to loan
      loan.repayments.push(repayment);

      // Update loan repaidAmount
      loan.repaidAmount = (loan.repaidAmount || 0) + repayment.amount;

      // Update loan status if fully repaid
      if (loan.repaidAmount >= loan.amount) {
        loan.status = "Repaid";
      }

      await user.save();

      res.json({
        success: true,
        message: "Payment proof submitted successfully. It will be reviewed within 24 hours.",
        repayment: repayment,
      });
    } catch (error) {
      console.error("Submit manual repayment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while submitting payment proof",
      });
    }
  }
];

// @desc    Verify payment proof using Gemini AI
// @route   POST /api/users/verify-proof
// @access  Private

exports.verifyProof = async (req, res) => {
  try {
    const { base64, mimeType, loanDetails, expectedAmount } = req.body;

    console.log("Verify proof request received:", {
      hasBase64: !!base64,
      mimeType,
      hasLoanDetails: !!loanDetails,
      expectedAmount,
      base64Length: base64?.length,
    });

    if (!base64 || !mimeType || !loanDetails || !expectedAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: base64, mimeType, loanDetails, expectedAmount",
      });
    }

    console.log("Calling Gemini API...");

    const contents = [
      {
        inlineData: { mimeType, data: base64 },
      },
      {
        text: `You are an expert document verification AI. Analyze this payment proof document meticulously to determine if it is a legitimate payment receipt or transaction proof for the loan repayment described below.

**Loan Details:**
${loanDetails}

**Expected Payment Amount:** ₹${expectedAmount}

**Detailed Verification Criteria:**

1. **Document Type Recognition:**
   - Bank transaction receipt/slip
   - Online banking confirmation
   - UPI payment screenshot
   - Mobile banking app screenshot
   - ATM transaction receipt
   - Cheque deposit confirmation

2. **Key Elements to Verify:**
   - **Transaction ID/Reference Number:** Must be present and valid format
   - **Amount:** Must match or be very close to ₹${expectedAmount} (allow ±5% tolerance for fees)
   - **Date:** Must be recent (within last 30 days) and not in the future
   - **Payee/Payer Details:** Should relate to the loan or borrower
   - **Bank/Account Details:** Should be legitimate bank information
   - **Payment Status:** Must show "successful", "completed", or "credited"
   - **UTR/Transaction Reference:** Should be present for digital payments

3. **Authenticity Checks:**
   - Document should look professional and not tampered
   - No suspicious alterations or edits
   - Consistent formatting and quality
   - Legitimate bank logos/watermarks if applicable
   - No conflicting information

4. **Rejection Criteria:**
   - Amount doesn't match expected payment
   - Date is too old (>30 days) or future
   - Document appears forged or edited
   - Missing crucial transaction details
   - Unclear or illegible information
   - Not a payment-related document
   - Shows failed/cancelled transaction

**Response Format:**
Respond with exactly one word: "verified" if the document meets all criteria and appears legitimate, or "Reject" if it fails verification or is suspicious. Do not provide any explanation or additional text.`,
      },
    ];

    // Use the correct model (gemini-2.0 or gemini-2.5 if available)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or "gemini-2.5-flash" if your key supports it
      contents,
    });

    console.log("Gemini API response received");

    // The SDK automatically parses JSON/text
    const resultText = response.text.toLowerCase();

    console.log("Gemini raw result:", resultText);

    const verificationStatus = resultText.includes("verified")
      ? "verified"
      : "Reject";
      console.log("Determined verification status:", verificationStatus);
    res.json({
      success: true,
      verificationStatus,
      message:
        verificationStatus === "verified"
          ? "Payment proof verified successfully"
          : "Payment proof rejected",
    });
  } catch (error) {
    console.error("Verify proof error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying payment proof",
      error: error.message,
    });
  }
};

// @desc    Verify user profile using Gemini AI and predict features
// @route   POST /api/users/verify-profile
// @access  Private
exports.verifyProfile = async (req, res) => {
  try {
    const { base64, mimeType, userData } = req.body;

    if (!base64 || !mimeType || !userData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: base64, mimeType, userData",
      });
    }

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
      });
    }

    console.log('Calling Gemini API for profile verification...');

    const prompt = `Extract and verify user profile details from this image. The image may contain ID cards, documents, or forms with personal information.

Current user data for reference:
- Name: ${userData.name || 'Not provided'}
- Age: ${userData.age || 'Not provided'}
- Gender: ${userData.gender || 'Not provided'}
- Contact: ${userData.contact || 'Not provided'}
- Email: ${userData.email || 'Not provided'}
- Region: ${userData.region || 'Not provided'}
- Household Size: ${userData.household_size || 'Not provided'}
- Education Level: ${userData.education_level || 'Not provided'}
- Occupation: ${userData.occupation || 'Not provided'}
- Income Band: ${userData.income_band || 'Not provided'}
- Account Number: ${userData.accountNumber || 'Not provided'}
- IFSC Code: ${userData.ifscCode || 'Not provided'}
- Account Holder Name: ${userData.accountHolderName || 'Not provided'}

Please extract the following information from the image:
1. Name
2. Age
3. Gender
4. Contact/Phone
5. Email
6. Region/Address
7. Household Size
8. Education Level
9. Occupation
10. Income Band
11. Account Number
12. IFSC Code
13. Account Holder Name

Compare extracted data with current user data. If they match or the image provides more accurate/complete information, update accordingly.
Return the verified and extracted data in JSON format with the following structure:
{
  "verifiedData": {
    "name": "extracted or verified name",
    "age": extracted age as number,
    "gender": "Male/Female/Other",
    "contact": "phone number",
    "email": "email address",
    "region": "region/address",
    "household_size": household size as number,
    "education_level": "education level",
    "occupation": "occupation",
    "income_band": "income band",
    "accountNumber": "account number",
    "ifscCode": "IFSC code",
    "accountHolderName": "account holder name"
  },
  "confidence": "High/Medium/Low",
  "notes": "Any additional notes about the verification"
}

If no relevant information is found in the image, return the current user data as verifiedData.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const geminiText = data.candidates[0]?.content?.parts[0]?.text || '';

    console.log('Gemini response:', geminiText);

    // Parse the JSON response from Gemini
    let verifiedData;
    try {
      // Extract JSON from the response
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verifiedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
      });
    }

    // Update user with verified data
    const updateFields = {};
    if (verifiedData.verifiedData) {
      Object.keys(verifiedData.verifiedData).forEach(key => {
        if (verifiedData.verifiedData[key] !== null && verifiedData.verifiedData[key] !== undefined && verifiedData.verifiedData[key] !== '') {
          updateFields[key] = verifiedData.verifiedData[key];
        }
      });
    }

    // Now, predict some features using ML server
    try {
      const mlResponse = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: [
            updateFields.age || userData.age || 0,
            updateFields.household_size || userData.household_size || 0,
            updateFields.electricityUsage || userData.electricityUsage || 0,
            updateFields.mobileRechargeAmount || userData.mobileRechargeAmount || 0,
            updateFields.utilityBills || userData.utilityBills || 0,
            userData.totalLoanAmount || 0,
            userData.num_loans || 0,
            userData.on_time_ratio || 0,
            userData.avg_days_late || 0,
            userData.max_dpd || 0,
            userData.num_defaults || 0,
            userData.avg_kwh_30d || 0,
            userData.var_kwh_30d || 0,
            userData.seasonality_index || 0,
            userData.avg_recharge_amount || 0,
            userData.recharge_freq_30d || 0,
            userData.last_recharge_days || 0,
            userData.bill_on_time_ratio || 0,
            userData.avg_bill_delay || 0,
            userData.avg_bill_amount || 0,
            userData.asset_score || 0
          ]
        })
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        const prediction = mlData.prediction[0];

        // Based on prediction, update some fields
        if (prediction > 0.5) {
          updateFields.default_flag = true;
          updateFields.num_defaults = (userData.num_defaults || 0) + 1;
        } else {
          updateFields.default_flag = false;
        }

        // Predict credit score based on prediction
        const predictedScore = Math.round(300 + (700 * (1 - prediction)));
        updateFields.creditScore = Math.max(300, Math.min(900, predictedScore));
        updateFields.lastScoredAt = new Date();

        // Determine risk band
        if (predictedScore >= 750) updateFields.riskBand = "Low Risk - High Priority";
        else if (predictedScore >= 650) updateFields.riskBand = "Low Risk";
        else if (predictedScore >= 550) updateFields.riskBand = "Medium Risk";
        else if (predictedScore >= 450) updateFields.riskBand = "Moderate Risk";
        else updateFields.riskBand = "High Risk";
      }
    } catch (mlError) {
      console.error('ML prediction error:', mlError);
      // Continue without ML prediction
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile verified and updated successfully",
      user,
      verifiedData: verifiedData.verifiedData,
      confidence: verifiedData.confidence,
      notes: verifiedData.notes
    });
  } catch (error) {
    console.error("Verify profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying profile",
      error: error.message,
    });
  }
};

// @desc    Analyze uploaded bills to derive risk features and update user
// @route   POST /api/users/risk-assessment
// @access  Private
exports.riskAssessment = [
  upload.fields([
    { name: 'phoneBill', maxCount: 10 },
    { name: 'electricityBill', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      // Ensure API key
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, message: 'Gemini API key not configured' });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const phoneFiles = req.files?.phoneBill || [];
      const elecFiles = req.files?.electricityBill || [];
      if (phoneFiles.length === 0 && elecFiles.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload at least one document' });
      }

      const parts = [];
      const sysPrompt = `Extract numeric features from the uploaded bills. Consider ONLY transactions/entries within the last 6 months from today; if older entries exist, ignore them. It is acceptable if not all months are present (use up to last 6 months). Output strict JSON only with this schema:
{
  "on_time_ratio": number (0..1),
  "avg_days_late": number,
  "max_dpd": number,
  "num_defaults": number,
  "avg_recharge_amount": number,
  "recharge_freq_30d": number,
  "last_recharge_days": number,
  "bill_on_time_ratio": number (0..1),
  "avg_bill_delay": number,
  "avg_bill_amount": number,
  "electricityUsage": number,
  "mobileRechargeAmount": number
}
Guidelines:
- Use data present in the bills; if not visible, infer conservatively or return 0.
- For on-time ratios, compute paid-on-time count / total.
- avg_days_late is mean delay where applicable.
- max_dpd is max days past due observed.
- last_recharge_days approximate from most recent date.
- Output ONLY the JSON.`;
      parts.push({ text: sysPrompt });

      function toInline(file) {
        return {
          inlineData: {
            mimeType: file.mimetype || 'application/octet-stream',
            data: file.buffer.toString('base64'),
          }
        };
      }

      phoneFiles.forEach(f => parts.push(toInline(f)));
      elecFiles.forEach(f => parts.push(toInline(f)));

      // Initialize Gemini
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Call Gemini
      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
      });

      const response = await result.response;
      const text = response.text();

      let parsed;
      try {
        // Clean the response text and parse JSON
        const cleanedText = text.replace(/```json\s*|\```/g, '').trim();
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Raw AI Response:', text);
        return res.status(502).json({ 
          success: false, 
          message: 'Failed to parse AI response', 
          raw: text,
          error: e.message 
        });
      }

      // Coalesce and number-cast
      const n = (v, d=0) => {
        if (v === null || v === undefined) return d;
        const x = Number(v);
        return Number.isFinite(x) ? x : d;
      };
      
      const u = {};
      u.on_time_ratio = n(parsed.on_time_ratio, 0);
      u.avg_days_late = n(parsed.avg_days_late, 0);
      u.max_dpd = n(parsed.max_dpd, 0);
      u.num_defaults = n(parsed.num_defaults, 0);
      u.avg_recharge_amount = n(parsed.avg_recharge_amount, 0);
      u.recharge_freq_30d = n(parsed.recharge_freq_30d, 0);
      u.last_recharge_days = n(parsed.last_recharge_days, 0);
      u.bill_on_time_ratio = n(parsed.bill_on_time_ratio, 0);
      u.avg_bill_delay = n(parsed.avg_bill_delay, 0);
      u.avg_bill_amount = n(parsed.avg_bill_amount, 0);
      u.electricityUsage = n(parsed.electricityUsage, user.electricityUsage || 200);
      u.mobileRechargeAmount = n(parsed.mobileRechargeAmount, user.mobileRechargeAmount || 0);

      // Update user document
      Object.assign(user, u);

      // Simple risk band heuristic based on extracted features
      const scoreLike = (
        (u.on_time_ratio * 40) +
        (u.bill_on_time_ratio * 30) +
        (Math.max(0, 1 - Math.min(1, u.avg_days_late / 10)) * 10) +
        (Math.max(0, 1 - Math.min(1, u.num_defaults / 3)) * 20)
      );
      
      let riskBand = 'High Risk';
      if (scoreLike >= 80) riskBand = 'Low Risk - High Priority';
      else if (scoreLike >= 65) riskBand = 'Low Risk';
      else if (scoreLike >= 55) riskBand = 'Medium Risk';
      else if (scoreLike >= 45) riskBand = 'Moderate Risk';

      // SET RISK ASSESSMENT FLAG TO TRUE
      user.riskAssessmentCompleted = true;
      user.riskBand = riskBand;
      user.lastScoredAt = new Date();
      user.riskAssessedAt = new Date();

      await user.save();

      return res.json({ 
        success: true, 
        features: u, 
        riskBand, 
        scoreLike,
        riskAssessmentCompleted: true 
      });
    } catch (error) {
      console.error('Risk assessment error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during risk assessment',
        error: error.message 
      });
    }
  }
];


// Update credit score controller
exports.updateCreditScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      creditScore,
      riskBand,
      defaultRiskProbability,
      customerSegment,
      predictedIncomeBand,
      recommendations,
      lastScoredAt
    } = req.body;

    // Validate required fields
    if (creditScore === undefined || creditScore === null) {
      return res.status(400).json({
        success: false,
        message: "Credit score is required"
      });
    }

    // Find user and update credit score fields
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          creditScore: Math.round(creditScore),
          riskBand: riskBand || null,
          defaultRiskProbability: defaultRiskProbability || 0,
          customerSegment: customerSegment || null,
          predictedIncomeBand: predictedIncomeBand || null,
          recommendations: recommendations || [],
          lastScoredAt: lastScoredAt || new Date()
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`Credit score updated for user ${user.email}: ${creditScore}`);

    return res.status(200).json({
      success: true,
      message: "Credit score updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        creditScore: user.creditScore,
        riskBand: user.riskBand,
        defaultRiskProbability: user.defaultRiskProbability,
        customerSegment: user.customerSegment,
        predictedIncomeBand: user.predictedIncomeBand,
        recommendations: user.recommendations,
        lastScoredAt: user.lastScoredAt
      }
    });

  } catch (error) {
    console.error('Update credit score error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating credit score",
      error: error.message
    });
  }
};

// Optional: Get current credit score
exports.getCreditScore = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      'creditScore riskBand defaultRiskProbability customerSegment predictedIncomeBand recommendations lastScoredAt name email'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      creditInfo: {
        creditScore: user.creditScore,
        riskBand: user.riskBand,
        defaultRiskProbability: user.defaultRiskProbability,
        customerSegment: user.customerSegment,
        predictedIncomeBand: user.predictedIncomeBand,
        recommendations: user.recommendations,
        lastScoredAt: user.lastScoredAt,
        userName: user.name,
        userEmail: user.email
      }
    });

  } catch (error) {
    console.error('Get credit score error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching credit score",
      error: error.message
    });
  }
};


exports.editprofile = async (req, res) => {
  try {
    const {
      age,
      household_size,
      contact,
      region
    } = req.body;

    // Only allow specific fields to be updated
    const updateFields = {
      ...(age !== undefined && { age }),
      ...(household_size !== undefined && { household_size }),
      ...(contact && { contact }),
      ...(region && { region })
    };

    // Check if there are any valid fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update. Only age, household_size, contact, and region can be updated.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};