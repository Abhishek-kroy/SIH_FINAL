import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../Context/UserContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoanRequestForm() {
  const { user, isAuthenticated, refreshUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    tenure: "",
    purpose: "",
    avg_recharge_amount: "",
    avg_kwh_30d: "",
    var_kwh_30d: "",
    last_recharge_days: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingRiskAssessment, setCheckingRiskAssessment] = useState(true);
  const [showRiskAssessmentMessage, setShowRiskAssessmentMessage] = useState(false);

  // Check risk assessment status on component mount
  useEffect(() => {
    const checkRiskAssessment = async () => {
      if (!isAuthenticated || !user) {
        setCheckingRiskAssessment(false);
        return;
      }

      // Show risk assessment message if not completed
      if (!user.riskAssessmentCompleted) {
        setShowRiskAssessmentMessage(true);
      }

      setCheckingRiskAssessment(false);
    };

    checkRiskAssessment();
  }, [user, isAuthenticated]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    // Double-check risk assessment before submitting
    if (!user?.riskAssessmentCompleted) {
      setError("Please complete risk assessment before applying for a loan.");
      setIsSubmitting(false);
      setShowRiskAssessmentMessage(true);
      return;
    }

    // Required fields validation
    const requiredFields = [
      "amount","tenure","purpose","avg_recharge_amount",
      "avg_kwh_30d","var_kwh_30d","last_recharge_days"
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError("All fields are required.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!isAuthenticated || !user) {
      setError("You must be logged in to submit a loan request.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/loan/loan-request`,
        {
          userId: user._id,
          ...formData,
        },
        { withCredentials: true }
      );

      setMessage(res.data.message || "Loan request submitted successfully!");
      // Refresh the current user so updated creditScore appears in dashboard/context
      await refreshUser();
      setFormData({
        amount: "",
        tenure: "",
        purpose: "",
        avg_recharge_amount: "",
        avg_kwh_30d: "",
        var_kwh_30d: "",
        last_recharge_days: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit loan request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking risk assessment
  if (checkingRiskAssessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your eligibility...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the loan application form.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show risk assessment required message
  if (showRiskAssessmentMessage) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Assessment Required</h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Before you can apply for a loan, we need to assess your financial behavior and risk profile. 
              This helps us understand your creditworthiness and provide you with the best loan options.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Phone bills from the last 6 months (images/PDFs)</li>
                <li>• Electricity bills from the last 6 months (images/PDFs)</li>
                <li>• The process takes about 2-3 minutes</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/risk-assessment')}
                className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Start Risk Assessment
              </button>
              
              <button
                onClick={() => {
                  setShowRiskAssessmentMessage(false);
                  refreshUser(); // Refresh to check if status changed
                }}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                I've Already Completed Risk Assessment
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      {/* Background elements matching landing page */}
      <div className="fixed inset-0 bg-white"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative z-20">
        {/* Header Section */}
        <section className="text-center py-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4 px-4 py-1 border border-blue-200 bg-blue-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-blue-700 text-sm font-medium tracking-wide">LOAN APPLICATION</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Apply for Credit
            </motion.h1>

            <motion.p
              className="text-lg max-w-2xl mx-auto text-gray-600 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Complete your application with accurate information for faster processing and approval.
            </motion.p>

            {/* Risk Assessment Status Badge */}
            {user?.riskAssessmentCompleted && (
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mt-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Risk Assessment Completed - You're eligible to apply
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Form Section */}
        <section className="pb-20 px-6 max-w-4xl mx-auto">
          <motion.div
            className="bg-white border border-gray-200 p-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {message && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information is collected at signup */}

              {/* Loan Details Section */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Loan Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Loan Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Loan Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="50000"
                      min="0"
                      required
                    />
                  </div>

                  {/* Loan Tenure */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Loan Tenure (months)</label>
                    <input
                      type="number"
                      name="tenure"
                      value={formData.tenure}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="12"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Purpose of Loan</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Please describe the purpose of your loan..."
                    required
                  />
                </div>
              </div>

              {/* Financial Behavior Section */}
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Financial Behavior</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Avg Phone Recharge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Average Phone Recharge (₹)</label>
                    <input
                      type="number"
                      name="avg_recharge_amount"
                      value={formData.avg_recharge_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="0"
                      placeholder="500"
                      required
                    />
                  </div>

                  {/* Last Recharge Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Days Since Last Recharge</label>
                    <input
                      type="number"
                      name="last_recharge_days"
                      value={formData.last_recharge_days}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="0"
                      placeholder="7"
                      required
                    />
                  </div>

                  {/* Avg kWh 30d */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Avg Electricity Usage (kWh/30d)</label>
                    <input
                      type="number"
                      name="avg_kwh_30d"
                      value={formData.avg_kwh_30d}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="0"
                      placeholder="120"
                      required
                    />
                  </div>

                  {/* var kWh 30d */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Electricity Usage Variance</label>
                    <input
                      type="number"
                      name="var_kwh_30d"
                      value={formData.var_kwh_30d}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      min="0"
                      placeholder="15"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-md hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Submit Loan Request"
                )}
              </motion.button>
            </form>
          </motion.div>
        </section>
      </div>
    </div>
  );
}