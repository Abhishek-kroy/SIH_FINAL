import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [creditScoreLoading, setCreditScoreLoading] = useState(false);
  const [creditScoreError, setCreditScoreError] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Helper functions for data validation and mapping
  const validateAvgRechargeAmount = (amount) => {
    const numAmount = Number(amount) || 0;
    // Ensure amount is between 0 and 799
    return Math.max(0, Math.min(799, numAmount));
  };

  const mapEducationLevel = (education) => {
    const validLevels = ['No Education', 'Primary', 'Secondary', 'Higher'];
    
    if (!education) return 'Secondary'; // Default
    
    const normalizedEducation = education.trim();
    
    // Direct match
    if (validLevels.includes(normalizedEducation)) {
      return normalizedEducation;
    }
    
    // Fuzzy matching for common variations
    const educationMap = {
      'none': 'No Education',
      'no education': 'No Education',
      'illiterate': 'No Education',
      'primary': 'Primary',
      'elementary': 'Primary',
      'middle school': 'Primary',
      'secondary': 'Secondary',
      'high school': 'Secondary',
      'higher secondary': 'Secondary',
      'higher': 'Higher',
      'graduate': 'Higher',
      'post graduate': 'Higher',
      'bachelor': 'Higher',
      'master': 'Higher',
      'phd': 'Higher'
    };
    
    const lowerEducation = normalizedEducation.toLowerCase();
    for (const [key, value] of Object.entries(educationMap)) {
      if (lowerEducation.includes(key)) {
        return value;
      }
    }
    
    return 'Secondary'; // Default fallback
  };

  const mapOccupation = (occupation) => {
    const validOccupations = ['Unemployed', 'Agriculture', 'Business', 'Employed', 'Self Employed', 'Student'];
    
    if (!occupation) return 'Employed'; // Default
    
    const normalizedOccupation = occupation.trim();
    
    // Direct match
    if (validOccupations.includes(normalizedOccupation)) {
      return normalizedOccupation;
    }
    
    // Fuzzy matching for common variations
    const occupationMap = {
      'unemployed': 'Unemployed',
      'jobless': 'Unemployed',
      'without job': 'Unemployed',
      'agriculture': 'Agriculture',
      'farmer': 'Agriculture',
      'farming': 'Agriculture',
      'business': 'Business',
      'entrepreneur': 'Business',
      'merchant': 'Business',
      'trader': 'Business',
      'employed': 'Employed',
      'salaried': 'Employed',
      'job': 'Employed',
      'service': 'Employed',
      'self employed': 'Self Employed',
      'freelance': 'Self Employed',
      'consultant': 'Self Employed',
      'student': 'Student',
      'college': 'Student',
      'studying': 'Student'
    };
    
    const lowerOccupation = normalizedOccupation.toLowerCase();
    for (const [key, value] of Object.entries(occupationMap)) {
      if (lowerOccupation.includes(key)) {
        return value;
      }
    }
    
    return 'Employed'; // Default fallback
  };

  // Separate function to update user credit score
  const updateUserCreditScore = async (scoreData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/users/update-credit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(scoreData)
      });

      if (!response.ok) {
        throw new Error('Failed to save credit score to database');
      }

      const result = await response.json();
      console.log('Credit score saved successfully:', result);

      // Refresh user data to get updated credit score
      await refreshUser();
    } catch (error) {
      console.error('Error updating credit score in database:', error);
      throw new Error('Failed to save credit score to database');
    }
  };

  // Function to calculate credit score from ML model (only called manually)
  const calculateCreditScore = async () => {
    if (!user) return;
    
    setCreditScoreLoading(true);
    setCreditScoreError('');

    try {
      // Prepare the payload with validated and mapped fields
      const payload = {
        region: user.region || "Urban",
        household_size: user.household_size || 4,
        num_loans: user.num_loans || 0,
        avg_loan_amount: user.avg_loan_amount || 0,
        on_time_ratio: user.on_time_ratio || 0.85,
        avg_days_late: user.avg_days_late || 0,
        max_dpd: user.max_dpd || 0,
        num_defaults: user.num_defaults || 0,
        avg_kwh_30d: user.avg_kwh_30d || 120,
        var_kwh_30d: user.var_kwh_30d || 25,
        seasonality_index: user.seasonality_index || 1.2,
        
        // Validated and constrained fields
        avg_recharge_amount: validateAvgRechargeAmount(user.avg_recharge_amount || 200),
        recharge_freq_30d: user.recharge_freq_30d || 8,
        last_recharge_days: user.last_recharge_days || 5,
        bill_on_time_ratio: user.bill_on_time_ratio || 0.9,
        avg_bill_delay: user.avg_bill_delay || 2,
        avg_bill_amount: user.avg_bill_amount || 800,
        
        // Mapped fields to valid values
        education_level: mapEducationLevel(user.education_level),
        occupation: mapOccupation(user.occupation),
        asset_score: user.asset_score || 4
      };

      console.log('Sending validated payload to ML model:', payload);

      const response = await fetch('https://sih-ml-arj1.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response from ML model: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(`ML model returned ${response.status}: ${responseText}`);
      }

      // Check for different possible response structures
      if (data.success && data.predictions) {
        // Standard response format
        const predictions = data.predictions;
        console.log('Predictions received:', predictions);
        
        // Update user with new credit score and predictions
        await updateUserCreditScore({
          creditScore: Math.round(predictions.composite_credit_score * 1000),
          riskBand: predictions.default_risk_category,
          defaultRiskProbability: predictions.default_risk_probability,
          customerSegment: predictions.customer_segment,
          predictedIncomeBand: predictions.predicted_income_band,
          recommendations: predictions.recommendations || [],
          lastScoredAt: new Date()
        });
      } else if (data.composite_credit_score !== undefined) {
        // Alternative response format - predictions might be at root level
        console.log('Alternative response format detected:', data);
        
        await updateUserCreditScore({
          creditScore: Math.round(data.composite_credit_score * 1000),
          riskBand: data.default_risk_category,
          defaultRiskProbability: data.default_risk_probability,
          customerSegment: data.customer_segment,
          predictedIncomeBand: data.predicted_income_band,
          recommendations: data.recommendations || [],
          lastScoredAt: new Date()
        });
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('Unexpected response format from ML model');
      }

    } catch (error) {
      console.error('Error calculating credit score:', error);
      setCreditScoreError(error.message || 'Failed to calculate credit score. Please try again.');
    } finally {
      setCreditScoreLoading(false);
    }
  };

  // Add this function to test the ML model independently
  const testMLModel = async () => {
    const testPayload = {
      region: "Urban",
      household_size: 4,
      num_loans: 2,
      avg_loan_amount: 25000,
      on_time_ratio: 0.85,
      avg_days_late: 3,
      max_dpd: 15,
      num_defaults: 0,
      avg_kwh_30d: 120,
      var_kwh_30d: 25,
      seasonality_index: 1.2,
      avg_recharge_amount: 200,
      recharge_freq_30d: 8,
      last_recharge_days: 5,
      bill_on_time_ratio: 0.9,
      avg_bill_delay: 2,
      avg_bill_amount: 800,
      education_level: "Secondary",
      occupation: "Employed",
      asset_score: 4
    };

    console.log('Testing ML model with payload:', testPayload);

    try {
      const response = await fetch('https://sih-ml-arj1.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      const responseText = await response.text();
      console.log('Test Response:', responseText);

      return responseText;
    } catch (error) {
      console.error('Test failed:', error);
      return null;
    }
  };

  // REMOVED: Auto-calculation on component mount
  // Now credit score is only calculated when user explicitly clicks the button

  const calculateStats = () => {
    if (!user?.loanHistory) return null;

    const approvedLoans = user.loanHistory.filter(loan => loan.status !== 'Pending');
    const pendingLoans = user.loanHistory.filter(loan => loan.status === 'Pending');
    
    const totalBorrowed = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const totalRepaid = approvedLoans.reduce((sum, loan) => sum + (loan.repaidAmount || 0), 0);
    const outstandingBalance = totalBorrowed - totalRepaid;
    const activeLoans = approvedLoans.filter(loan => loan.status === 'Pending').length;
    const completedLoans = approvedLoans.filter(loan => loan.status === 'Repaid').length;

    return {
      totalBorrowed,
      totalRepaid,
      outstandingBalance,
      activeLoans,
      completedLoans,
      pendingLoans: pendingLoans.length,
      loanHistoryCount: user.loanHistory.length,
      approvedLoansCount: approvedLoans.length
    };
  };

  const stats = calculateStats();

  const getRiskBandColor = (riskBand) => {
    if (!riskBand) return 'bg-gray-100 text-gray-800 border-gray-300';
    
    if (riskBand.includes('Low Risk')) return 'bg-green-50 text-green-800 border-green-200';
    if (riskBand.includes('Medium Risk')) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    if (riskBand.includes('Moderate Risk')) return 'bg-orange-50 text-orange-800 border-orange-200';
    if (riskBand.includes('High Risk')) return 'bg-red-50 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 550) return 'text-yellow-600';
    if (score >= 450) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (!score) return 'border-gray-300 bg-gray-50';
    if (score >= 750) return 'border-green-200 bg-green-50';
    if (score >= 650) return 'border-blue-200 bg-blue-50';
    if (score >= 550) return 'border-yellow-200 bg-yellow-50';
    if (score >= 450) return 'border-orange-200 bg-orange-50';
    return 'border-red-200 bg-red-50';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Helper to display mapped values in UI
  const getDisplayEducation = (education) => {
    return mapEducationLevel(education || 'Secondary');
  };

  const getDisplayOccupation = (occupation) => {
    return mapOccupation(occupation || 'Employed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden relative">
      {/* Background elements matching landing page */}
      <div className="fixed inset-0 bg-white"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-20 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-block mb-4 px-4 py-1 bg-blue-50 border border-blue-200">
              <span className="text-blue-700 text-sm font-medium">FINANCIAL DASHBOARD</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your complete financial overview and credit analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Left Column - User Info & Actions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* User Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 p-6 hover:border-blue-300 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                  User Information
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{user?.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{user?.email}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium text-gray-900">
                      {user?.contact || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-900">
                      {user?.age || 'Not provided'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1">
                      {user?.role === 1 ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 p-6 hover:border-green-300 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                  Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <Link
                    to="/apply-loan"
                    className="block w-full border-2 border-blue-600 text-blue-600 py-3 px-4 font-medium hover:bg-blue-600 hover:text-white transition-colors duration-200 text-center"
                  >
                    Apply for Loan
                  </Link>
                  
                  <Link
                    to="/loan-history"
                    className="block w-full border-2 border-green-600 text-green-600 py-3 px-4 font-medium hover:bg-green-600 hover:text-white transition-colors duration-200 text-center"
                  >
                    View Loan History
                  </Link>
                  
                  <Link
                    to="/risk-assessment"
                    className="block w-full border-2 border-orange-600 text-orange-600 py-3 px-4 font-medium hover:bg-orange-600 hover:text-white transition-colors duration-200 text-center"
                  >
                    Risk Assessment
                  </Link>
                  
                  {/* Recalculate Credit Score Button */}
                  <button
                    onClick={calculateCreditScore}
                    disabled={creditScoreLoading}
                    className="block w-full border-2 border-purple-600 text-purple-600 py-3 px-4 font-medium hover:bg-purple-600 hover:text-white transition-colors duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creditScoreLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </span>
                    ) : (
                      'Recalculate Credit Score'
                    )}
                  </button>
                </div>
              </motion.div>

              {/* ML Features Used */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 p-6 hover:border-purple-300 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                  Credit Factors
                </h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">{user?.region || 'Urban'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Household Size:</span>
                    <span className="font-medium">{user?.household_size || 4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-medium">{getDisplayEducation(user?.education_level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupation:</span>
                    <span className="font-medium">{getDisplayOccupation(user?.occupation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On-time Ratio:</span>
                    <span className="font-medium">{user?.on_time_ratio || 0.85}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Recharge:</span>
                    <span className="font-medium">₹{validateAvgRechargeAmount(user?.avg_recharge_amount || 200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electricity Usage:</span>
                    <span className="font-medium">{user?.avg_kwh_30d || 120} kWh</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Credit Information & Stats */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Credit Score Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-white border p-6 ${getScoreBgColor(user?.creditScore)} transition-colors duration-300`}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Credit Overview
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 border">
                      {user?.lastScoredAt ? (
                        `Last updated: ${new Date(user.lastScoredAt).toLocaleDateString()}`
                      ) : (
                        'No credit score calculated yet'
                      )}
                    </span>
                    <button
                      onClick={calculateCreditScore}
                      disabled={creditScoreLoading}
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                      title="Recalculate credit score"
                    >
                      {creditScoreLoading ? (
                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        '↻'
                      )}
                    </button>
                  </div>
                </div>

                {creditScoreError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
                    {creditScoreError}
                    <button 
                      onClick={testMLModel}
                      className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Test Connection
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Credit Score Display */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className={`w-32 h-32 border-4 flex items-center justify-center ${getScoreBgColor(user?.creditScore)}`}>
                        <div className="text-center">
                          {creditScoreLoading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          ) : (
                            <>
                              <div className={`text-3xl font-bold ${getScoreColor(user?.creditScore)}`}>
                                {user?.creditScore || '--'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Score
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 border text-xs text-gray-600">
                        300-900
                      </div>
                    </div>
                    {!user?.creditScore && (
                      <p className="text-sm text-gray-500 mt-4">
                        Click "Recalculate Credit Score" to generate your credit score
                      </p>
                    )}
                  </div>

                  {/* Risk Band & Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Risk Assessment
                      </h3>
                      {user?.riskBand ? (
                        <span className={`inline-block px-4 py-2 text-sm font-medium border ${getRiskBandColor(user.riskBand)}`}>
                          {user.riskBand}
                        </span>
                      ) : (
                        <span className="inline-block px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium border border-gray-300">
                          Not Assessed
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-1 px-2 bg-gray-50">
                        <span className="text-gray-600">Loan Eligibility:</span>
                        <span className={`font-medium ${user?.creditScore >= 550 ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.creditScore ? (
                            user.creditScore >= 550 ? 'Eligible' : 'Review Required'
                          ) : (
                            'Calculate Score First'
                          )}
                        </span>
                      </div>
                      {user?.customerSegment && (
                        <div className="flex justify-between text-sm py-1 px-2 bg-gray-50">
                          <span className="text-gray-600">Segment:</span>
                          <span className="font-medium text-gray-900">{user.customerSegment}</span>
                        </div>
                      )}
                      {typeof user?.defaultRiskProbability === 'number' && (
                        <div className="flex justify-between text-sm py-1 px-2 bg-gray-50">
                          <span className="text-gray-600">Default Probability:</span>
                          <span className="font-medium text-gray-900">{Math.round(user.defaultRiskProbability * 100)}%</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm py-1 px-2 bg-blue-50">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium text-blue-600">
                          {user?.creditScore ? (
                            user.creditScore >= 750 ? '8-10%' : 
                            user.creditScore >= 650 ? '10-12%' : 
                            user.creditScore >= 550 ? '12-15%' : '15-18%'
                          ) : (
                            'Calculate Score First'
                          )}
                        </span>
                      </div>

                      {user?.predictedIncomeBand && (
                        <div className="flex justify-between text-sm py-1 px-2 bg-green-50">
                          <span className="text-gray-600">Income Band:</span>
                          <span className="font-medium text-green-600">{user.predictedIncomeBand}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Interpretation and ML recommendations */}
                {user?.creditScore && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Score Interpretation
                    </h4>
                    <p className="text-sm text-blue-800">
                      {user.creditScore >= 750 ? 'Excellent - You qualify for the best loan terms and lowest interest rates.' :
                       user.creditScore >= 650 ? 'Good - You have access to favorable loan terms and competitive rates.' :
                       user.creditScore >= 550 ? 'Fair - Standard loan terms apply with moderate interest rates.' :
                       'Needs Improvement - Consider building your credit history for better terms.'}
                    </p>
                    {Array.isArray(user?.recommendations) && user.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-blue-900 mb-1">Recommendations</h5>
                        <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                          {user.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Statistics Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                
                {/* Loan Statistics */}
                <div className="bg-white border border-gray-200 p-6 hover:border-orange-300 transition-colors duration-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                    Loan Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50">
                      <span className="text-gray-600">Total Approved Loans</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {stats?.approvedLoansCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-yellow-50">
                      <span className="text-gray-600">Pending Requests</span>
                      <span className="font-bold text-yellow-600 text-lg">
                        {stats?.pendingLoans || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50">
                      <span className="text-gray-600">Completed Loans</span>
                      <span className="font-bold text-green-600 text-lg">
                        {stats?.completedLoans || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-purple-50">
                      <span className="text-gray-600">Total Loan History</span>
                      <span className="font-bold text-purple-600 text-lg">
                        {stats?.loanHistoryCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="bg-white border border-gray-200 p-6 hover:border-green-300 transition-colors duration-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                    Financial Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50">
                      <span className="text-gray-600">Total Borrowed</span>
                      <span className="font-bold text-gray-900 text-lg">
                        {formatCurrency(stats?.totalBorrowed)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50">
                      <span className="text-gray-600">Total Repaid</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(stats?.totalRepaid)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-50">
                      <span className="text-gray-600">Outstanding Balance</span>
                      <span className="font-bold text-red-600 text-lg">
                        {formatCurrency(stats?.outstandingBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50">
                      <span className="text-gray-600">Active Loans</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {stats?.activeLoans || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 p-6 hover:border-yellow-300 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats?.pendingLoans > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200">
                      <div className="w-2 h-2 bg-yellow-500"></div>
                      <span className="text-sm text-yellow-800 font-medium">
                        You have {stats.pendingLoans} loan request{stats.pendingLoans > 1 ? 's' : ''} pending approval
                      </span>
                    </div>
                  )}

                  {stats?.activeLoans > 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500"></div>
                      <span className="text-sm text-blue-800 font-medium">
                        You have {stats.activeLoans} active loan{stats.activeLoans > 1 ? 's' : ''} in progress
                      </span>
                    </div>
                  ) : stats?.approvedLoansCount === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200">
                      <div className="w-2 h-2 bg-green-500"></div>
                      <span className="text-sm text-green-800 font-medium">
                        No active loans. Ready to apply for your first loan?
                      </span>
                    </div>
                  )}
                  
                  {!user?.creditScore && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500"></div>
                      <span className="text-sm text-orange-800 font-medium">
                        Credit score not calculated yet. Click "Recalculate Credit Score" to generate it.
                      </span>
                    </div>
                  )}

                  {stats?.outstandingBalance > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200">
                      <div className="w-2 h-2 bg-red-500"></div>
                      <span className="text-sm text-red-800 font-medium">
                        Outstanding balance: {formatCurrency(stats.outstandingBalance)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}