import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';

export default function RiskAssessment() {
  const { isAuthenticated } = useUser();
  const [phoneBills, setPhoneBills] = useState([]);
  const [electricityBills, setElectricityBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setResults(null);
    
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }
    
    if (phoneBills.length === 0 && electricityBills.length === 0) {
      setError('Please upload at least one bill');
      return;
    }
    
    try {
      setLoading(true);
      const form = new FormData();
      phoneBills.forEach(f => form.append('phoneBill', f));
      electricityBills.forEach(f => form.append('electricityBill', f));

      const resp = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/users/risk-assessment`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || 'Risk assessment failed');
      }
      setMessage('Risk assessment completed successfully');
      setResults(data);
    } catch (e) {
      setError(e.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBandColor = (riskBand) => {
    switch (riskBand) {
      case 'Low Risk - High Priority':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Low Risk':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium Risk':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Moderate Risk':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'High Risk':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-green-500';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 45) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Assessment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your phone and electricity bills from the last 6 months. We'll analyze your payment patterns 
            and usage behavior to compute your credit risk profile.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phone Bills (up to 10 files)
                </label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple 
                  onChange={(e) => setPhoneBills(Array.from(e.target.files || []))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {phoneBills.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {phoneBills.length} file(s) selected
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Electricity Bills (up to 10 files)
                </label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple 
                  onChange={(e) => setElectricityBills(Array.from(e.target.files || []))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {electricityBills.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {electricityBills.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || (phoneBills.length === 0 && electricityBills.length === 0)}
              className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Bills...
                </span>
              ) : (
                'Analyze Bills & Generate Risk Profile'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment Results</h2>
            
            {/* Risk Band & Score */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-4 border-2 rounded-lg ${getRiskBandColor(results.riskBand)}`}>
                <h3 className="text-sm font-medium mb-2">Risk Band</h3>
                <p className="text-2xl font-bold">{results.riskBand}</p>
              </div>
              
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Credit Score</h3>
                <p className={`text-2xl font-bold ${getScoreColor(results.scoreLike)}`}>
                  {Math.round(results.scoreLike)}/100
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.features && Object.entries(results.features).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 capitalize mb-1">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Phone Bills Processed:</span> {results.phoneBillsProcessed || 0}
                </div>
                <div>
                  <span className="font-medium">Electricity Bills Processed:</span> {results.electricityBillsProcessed || 0}
                </div>
                {results.electricityUsageSource && (
                  <div className="col-span-2">
                    <span className="font-medium">Electricity Usage Source:</span> {results.electricityUsageSource}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Information Section */}
        {!results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How Risk Assessment Works</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• We analyze payment patterns from your phone and electricity bills</li>
              <li>• On-time payment history significantly improves your risk score</li>
              <li>• Consistent usage patterns demonstrate financial stability</li>
              <li>• Your data is processed securely and never shared with third parties</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}