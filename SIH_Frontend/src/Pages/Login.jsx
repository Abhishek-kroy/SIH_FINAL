import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../Context/UserContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const [step, setStep] = useState(1); // 1: email/password, 2: OTP verification
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [resendTimer, setResendTimer] = useState(0);
  const { login, verifyOtp, resendOtp, loading, error, clearError, pendingEmail, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Resend OTP timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((timer) => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle navigation after successful login based on user role
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      setStep(2);
      setResendTimer(30); // Start 30-second timer for resend
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const emailToUse = pendingEmail || formData.email;
    const result = await verifyOtp(emailToUse, formData.otp);
    if (result.success && result.user) {
      // Navigation will be handled by the useEffect above
      // The useEffect will detect the user change and navigate accordingly
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    const emailToUse = pendingEmail || formData.email;
    const result = await resendOtp(emailToUse);
    if (result.success) {
      setResendTimer(30); // Reset timer
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    clearError();
    setFormData(prev => ({ ...prev, otp: '' }));
    setResendTimer(0);
  };

  // Auto-format OTP input
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, otp: value }));
    if (error) clearError();
  };

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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-sm text-gray-500 mb-2 tracking-wide">ACCESS PLATFORM</div>
              <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-4">
                {step === 1 ? 'Welcome back' : 'Verify Identity'}
              </h1>
              <div className="text-gray-500 text-sm">
                {step === 1 ? (
                  <>
                    New to CreditChain?{' '}
                    <Link
                      to="/register"
                      className="text-gray-900 hover:text-gray-700 transition-colors duration-200 border-b border-gray-300 hover:border-gray-500"
                    >
                      Create account
                    </Link>
                  </>
                ) : (
                  <>
                    Enter verification code{' '}
                    <button
                      onClick={handleBackToLogin}
                      className="text-gray-900 hover:text-gray-700 transition-colors duration-200 border-b border-gray-300 hover:border-gray-500"
                    >
                      Back to login
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {step === 1 ? (
            // Login Form
            <motion.form
              className="space-y-6"
              onSubmit={handleLoginSubmit}
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white font-medium tracking-wide hover:bg-gray-800 focus:outline-none focus:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed border border-gray-900 hover:border-gray-800"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border border-white border-t-transparent mr-2"
                      />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            // OTP Verification Form
            <motion.form
              className="space-y-6"
              onSubmit={handleOtpSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 border-b border-red-200 pb-2 text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide text-center">
                    6-DIGIT VERIFICATION CODE
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={formData.otp}
                    onChange={handleOtpChange}
                    className="w-full px-1 py-3 border-b border-gray-300 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none transition-colors duration-200 text-center text-xl tracking-widest font-mono"
                    placeholder="• • • • • •"
                  />
                </div>
                
                <div className="text-center space-y-3">
                  <div className="text-xs text-gray-500">
                    We sent a 6-digit verification code to<br />
                    <span className="font-medium text-gray-700">{pendingEmail || formData.email}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    The code will expire in 5 minutes
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs text-gray-600 hover:text-gray-900 transition-colors duration-200 border-b border-gray-300 hover:border-gray-500 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="w-full py-4 bg-gray-900 text-white font-medium tracking-wide hover:bg-gray-800 focus:outline-none focus:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed border border-gray-900 hover:border-gray-800"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border border-white border-t-transparent mr-2"
                      />
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="text-xs text-gray-400 tracking-wide">
              Secure • Encrypted • Compliant
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}