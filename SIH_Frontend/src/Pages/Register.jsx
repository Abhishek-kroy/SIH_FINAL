import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    contact: '',
    age: '',
    blockchainAddress: '',
    // Demographic fields required at signup
    region: '',
    household_size: '',
    education_level: '',
    occupation: '',
    income_band: ''
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { register, loading, error, clearError, user } = useUser();
  const navigate = useNavigate();
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle navigation for already logged-in users
  useEffect(() => {
    if (user) {
      handleRoleBasedNavigation(user);
    }
  }, [user]);

  const handleRoleBasedNavigation = (userData) => {
    switch (userData.role) {
      case 1: // Admin
        navigate('/admin');
        break;
      case 2: // Bank
        navigate('/bank');
        break;
      case 5: // Another admin role
        navigate('/admin');
        break;
      default: // Regular user
        navigate('/home');
        break;
    }
  };

  const handleChange = (e) => {
    if (error) clearError();

    const { name, value } = e.target;

    // Validate age to only allow numbers and limit range
    if (name === 'age') {
      const ageValue = value.replace(/\D/g, '').slice(0, 3); // Only numbers, max 3 digits
      setFormData(prev => ({
        ...prev,
        [name]: ageValue
      }));
      return;
    }

    // Validate contact to only allow numbers and limit length
    if (name === 'contact') {
      const contactValue = value.replace(/\D/g, '').slice(0, 15); // Only numbers, max 15 digits
      setFormData(prev => ({
        ...prev,
        [name]: contactValue
      }));
      return;
    }

    // Validate account number to only allow numbers
    if (name === 'accountNumber') {
      const accountValue = value.replace(/\D/g, ''); // Only numbers
      setFormData(prev => ({
        ...prev,
        [name]: accountValue
      }));
      return;
    }

    // Validate IFSC code to be uppercase alphanumeric
    if (name === 'ifscCode') {
      const ifscValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Only uppercase letters and numbers
      setFormData(prev => ({
        ...prev,
        [name]: ifscValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setFormData(prev => ({ ...prev, blockchainAddress: address }));
        setMetaMaskConnected(true);
      } catch (error) {
        console.error('MetaMask connection failed:', error);
        alert('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert age to number before submitting
    const submitData = {
      ...formData,
      age: parseInt(formData.age) || 0
    };

    const result = await register(submitData);
    if (result.success) {
      navigate('/login');
    }
  };

  const features = [
    "AI-driven credit assessment",
    "Blockchain-secured records",
    "Instant approval process",
    "Transparent scoring system"
  ];

  // If user is already logged in, show loading state while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Minimal Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:96px_96px]"></div>
      <br></br>
      <br></br>
      <br></br>
      {/* Subtle Cursor Glow */}
      <motion.div
        className="fixed w-64 h-64 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)",
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
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

      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Minimal Feature Showcase */}
        <div className="hidden lg:flex lg:w-1/2 border-r border-gray-100 p-12 flex-col justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-sm font-medium text-gray-500 tracking-wide">CREDITCHAIN</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-md"
          >
            <div className="mb-12">
              <div className="text-sm text-gray-500 mb-4 tracking-wide">PLATFORM</div>
              <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-6 leading-tight">
                Next-generation credit scoring powered by artificial intelligence
              </h1>
              <div className="w-16 h-px bg-gray-300 mb-8"></div>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-5 h-5 border border-gray-300 mt-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900"></div>
                  </div>
                  <span className="text-gray-700 text-sm tracking-wide">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-gray-400 tracking-wide"
          >
            Secure • Transparent • Compliant
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-12">
              <div className="text-sm font-medium text-gray-500 tracking-wide mb-2">CREDITCHAIN</div>
              <h1 className="text-2xl font-light tracking-tight text-gray-900 mb-4">
                Create Account
              </h1>
            </div>

            {/* Form Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="text-sm text-gray-500 mb-2 tracking-wide">CREATE ACCOUNT</div>
                <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-4">
                  Join CreditChain
                </h1>
                <div className="text-gray-500 text-sm">
                  Already registered?{' '}
                  <Link
                    to="/login"
                    className="text-gray-900 hover:text-gray-700 transition-colors duration-200 border-b border-gray-300 hover:border-gray-500"
                  >
                    Sign in here
                  </Link>
                </div>
              </motion.div>
            </div>

            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 border-b border-red-200 pb-2"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    FULL NAME
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    PASSWORD
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Create a password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      CONTACT NUMBER
                    </label>
                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      required
                      value={formData.contact}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      AGE
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="text"
                      required
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                      placeholder="Age"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accountHolderName" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    ACCOUNT HOLDER NAME
                  </label>
                  <input
                    id="accountHolderName"
                    name="accountHolderName"
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Enter account holder name"
                  />
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    ACCOUNT NUMBER
                  </label>
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label htmlFor="ifscCode" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    IFSC CODE
                  </label>
                  <input
                    id="ifscCode"
                    name="ifscCode"
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200 uppercase"
                    placeholder="Enter IFSC code"
                  />
                </div>

                {/* Demographic Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="region" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      REGION
                    </label>
                    <select
                      id="region"
                      name="region"
                      required
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Rural">Rural</option>
                      <option value="Urban">Urban</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="household_size" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      HOUSEHOLD SIZE
                    </label>
                    <input
                      id="household_size"
                      name="household_size"
                      type="number"
                      required
                      value={formData.household_size}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent text-gray-900 focus:outline-none"
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="education_level" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      EDUCATION LEVEL
                    </label>
                    <select
                      id="education_level"
                      name="education_level"
                      required
                      value={formData.education_level}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Higher Secondary">Higher Secondary</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="occupation" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      OCCUPATION
                    </label>
                    <select
                      id="occupation"
                      name="occupation"
                      required
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Laborer">Laborer</option>
                      <option value="Service">Service</option>
                      <option value="Shopkeeper">Shopkeeper</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="income_band" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    INCOME BAND
                  </label>
                    <select
                      id="income_band"
                      name="income_band"
                      required
                      value={formData.income_band}
                      onChange={handleChange}
                      className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent text-gray-900 focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Very Low">Very Low</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                    BLOCKCHAIN ADDRESS
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.blockchainAddress}
                      readOnly
                      className="flex-1 px-1 py-3 border-b border-gray-300 bg-transparent placeholder-gray-400 text-gray-900"
                      placeholder="Connect MetaMask to get address"
                    />
                    <button
                      type="button"
                      onClick={connectMetaMask}
                      className="px-4 py-2 bg-orange-600 text-white font-medium tracking-wide hover:bg-orange-700 focus:outline-none focus:bg-orange-700 transition-colors duration-200"
                    >
                      {metaMaskConnected ? 'Connected' : 'Connect MetaMask'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !metaMaskConnected}
                  className="w-full py-4 bg-gray-900 text-white font-medium tracking-wide hover:bg-gray-800 focus:outline-none focus:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed border border-gray-900 hover:border-gray-800"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border border-white border-t-transparent mr-2"
                      />
                      Creating account...
                    </span>
                  ) : !metaMaskConnected ? (
                    'Connect MetaMask to Continue'
                  ) : (
                    'Create Account'
                  )}
                </button>
                {!metaMaskConnected && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    MetaMask connection is required for blockchain integration
                  </p>
                )}
              </div>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center lg:hidden"
            >
              <div className="text-xs text-gray-400 tracking-wide">
                Secure • Transparent • AI-Powered
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}