import { useEffect, useState } from "react";
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Users, 
  DollarSign, CreditCard, Building2, Wallet, TrendingUp, Zap, 
  FileText, Shield, Calendar, Edit2, Save, X, Upload, Check, 
  AlertCircle, PieChart, BarChart3, Activity, Home
} from "lucide-react";
import { useUser } from '../Context/UserContext';
import axios from 'axios';

// Chart components (unchanged)
const CreditScoreChart = ({ score }) => (
  <div className="relative h-32 w-full">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{score || 0}</div>
        <div className="text-sm text-gray-500">Credit Score</div>
      </div>
    </div>
    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
      <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <circle 
        cx="50" cy="50" r="40" 
        stroke="#10b981" 
        strokeWidth="8" 
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${((score || 0) / 850) * 251.2} 251.2`}
      />
    </svg>
  </div>
);

const LoanDistributionChart = ({ data }) => (
  <div className="space-y-2">
    {[
      { label: "Personal Loan", value: 40, color: "bg-blue-500" },
      { label: "Home Loan", value: 35, color: "bg-green-500" },
      { label: "Auto Loan", value: 25, color: "bg-purple-500" }
    ].map((item, index) => (
      <div key={index} className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
        <span className="text-sm font-semibold">{item.value}%</span>
      </div>
    ))}
  </div>
);

const PaymentHistoryChart = () => (
  <div className="flex items-end justify-between h-24 space-x-1">
    {[65, 80, 75, 90, 85, 95, 88, 92, 87, 94, 89, 96].map((value, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div
          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500"
          style={{ height: `${value}%` }}
        ></div>
        <div className="text-xs text-gray-500 mt-1">{index + 1}</div>
      </div>
    ))}
  </div>
);

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'financial', label: 'Financial Data', icon: DollarSign },
  { id: 'banking', label: 'Banking Details', icon: Building2 },
  { id: 'loans', label: 'Loan History', icon: CreditCard },
  { id: 'utilities', label: 'Utilities', icon: Zap },
  { id: 'credit', label: 'Credit Analysis', icon: TrendingUp },
];

export default function Profile() {
  const { user, refreshUser } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState('overview');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user) {
        setUserData(user);
        setFormData({
          age: user.age || '',
          household_size: user.household_size || '',
          contact: user.contact || '',
          region: user.region || ''
        });
        setLoading(false);
      } else {
        const result = await refreshUser();
        if (result.success) {
          setUserData(user);
          setFormData({
            age: user.age || '',
            household_size: user.household_size || '',
            contact: user.contact || '',
            region: user.region || ''
          });
        } else {
          setMessage("Failed to load profile");
        }
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSave = async () => {
    setMessage("");
    setSaving(true);
    
    try {
      // Only send allowed fields to the backend
      const updateData = {
        age: formData.age ? parseInt(formData.age) : undefined,
        household_size: formData.household_size ? parseInt(formData.household_size) : undefined,
        contact: formData.contact || undefined,
        region: formData.region || undefined
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/users/edit-profile`,
        cleanUpdateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        setMessage("Profile updated successfully");
        setEditMode(false);
        await refreshUser(); // Refresh user data from context
      } else {
        setMessage(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value, editable, field, type = "text", allowedToEdit = true }) => {
    const [inputValue, setInputValue] = useState(value || '');

    // Update local input value when formData changes
    useEffect(() => {
      setInputValue(formData[field] || '');
    }, [formData, field]);

    const handleLocalChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setFormData(prev => ({ ...prev, [field]: newValue }));
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              {editMode && editable && allowedToEdit ? (
                <input
                  type={type}
                  name={field}
                  value={inputValue}
                  onChange={handleLocalChange}
                  className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">{value || 'Not provided'}</p>
              )}
            </div>
          </div>
          {editMode && editable && !allowedToEdit && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read only</span>
          )}
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, trend, subtext }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No profile data available</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Credit Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={TrendingUp}
                label="Credit Score"
                value={userData.creditScore || 0}
                trend={2.5}
                subtext="Excellent"
              />
              <StatCard
                icon={DollarSign}
                label="Total Loans"
                value={`₹${(userData.totalLoanAmount || 0).toLocaleString()}`}
                subtext={`${userData.num_loans || 0} active loans`}
              />
              <StatCard
                icon={Zap}
                label="Electricity Usage"
                value={`${userData.avg_kwh_30d || userData.electricityUsage || 0} kWh`}
                trend={-1.2}
                subtext="Last 30 days"
              />
              <StatCard
                icon={Shield}
                label="Risk Band"
                value={userData.riskBand || "Not Assessed"}
                subtext={`${userData.on_time_ratio || 0}% on-time payments`}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score Trend</h3>
                <CreditScoreChart score={userData.creditScore} />
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Distribution</h3>
                <LoanDistributionChart data={userData} />
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History (12 Months)</h3>
                <PaymentHistoryChart />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.on_time_ratio || 0}%</div>
                <div className="text-sm text-gray-500">On-time Payments</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.num_loans || 0}</div>
                <div className="text-sm text-gray-500">Active Loans</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">₹{(userData.avg_bill_amount || userData.utilityBills || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Avg. Monthly Bills</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.asset_score || 0}/10</div>
                <div className="text-sm text-gray-500">Asset Score</div>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allowed to edit fields */}
              <InfoCard 
                icon={Calendar} 
                label="Age" 
                value={userData.age} 
                editable 
                field="age" 
                type="number" 
                allowedToEdit={true}
              />
              <InfoCard 
                icon={Phone} 
                label="Contact" 
                value={userData.contact} 
                editable 
                field="contact" 
                allowedToEdit={true}
              />
              <InfoCard 
                icon={MapPin} 
                label="Region" 
                value={userData.region} 
                editable 
                field="region" 
                allowedToEdit={true}
              />
              <InfoCard 
                icon={Users} 
                label="Household Size" 
                value={userData.household_size} 
                editable 
                field="household_size" 
                type="number" 
                allowedToEdit={true}
              />
              
              {/* Read-only fields */}
              <InfoCard 
                icon={User} 
                label="Full Name" 
                value={userData.name} 
                editable 
                field="name" 
                allowedToEdit={false}
              />
              <InfoCard 
                icon={User} 
                label="Gender" 
                value={userData.gender} 
                editable 
                field="gender" 
                allowedToEdit={false}
              />
              <InfoCard 
                icon={Mail} 
                label="Email" 
                value={userData.email} 
                editable 
                field="email" 
                type="email" 
                allowedToEdit={false}
              />
              <InfoCard 
                icon={GraduationCap} 
                label="Education" 
                value={userData.education_level} 
                editable 
                field="education_level" 
                allowedToEdit={false}
              />
              <InfoCard 
                icon={Briefcase} 
                label="Occupation" 
                value={userData.occupation} 
                editable 
                field="occupation" 
                allowedToEdit={false}
              />
              <InfoCard 
                icon={DollarSign} 
                label="Income Band" 
                value={userData.income_band || userData.predictedIncomeBand} 
                editable 
                field="income_band" 
                allowedToEdit={false}
              />
            </div>
          </div>
        );

      // ... rest of the sections remain the same
      case 'banking':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <InfoCard icon={CreditCard} label="Account Number" value={userData.accountNumber} editable={false} />
              <InfoCard icon={Building2} label="IFSC Code" value={userData.ifscCode} editable={false} />
              <InfoCard icon={User} label="Account Holder" value={userData.accountHolderName} editable={false} />
              {userData.blockchainAddress && (
                <InfoCard icon={Wallet} label="Blockchain Address" value={userData.blockchainAddress} editable={false} />
              )}
            </div>
          </div>
        );

      case 'loans':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard icon={DollarSign} label="Total Loan Amount" value={`₹${(userData.totalLoanAmount || 0).toLocaleString()}`} />
              <StatCard icon={CreditCard} label="Number of Loans" value={userData.num_loans || 0} />
              <StatCard icon={TrendingUp} label="Average Loan Amount" value={`₹${(userData.avg_loan_amount || 0).toLocaleString()}`} />
              <StatCard icon={Check} label="On-time Ratio" value={`${userData.on_time_ratio || 0}%`} />
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.avg_days_late || 0}</div>
                  <div className="text-sm text-gray-500">Avg Days Late</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.max_dpd || 0}</div>
                  <div className="text-sm text-gray-500">Max DPD</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.num_defaults || 0}</div>
                  <div className="text-sm text-gray-500">Defaults</div>
                </div>
                <div className={`text-center p-4 border rounded-lg ${
                  userData.default_flag ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}>
                  <div className={`text-xl font-bold ${userData.default_flag ? 'text-red-600' : 'text-green-600'}`}>
                    {userData.default_flag ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-500">Default Flag</div>
                </div>
              </div>
            </div>

            {/* Loan History */}
            {userData.loanHistory && userData.loanHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan History</h3>
                <div className="space-y-4">
                  {userData.loanHistory.map((loan, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">Loan #{index + 1}</h4>
                          <p className="text-sm text-gray-600">Amount: ₹{loan.amount?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Status: {loan.status}</p>
                          <p className="text-sm text-gray-600">Purpose: {loan.purpose || "Not specified"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Outstanding: ₹{loan.outstandingAmount?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Installments: {loan.installmentsPaid || 0}/{loan.totalInstallments || 0}</p>
                          {loan.nextDueDate && (
                            <p className="text-sm text-gray-600">Next Due: {new Date(loan.nextDueDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'utilities':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard icon={Zap} label="Avg Electricity Usage" value={`${userData.avg_kwh_30d || userData.electricityUsage || 0} kWh`} />
              <StatCard icon={Activity} label="Usage Variance" value={`${userData.var_kwh_30d || 0}`} />
              <StatCard icon={TrendingUp} label="Seasonality Index" value={userData.seasonality_index || 0} />
              <StatCard icon={DollarSign} label="Avg Recharge Amount" value={`₹${userData.avg_recharge_amount || userData.mobileRechargeAmount || 0}`} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utility Payment Behavior</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.recharge_freq_30d || 0}</div>
                  <div className="text-sm text-gray-500">Recharges (30d)</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.last_recharge_days || 0}d</div>
                  <div className="text-sm text-gray-500">Last Recharge</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{userData.bill_on_time_ratio || 0}%</div>
                  <div className="text-sm text-gray-500">Bills On-time</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{userData.avg_bill_delay || 0}d</div>
                  <div className="text-sm text-gray-500">Avg Bill Delay</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'credit':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard icon={TrendingUp} label="Credit Score" value={userData.creditScore || "N/A"} />
              <StatCard icon={Shield} label="Risk Band" value={userData.riskBand || "Not Assessed"} />
              <StatCard icon={Activity} label="Default Risk" value={`${((userData.defaultRiskProbability || 0) * 100).toFixed(1)}%`} />
              <StatCard icon={User} label="Customer Segment" value={userData.customerSegment || "N/A"} />
              <StatCard icon={DollarSign} label="Predicted Income" value={userData.predictedIncomeBand || "N/A"} />
              <StatCard icon={Calendar} label="Last Scored" value={userData.lastScoredAt ? new Date(userData.lastScoredAt).toLocaleDateString() : "Never"} />
            </div>

            {userData.recommendations && userData.recommendations.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {userData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Section Content</h3>
              <p className="text-gray-600 mt-2">Select a section from the sidebar to view detailed information.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{userData.name}</h1>
                <p className="text-sm text-gray-500">{userData.occupation || "Not specified"} • {userData.region || "Not specified"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                      saving 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        age: userData.age || '',
                        household_size: userData.household_size || '',
                        contact: userData.contact || '',
                        region: userData.region || ''
                      });
                      setMessage("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`rounded-lg p-4 ${
            message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex items-center">
              {message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? (
                <AlertCircle className="w-5 h-5 mr-3" />
              ) : (
                <Check className="w-5 h-5 mr-3" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Account Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium">{userData.createdAt ? new Date(userData.createdAt).getFullYear() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Credit Score</span>
                    <span className={`font-medium ${userData.creditScore ? 'text-green-600' : 'text-gray-500'}`}>
                      {userData.creditScore || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Risk Band</span>
                    <span className="font-medium text-blue-600">{userData.riskBand || "Not Assessed"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-600">
                      {userData.role === 0 ? "Beneficiary" : 
                       userData.role === 1 ? "Admin" : 
                       `Role ${userData.role}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection.replace('_', ' ')}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeSection === 'overview' && 'Comprehensive overview of your financial profile and credit health'}
                {activeSection === 'personal' && 'Your personal information and demographic details'}
                {activeSection === 'financial' && 'Detailed financial data and income information'}
                {activeSection === 'banking' && 'Bank account details and verification status'}
                {activeSection === 'loans' && 'Loan history and repayment performance'}
                {activeSection === 'utilities' && 'Utility consumption and payment patterns'}
                {activeSection === 'credit' && 'Credit analysis and risk assessment'}
              </p>
            </div>

            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}