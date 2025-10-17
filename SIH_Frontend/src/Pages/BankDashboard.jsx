import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { bankAPI } from '../utils/api';

// Risk Badge Component
const RiskBadge = ({ riskBand }) => {
  const getRiskConfig = (band) => {
    const configs = {
      'Low': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low Risk' },
      'Medium': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medium Risk' },
      'High': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High Risk' },
      'Very High': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Very High Risk' }
    };
    return configs[band] || configs['Medium'];
  };

  const config = getRiskConfig(riskBand);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

// Credit Score Display Component
const CreditScoreDisplay = ({ score }) => {
  const getScoreColor = (score) => {
    if (!score || score === 'N/A') return 'text-gray-600';
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    if (score >= 550) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Credit Score:</span>
      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
        {score || 'N/A'}
      </span>
    </div>
  );
};

export default function BankDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [p, a] = await Promise.all([bankAPI.listPending(), bankAPI.listActive()]);

      // The loans should already contain user's creditScore and riskBand from the backend
      // since they're populated from the User schema
      setPending(p.loans || []);
      setActive(a.loans || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load bank data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const idOf = (l) => `${l.userId}-${l.loanIndex}`;

  const handleApprove = async (l) => {
    try {
      setBusyId(idOf(l));
      setMessage(null);
      await bankAPI.approve(l.userId, l.loanIndex);
      await load();
      setMessage({ type: 'success', text: 'Loan application approved successfully' });
      setTab('active');
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to approve loan application' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (l) => {
    try {
      setBusyId(idOf(l));
      setMessage(null);
      await bankAPI.reject(l.userId, l.loanIndex);
      await load();
      setMessage({ type: 'success', text: 'Loan application rejected' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to reject loan application' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDefault = async (l) => {
    try {
      setBusyId(idOf(l));
      setMessage(null);
      await bankAPI.markDefault(l.userId, l.loanIndex);
      await load();
      setMessage({ type: 'success', text: 'Loan marked as defaulted' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to mark loan as defaulted' });
    } finally {
      setBusyId(null);
    }
  };

  const Section = ({ title, items, type }) => (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500 font-light">{items.length} {items.length === 1 ? 'application' : 'applications'}</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-50">
        {items.map((l) => (
          <div key={idOf(l)} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{l.userName}</h3>
                  <span className="text-sm font-bold text-gray-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    ₹{l.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                
                {/* Risk Assessment Section - From User Schema */}
                <div className="flex items-center gap-6 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <CreditScoreDisplay score={l.creditScore} />
                  <RiskBadge riskBand={l.riskBand} />
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Account: <span className="font-normal">{l.accountNumber}</span></span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">IFSC: <span className="font-normal">{l.ifscCode}</span></span>
                  </div>
                  
                  {l.purpose && (
                    <div className="text-gray-700 bg-white px-3 py-2 rounded border border-gray-200">
                      <span className="font-medium">Purpose:</span> "{l.purpose}"
                    </div>
                  )}

                  {/* Additional Risk Metrics from User Schema */}
                  {(l.defaultRiskProbability || l.customerSegment) && (
                    <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                      {l.defaultRiskProbability && (
                        <span className="font-medium">
                          Default Risk: <span className="font-normal">{l.defaultRiskProbability}%</span>
                        </span>
                      )}
                      {l.customerSegment && (
                        <span className="font-medium">
                          Segment: <span className="font-normal">{l.customerSegment}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {type === 'active' && (
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 pt-2">
                      <div>
                        <span className="font-medium text-gray-700">Outstanding:</span>
                        <div className="text-lg font-bold text-gray-900">₹{l.outstandingAmount?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">EMI Amount:</span>
                        <div className="text-lg font-bold text-gray-900">₹{l.installmentAmount?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Next Due:</span>
                        <div className="text-lg font-bold text-gray-900">
                          {l.nextDueDate ? new Date(l.nextDueDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {type === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleApprove(l)} 
                      disabled={busyId === idOf(l)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 border border-green-600 rounded-md shadow-sm"
                    >
                      {busyId === idOf(l) ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleReject(l)} 
                      disabled={busyId === idOf(l)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 rounded-md"
                    >
                      {busyId === idOf(l) ? 'Processing...' : 'Reject'}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleDefault(l)} 
                    disabled={busyId === idOf(l)}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100 disabled:border-amber-100 disabled:text-amber-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-md"
                  >
                    {busyId === idOf(l) ? 'Processing...' : 'Mark Default'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="text-gray-400 text-sm font-light">No {type === 'pending' ? 'pending' : 'active'} loan applications</div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 text-sm font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-12"
          >
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">Bank Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Management Dashboard</h1>
            <p className="text-gray-600 font-light">Welcome back, {user?.name}</p>
          </motion.div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-8 px-4 py-3 border-l-4 rounded-r-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <div className="text-sm font-medium">{message.text}</div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{pending.length}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-lg font-bold text-gray-900">Applications</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">{active.length}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Loans</p>
                  <p className="text-lg font-bold text-gray-900">Portfolio</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">
                    {Math.round([...pending, ...active].reduce((sum, loan) => sum + (loan.creditScore || 0), 0) / (pending.length + active.length) || 0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="text-lg font-bold text-gray-900">Credit Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setTab('pending')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                  tab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Review
                {pending.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">{pending.length}</span>
                )}
              </button>
              <button
                onClick={() => setTab('active')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                  tab === 'active'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Loans
                {active.length > 0 && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">{active.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {tab === 'pending' ? (
              <Section title="Applications Pending Review" items={pending} type="pending" />
            ) : (
              <Section title="Active Loan Portfolio" items={active} type="active" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}