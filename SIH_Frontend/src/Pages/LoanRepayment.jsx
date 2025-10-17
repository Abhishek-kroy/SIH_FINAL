// LoanRepayment.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Clock,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/userAPI';

export default function LoanRepayment() {
  const { user, refreshUserData } = useUser();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentMethod, setRepaymentMethod] = useState('');
  const [mandateId, setMandateId] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
  const fetchLoans = async () => {
    try {
      setLoading(true);

      const response = await userAPI.getUserLoans();
      // console.log('Fetched loans:', response);

      let userLoans = response.loans || [];
      console.log('User loans:', userLoans);

      // Ensure each loan has an id
      userLoans = userLoans.map((loan, index) => ({
        ...loan,
        id: loan._id || `loan_${Date.now()}_${index}`
      }));

      const activeLoans = userLoans.filter(
        loan => loan.status === 'Active' || loan.status === 'Approved'
      );

      const completedLoans = userLoans.filter(
        loan => loan.status === 'Completed' || loan.status === 'Closed' || loan.status === 'Repaid'
      );

      setLoans({
        active: activeLoans,
        completed: completedLoans
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
      alert('Failed to load loans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchLoans();
}, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLoanStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
      case 'closed':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  

  const handleAutodebitSetup = async (loanId) => {
    if (!mandateId.trim()) {
      alert('Please enter Mandate ID');
      return;
    }

    setProcessing(true);
    try {
      // Initialize Rupay autodebit
      const rupayConfig = {
        merchantId: import.meta.env.VITE_RUPAY_MERCHANT_ID,
        loanId: loanId,
        mandateId: mandateId,
        amount: loans.active.find(loan => loan.id === loanId)?.outstandingAmount
      };

      // Call Rupay API for autodebit setup
      const response = await userAPI.setupAutodebit(loanId, {
        mandateId: mandateId,
        rupayConfig: rupayConfig
      });

      alert('Autodebit setup successful! Mandate ID: ' + response.mandateId);
      setMandateId('');
      //refreshUserData();
    } catch (error) {
      console.error('Autodebit setup error:', error);
      alert('Failed to setup autodebit: ' + (error.message || 'Please try again'));
    } finally {
      setProcessing(false);
    }
  };
  

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 20 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image or PDF file (JPEG, PNG, PDF)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size should be less than 5MB');
        return;
      }

      setProofFile(file);
      setVerificationResult(null);
    }
  };

  const verifyPaymentProof = async () => {
    if (!proofFile) return;

    setVerifying(true);
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(proofFile);
      });

      // Prepare loan details
      const expectedAmount = selectedLoan.outstandingAmount || (selectedLoan.amount - (selectedLoan.repaidAmount || 0));
      const loanDetails = `
        Loan Details:
        - Loan ID: ${selectedLoan.id}
        - Expected Payment Amount: ₹${expectedAmount}
        - Loan Amount: ₹${selectedLoan.amount}
        - Outstanding Amount: ₹${expectedAmount}
        - Due Date: ${selectedLoan.nextDueDate ? formatDate(selectedLoan.nextDueDate) : 'N/A'}
        - Borrower: ${user?.name || 'N/A'}
      `;

      // Call backend API for verification
      const response = await userAPI.verifyProof({
        base64,
        mimeType: proofFile.type,
        loanDetails,
        expectedAmount,
      });

      if (response.success && response.verificationStatus === 'VERIFIED') {
        setVerificationResult(response.verificationStatus);
        // Automatically submit repayment after successful verification
        await handleManualRepayment(selectedLoan.id, expectedAmount);
      } else {
        setVerificationResult(response.verificationStatus || 'ERROR');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult('ERROR');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualRepayment = async (loanId) => {
    if (!proofFile) {
      alert('Please upload payment proof');
      return;
    }

    if (verificationResult !== 'verified') {
      alert('Please verify the payment proof before submitting');
      return;
    }

    setProcessing(true);
    try {
      const expectedAmount = selectedLoan.outstandingAmount || (selectedLoan.amount - (selectedLoan.repaidAmount || 0));
      const formData = new FormData();
      formData.append('paymentProof', proofFile);
      formData.append('amount', expectedAmount.toString());
      formData.append('loanId', loanId);
      formData.append('verificationStatus', verificationResult);
      formData.append('submittedAt', new Date().toISOString());

      await userAPI.submitManualRepayment(formData);
      
      alert('Payment proof submitted successfully! It will be processed within 24 hours.');
      setProofFile(null);
      setVerificationResult(null);
      //refreshUserData();
    } catch (error) {
      console.error('Manual repayment error:', error);
      alert('Failed to submit payment proof: ' + (error.message || 'Please try again'));
    } finally {
      setProcessing(false);
    }
  };

  const LoanCard = ({ loan, index, type = 'active' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selectedLoan?.id === loan.id && selectedLoan?.type === type
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => setSelectedLoan({ ...loan, type })}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-gray-900">Loan #{loan.id.slice(-4)}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
            {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
          </span>
        </div>
        <span className="text-sm text-gray-500">{formatDate(loan.borrowedAt)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-500">Loan Amount</div>
          <div className="font-semibold text-gray-900">{formatCurrency(loan.amount)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Outstanding</div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(loan.outstandingAmount || (loan.amount - (loan.repaidAmount || 0)))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{loan.tenureMonths || 0} months</span>
          </div>
          {type === 'active' && loan.nextDueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Due: {formatDate(loan.nextDueDate)}</span>
            </div>
          )}
        </div>
        {loan.repaymentMethod && (
          <div className="text-xs px-2 py-1 bg-gray-100 rounded">
            {loan.repaymentMethod}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <br></br>
        <br></br>
        <br></br>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage your loan repayments and payment methods
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loans.active?.length === 0 && loans.completed?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              You don't have any active or previous loans.
            </p>
            <Link
              to="/request-loan"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request New Loan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Loans */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Loans Section */}
              {loans.active?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Active Loans</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {loans.active.length} active
                    </span>
                  </div>
                  <div className="space-y-4">
                    {loans.active.map((loan, index) => (
                      <LoanCard key={loan._id} loan={loan} index={index} type="active" />
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Loans Section */}
              {loans.completed?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Loan History</h2>
                    <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {loans.completed.length} completed
                    </span>
                  </div>
                  <div className="space-y-4">
                    {loans.completed.map((loan, index) => (
                      <LoanCard key={loan.id} loan={loan} index={index} type="completed" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Repayment Panel */}
            <div className="space-y-6">
              {selectedLoan && selectedLoan.type === 'active' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Repayment Options</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    For Loan #{selectedLoan.id.slice(-4)} - {formatCurrency(selectedLoan.outstandingAmount)}
                  </p>

                  <div className="space-y-6">
                    {/* Autodebit Option */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Setup Autodebit</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Set up automatic payments using Rupay. You'll need your mandate ID.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mandate ID
                          </label>
                          <input
                            type="text"
                            value={mandateId}
                            onChange={(e) => setMandateId(e.target.value)}
                            placeholder="Enter your mandate ID"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <button
                          onClick={() => handleAutodebitSetup(selectedLoan.id)}
                          disabled={processing || !mandateId.trim()}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {processing ? (
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {processing ? 'Processing...' : 'Setup Autodebit'}
                        </button>
                      </div>
                    </div>

                    {/* Manual Payment Option */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Upload className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Manual Payment</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload payment proof for manual verification.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Payment Proof
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="payment-proof"
                            />
                            <label
                              htmlFor="payment-proof"
                              className="cursor-pointer block"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-sm text-gray-600">
                                Click to upload or drag and drop
                              </span>
                              <span className="text-xs text-gray-500 block mt-1">
                                PNG, JPG, PDF up to 5MB
                              </span>
                            </label>
                          </div>
                        </div>

                        {proofFile && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate flex-1">
                                {proofFile.name}
                              </span>
                            </div>
                            <button
                              onClick={verifyPaymentProof}
                              disabled={verifying}
                              className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                            >
                              {verifying ? (
                                <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
                              ) : null}
                              {verifying ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        )}

                        {verificationResult && (
                          <div className={`p-3 rounded-lg text-sm ${
                            verificationResult === 'VERIFIED' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : verificationResult === 'REJECTED' 
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            <div className="flex items-center">
                              {verificationResult === 'verified' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Payment proof verified successfully
                                </>
                              ) : verificationResult === 'Reject' ? (
                                <>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Payment proof rejected. Please upload a clear image or correct image.
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Verification error. Please try again.
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleManualRepayment(selectedLoan.id)}
                          disabled={processing || !proofFile || verificationResult !== 'verified'}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {processing ? (
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {processing ? 'Submitting...' : 'Submit Payment Proof'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(!selectedLoan || selectedLoan.type !== 'active') && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {!selectedLoan ? 'Select a Loan' : 'Loan Completed'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {!selectedLoan 
                      ? 'Select an active loan to view repayment options' 
                      : 'This loan has been completed. No repayment required.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}