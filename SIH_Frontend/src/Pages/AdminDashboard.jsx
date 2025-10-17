import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { api, blockchainAPI } from '../utils/api';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Info, 
  User as UserIcon, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS = [
  { label: 'Admin', value: 1 },
  { label: 'Bank', value: 2 },
  { label: 'Beneficiary', value: 5 },
];

// Helper to get user initials for avatar
const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Modular Component for the User List
const UserList = ({ users, query, onQueryChange, selectedUser, onSelectUser, isExpanded, onToggle }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" /> Users
      </h2>
      <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
        {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </div>

    <div className="p-4 border-b border-gray-100 relative">
      <Search className="w-4 h-4 text-gray-400 absolute left-7 top-1/2 -translate-y-1/2" />
      <input
        value={query}
        onChange={onQueryChange}
        placeholder="Search by name, email..."
        className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
      />
    </div>

    <div className="max-h-[36rem] overflow-y-auto">
      {users.length > 0 ? (
        users.map((u) => (
          <button
            key={u._id}
            onClick={() => onSelectUser(u)}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-4 ${
              selectedUser?._id === u._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 flex-shrink-0">
              {getInitials(u.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 text-sm truncate">{u.name}</div>
              <div className="text-xs text-gray-500 truncate">{u.email}</div>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
              {ROLE_OPTIONS.find(r => r.value === u.role)?.label || `Role ${u.role}`}
            </span>
          </button>
        ))
      ) : (
        <div className="px-6 py-8 text-center">
          <div className="text-sm text-gray-500">No users found</div>
        </div>
      )}
    </div>
  </div>
);

// Modular Component for the Role Assignment Panel
const RoleAssignmentPanel = ({ selectedUser, role, setRole, onAssign, isProcessing }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-gray-400" /> Assign Blockchain Role
      </h2>
    </div>

    <div className="p-6">
      {selectedUser ? (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-xs font-medium text-gray-500 mb-2">SELECTED USER</label>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{selectedUser.name}</div>
              <div className="text-gray-600 mt-1">{selectedUser.email}</div>
              <div className="text-gray-600 mt-1">Account: {selectedUser.accountNumber}</div>
            </div>
          </div>

          <RoleAssignmentForm role={role} setRole={setRole} onAssign={onAssign} isProcessing={isProcessing} selectedUser={selectedUser} />
        </div>
      ) : (
        <div className="text-gray-500 text-sm text-center py-24 flex flex-col items-center">
          <UserIcon className="w-12 h-12 text-gray-300 mb-4" />
          Select a user from the list to manage their blockchain role.
        </div>
      )}
    </div>
  </div>
);

// New Component for Loan Requests Overview
const LoanRequestsOverview = ({ pendingLoansCount, onViewAllLoans }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-400" /> Loan Requests Overview
      </h2>
    </div>
    
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-blue-900">{pendingLoansCount}</div>
          <div className="text-xs text-blue-600 mt-1">Awaiting approval</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-1">Approved This Week</div>
          <div className="text-2xl font-bold text-yellow-900">0</div>
          <div className="text-xs text-yellow-600 mt-1">Recently approved</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Total Processed</div>
          <div className="text-2xl font-bold text-green-900">0</div>
          <div className="text-xs text-green-600 mt-1">All time</div>
        </div>
      </div>
      
      <button
        onClick={onViewAllLoans}
        className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200 rounded-md shadow-sm flex items-center justify-center gap-2"
      >
        <FileText className="w-4 h-4" />
        View All Loan Requests
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [pendingLoansCount, setPendingLoansCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.users || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLoanStats = async () => {
      try {
        // This would be your actual API endpoint for loan statistics
        const res = await api.get('/loans/stats');
        setPendingLoansCount(res.pendingCount || 0);
      } catch (e) {
        console.error('Failed to fetch loan stats:', e);
        // Fallback - you might want to fetch actual loan data here
        setPendingLoansCount(0);
      }
    };
    fetchLoanStats();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.accountNumber?.toLowerCase?.().includes(q)
    );
  });

  const assignUserRole = async () => {
    if (!selectedUser) return;
    try {
      setIsProcessing(true);
      setMessage(null);
      // The backend expects accountNumber and ifscCode, not a wallet address for this function.
      await blockchainAPI.assignRole(selectedUser.accountNumber, selectedUser.ifscCode, role);

      // Optimistically update the UI, or refetch
      const updatedUsers = users.map(u => 
        u._id === selectedUser._id ? { ...u, role } : u
      );
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, role }); // Update selected user view

      setMessage({ type: 'success', text: 'Role assigned successfully on blockchain' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to assign role' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewAllLoans = () => {
    navigate('/admin/loans');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm font-light">Loading admin dashboard...</p>
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
            <div className="mb-4">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">Administration</span>
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 font-light">Assign blockchain roles to registered users</p>
          </motion.div>

          {/* Loan Requests Overview */}
          <LoanRequestsOverview 
            pendingLoansCount={pendingLoansCount}
            onViewAllLoans={handleViewAllLoans}
          />

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Users List */}
            <motion.div
              initial={{ width: isExpanded ? 320 : 64 }}
              animate={{ width: isExpanded ? 320 : 64 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {isExpanded ? (
                <UserList
                  users={filteredUsers}
                  query={query}
                  onQueryChange={(e) => setQuery(e.target.value)}
                  selectedUser={selectedUser}
                  onSelectUser={setSelectedUser}
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded(!isExpanded)}
                />
              ) : (
                <div className="p-4 flex flex-col items-center h-full">
                  <button onClick={() => setIsExpanded(true)} className="mb-4 text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <Users className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">{users.length}</span>
                </div>
              )}
            </motion.div>

            {/* Role Assignment */}
            <div className="flex-1">
              {message && (
                <div className={`mb-6 px-4 py-3 border-l-4 rounded-r-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}>
                  <div className="text-sm font-medium">{message.text}</div>
                </div>
              )}
              <RoleAssignmentPanel
                selectedUser={selectedUser}
                role={role}
                setRole={setRole}
                onAssign={assignUserRole}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const RoleAssignmentForm = ({ role, setRole, onAssign, isProcessing, selectedUser }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">User's Blockchain Address</label>
      <input
        value={selectedUser.blockchainAddress || 'Not provided by user'}
        readOnly
        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-gray-100 text-gray-500 focus:outline-none"
      />
    </div>

    <div className="flex items-end gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Role</label>
        <select
          value={role}
          onChange={(e) => setRole(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
    </div>
    
    <div className="pt-2">
      <button
        onClick={onAssign}
        disabled={isProcessing}
        className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-md shadow-sm"
      >
        {isProcessing ? 'Processing on Blockchain...' : 'Confirm & Assign Role'}
      </button>
    </div>

    <div className="text-xs text-gray-600 bg-blue-50 border-l-4 border-blue-300 px-4 py-3 flex items-start gap-3 rounded-r-lg">
      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div><span className="font-medium">Note:</span> This action directly interacts with the blockchain to assign a role based on the user's bank account details. The role in the application database is updated separately.</div>
    </div>
  </>
);