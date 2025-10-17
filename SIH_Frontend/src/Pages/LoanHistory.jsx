import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { ArrowLeft, Calendar, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Plus, User, Home, Phone, Mail, Building, GraduationCap, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoanHistory() {
  const { user } = useUser();
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.loanHistory) {
      setLoanHistory(user.loanHistory);
      setLoading(false);
    }
  }, [user]);

  // Filter out pending loans for total calculations
  const approvedLoans = loanHistory.filter(loan => loan.status !== 'Pending');
  const pendingLoansList = loanHistory.filter(loan => loan.status === 'Pending');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Repaid':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Defaulted':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Repaid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Defaulted':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProgressPercentage = (loan) => {
    if (loan.amount && loan.repaidAmount) {
      return Math.min((loan.repaidAmount / loan.amount) * 100, 100);
    }
    return 0;
  };

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

  // Calculate advanced metrics
  const totalBorrowed = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalRepaid = approvedLoans.reduce((sum, loan) => sum + (loan.repaidAmount || 0), 0);
  const repaidLoans = approvedLoans.filter(loan => loan.status === 'Repaid').length;
  const defaultedLoans = approvedLoans.filter(loan => loan.status === 'Defaulted').length;

  // Calculate repayment efficiency
  const onTimeRatio = user?.on_time_ratio || 0;
  const avgDaysLate = user?.avg_days_late || 0;
  const defaultFlag = user?.default_flag || false;

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <Link 
                to="/home" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              
              <Link
                to="/request-loan"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request New Loan
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Loan Portfolio</h1>
                <p className="mt-2 text-gray-600">
                  Comprehensive view of your borrowing history and financial behavior
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{user?.num_loans || 0}</p>
                {pendingLoansList.length > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    {pendingLoansList.length} pending approval
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Personal Information */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Profile Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Region</span>
                <span className="text-sm font-medium text-gray-900">{user?.region || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Household Size</span>
                <span className="text-sm font-medium text-gray-900">{user?.household_size || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Education</span>
                <span className="text-sm font-medium text-gray-900">{user?.education_level || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupation</span>
                <span className="text-sm font-medium text-gray-900">{user?.occupation || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Income Band</span>
                <span className="text-sm font-medium text-gray-900">{user?.income_band || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Financial Behavior Metrics */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Behavior</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user?.num_loans || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Total Loans</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(onTimeRatio * 100)}%</div>
                <div className="text-xs text-gray-600 mt-1">On-Time Ratio</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{avgDaysLate}</div>
                <div className="text-xs text-gray-600 mt-1">Avg Days Late</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{user?.num_defaults || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Defaults</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalBorrowed)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Approved loans only</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Repaid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalRepaid)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all loans</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Loan Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(user?.avg_loan_amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per approved loan</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asset Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{user?.asset_score || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Financial health</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Consumption Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Electricity Usage</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Usage (30d)</span>
                <span className="text-sm font-medium text-gray-900">{user?.avg_kwh_30d || 0} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variability</span>
                <span className="text-sm font-medium text-gray-900">{user?.var_kwh_30d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Seasonality</span>
                <span className="text-sm font-medium text-gray-900">{user?.seasonality_index || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Mobile Recharge</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Amount</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(user?.avg_recharge_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frequency (30d)</span>
                <span className="text-sm font-medium text-gray-900">{user?.recharge_freq_30d || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Recharge</span>
                <span className="text-sm font-medium text-gray-900">{user?.last_recharge_days || 0} days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Bill Payments</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">On-Time Ratio</span>
                <span className="text-sm font-medium text-gray-900">{Math.round((user?.bill_on_time_ratio || 0) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Delay</span>
                <span className="text-sm font-medium text-gray-900">{user?.avg_bill_delay || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Bill Amount</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(user?.avg_bill_amount || 0)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Request New Loan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/request-loan"
            className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Need Financial Support?</h3>
                <p className="text-blue-100">
                  Apply for a new loan with competitive rates and flexible repayment options.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Request New Loan</span>
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Pending Loans Section */}
        {pendingLoansList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-amber-900">Loan Requests Pending Approval</h2>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingLoansList.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingLoansList.map((loan, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Loan Request #{index + 1}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatCurrency(loan.amount)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {loan.tenureMonths || 0} months
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-amber-600 font-medium">Under Review</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Approved Loan History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Approved Loan History</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {approvedLoans.length} loans
            </span>
          </div>

          {approvedLoans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved loans yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                You don't have any approved loans in your history yet.
              </p>
              <Link
                to="/request-loan"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Your First Loan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {approvedLoans.map((loan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Approved Loan #{index + 1}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {formatDate(loan.borrowedAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {loan.tenureMonths || 0} months
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(loan.amount)}
                      </div>
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span>{loan.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Active Loans */}
                  {loan.status === 'Pending' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Repayment Progress</span>
                        <span>{Math.round(getProgressPercentage(loan))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(loan)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Repaid: {formatCurrency(loan.repaidAmount)}</span>
                        <span>Remaining: {formatCurrency((loan.amount || 0) - (loan.repaidAmount || 0))}</span>
                      </div>
                    </div>
                  )}

                  {/* Repaid Amount for Completed Loans */}
                  {(loan.status === 'Repaid' || loan.status === 'Defaulted') && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Final Status</span>
                        <span className="text-sm text-gray-600">
                          Total Repaid: {formatCurrency(loan.repaidAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Credit Information */}
        {user?.creditScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{user.creditScore}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Band</p>
                <p className={`text-lg font-semibold mt-1 ${
                  user.riskBand?.includes('Low') ? 'text-green-600' :
                  user.riskBand?.includes('High') ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {user.riskBand || 'Not assessed'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Max DPD</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{user?.max_dpd || 0} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Default Flag</p>
                <p className={`text-lg font-semibold mt-1 ${
                  user?.default_flag ? 'text-red-600' : 'text-green-600'
                }`}>
                  {user?.default_flag ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}