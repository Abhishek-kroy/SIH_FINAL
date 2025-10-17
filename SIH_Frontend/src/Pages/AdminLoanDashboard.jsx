import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { userAPI } from '../utils/userAPI';
import { ChevronRight, User, Clock, DollarSign, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ProtectedRoute from '../Components/ProtectedRoute';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Risk Badge Component
const RiskBadge = ({ riskBand }) => {
  const getRiskConfig = (band) => {
    const configs = {
      'Low': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'Medium': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
      'High': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
      'Very High': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    };
    return configs[band] || configs['Medium'];
  };

  const config = getRiskConfig(riskBand);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {riskBand}
    </span>
  );
};

function groupPendingLoansByUser(loans) {
  const userMap = {};
  loans.forEach(loan => {
    if (!userMap[loan.userId]) {
      userMap[loan.userId] = {
        _id: loan.userId,
        name: loan.userName,
        email: loan.email,
        creditScore: loan.creditScore,
        riskBand: loan.riskBand,
        pendingLoans: []
      };
    }
    userMap[loan.userId].pendingLoans.push({
      amount: loan.amount,
      tenureMonths: loan.tenureMonths,
      status: 'Pending',
      purpose: loan.purpose,
      requestedAt: loan.requestedAt,
      loanIndex: loan.loanIndex,
      creditScore: loan.creditScore,
      riskBand: loan.riskBand
    });
  });
  return Object.values(userMap);
}

function prepareLoanAmountData(pendingLoans) {
  return pendingLoans.map((loan, index) => ({
    name: `Loan ${index + 1}`,
    amount: loan.amount || 0,
  }));
}

function prepareLoanStatusData(user) {
  return [{ name: 'Pending', value: user.pendingLoans.length }];
}

const AnimatedBar = (props) => {
  const [animatedHeight, setAnimatedHeight] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeight(props.height);
    }, props.index * 100);
    return () => clearTimeout(timer);
  }, [props.height, props.index]);

  return (
    <motion.rect
      {...props}
      height={animatedHeight}
      initial={{ height: 0 }}
      animate={{ height: animatedHeight }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
};

export default function AdminLoanDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [usersWithPendingLoans, setUsersWithPendingLoans] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchPendingLoans = async () => {
      try {
        const res = await userAPI.getPendingLoans();
        const groupedUsers = groupPendingLoansByUser(res.loans || []);
        setUsersWithPendingLoans(groupedUsers);
        if (groupedUsers.length > 0) {
          setSelectedUser(groupedUsers[0]);
        }
      } catch (error) {
        console.error('Failed to fetch pending loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingLoans();
  }, []);

  const handleApprove = async (userId, loanIndex) => {
    try {
      await userAPI.approve(userId, loanIndex);
      alert('Loan approved successfully');
      // Remove approved loan from state
      setUsersWithPendingLoans(prevUsers => {
        const updatedUsers = prevUsers.map(user => {
          if (user._id === userId) {
            const updatedLoans = user.pendingLoans.filter(loan => loan.loanIndex !== loanIndex);
            return { ...user, pendingLoans: updatedLoans };
          }
          return user;
        }).filter(user => user.pendingLoans.length > 0);
        // Update selected user if needed
        if (selectedUser && selectedUser._id === userId) {
          const newSelectedUser = updatedUsers.find(user => user._id === userId) || updatedUsers[0] || null;
          setSelectedUser(newSelectedUser);
        }
        return updatedUsers;
      });
    } catch (error) {
      console.error('Failed to approve loan:', error);
      alert('Failed to approve loan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading pending loans...</p>
        </div>
      </div>
    );
  }

  if (usersWithPendingLoans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">No pending loans found</p>
          <p className="text-gray-400 text-sm mt-2">All loan applications have been processed</p>
        </div>
      </div>
    );
  }

  const totalPendingLoans = usersWithPendingLoans.reduce((sum, u) => sum + u.pendingLoans.length, 0);
  const totalAmount = usersWithPendingLoans.reduce((sum, u) => 
    sum + u.pendingLoans.reduce((loanSum, loan) => loanSum + (loan.amount || 0), 0), 0
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Loans Dashboard</h1>
            <p className="text-gray-500">Review and manage pending loan applications</p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{usersWithPendingLoans.length}</p>
                    <p className="text-xs text-gray-500">Total Users</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalPendingLoans}</p>
                    <p className="text-xs text-gray-500">Pending Loans</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{(totalAmount / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-gray-500">Total Amount</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - User List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-4"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="font-semibold text-gray-900">Applicants ({usersWithPendingLoans.length})</h2>
                </div>
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                  {usersWithPendingLoans.map((userItem, index) => (
                    <motion.div
                      key={userItem._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedUser(userItem)}
                      className={`p-4 cursor-pointer transition-all border-b border-gray-50 hover:bg-blue-50 ${
                        selectedUser?._id === userItem._id
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {userItem.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{userItem.name}</p>
                            <p className="text-xs text-gray-500 truncate">{userItem.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <RiskBadge riskBand={userItem.riskBand} />
                              <span className="text-xs font-medium text-gray-700">
                                {userItem.creditScore || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            {userItem.pendingLoans.length}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedUser?._id === userItem._id ? 'transform translate-x-1' : ''
                          }`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Content - Details */}
            <div className="col-span-8">
              <AnimatePresence mode="wait">
                {selectedUser && (
                  <motion.div
                    key={selectedUser._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* User Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                            <RiskBadge riskBand={selectedUser.riskBand} />
                          </div>
                          <p className="text-gray-500">{selectedUser.email}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              <strong>Credit Score:</strong> {selectedUser.creditScore || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
                          {selectedUser.pendingLoans.length} Pending
                        </span>
                      </div>
                    </div>

                    {/* Loan Details Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                        <h3 className="font-semibold text-gray-900">Loan Applications</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenure</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit Score</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Band</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedUser.pendingLoans.map((loan, idx) => (
                              <motion.tr
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{idx + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                                  ₹{loan.amount?.toLocaleString('en-IN') || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{loan.tenureMonths || 'N/A'} months</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{loan.purpose || 'N/A'}</td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {loan.creditScore || selectedUser.creditScore || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <RiskBadge riskBand={loan.riskBand || selectedUser.riskBand} />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    {loan.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleApprove(selectedUser._id, loan.loanIndex)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-md"
                                  >
                                    Approve
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                      >
                        <h3 className="font-semibold text-gray-900 mb-4">Loan Amounts</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={prepareLoanAmountData(selectedUser.pendingLoans)}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} shape={<AnimatedBar />} />
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                      >
                        <h3 className="font-semibold text-gray-900 mb-4">Status Overview</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={prepareLoanStatusData(selectedUser)}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, value }) => `${name}: ${value}`}
                              animationBegin={0}
                              animationDuration={1000}
                            >
                              {prepareLoanStatusData(selectedUser).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}