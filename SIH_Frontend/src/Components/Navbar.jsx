import { useEffect, useState } from "react";
import { useUser } from "../Context/UserContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut, User, LayoutDashboard, CreditCard } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setDropdownOpen(false);
    setOpen(false);
  }, [location]);

  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-emerald-600', 'bg-blue-600', 'bg-violet-600', 
      'bg-rose-600', 'bg-indigo-600', 'bg-teal-600',
      'bg-amber-600', 'bg-cyan-600', 'bg-fuchsia-600'
    ];
    if (user && user.name) {
      const index = user.name.length % colors.length;
      return colors[index];
    }
    return 'bg-slate-600';
  };

  const getLogoLink = () => {
    const isAdmin = isAuthenticated && user?.role === 1;
    const isBank = isAuthenticated && user?.role === 2;
    if (isAdmin) return "/admin";
    if (isBank) return "/bank";
    if (isAuthenticated) return "/home";
    return "/";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    navigate('/', { replace: true });
  };

  const toggleMenu = () => setOpen(!open);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const isActiveLink = (path) => location.pathname === path;
  const isAdmin = isAuthenticated && user?.role === 1;
  const isBank = isAuthenticated && user?.role === 2;

  return (
    (isAdmin || isBank) ? (
      <nav className="border-b border-slate-200 fixed top-0 w-full z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <Link to={getLogoLink()} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">
                CreditChain
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide -mt-1">
                {isAdmin ? 'Admin' : 'Bank'} Portal
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900 leading-tight">
                {user?.name || 'User'}
              </div>
            </div>
            <div className={`w-9 h-9 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-sm`}>
              {getUserInitial()}
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    ) : (
      <nav className="border-b border-slate-200 fixed top-0 w-full z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Enhanced Logo Section */}
          <Link to={getLogoLink()} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">
                CreditChain
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide -mt-1">
                Financial Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/home" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveLink('/home') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveLink('/dashboard') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/request-loan" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveLink('/request-loan') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Apply for Loan
                </Link>
                <Link 
                  to="/loan-repayment" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveLink('/loan-repayment') 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Loan Repayment
                </Link>
              </>
            ) : null}
            
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActiveLink('/about') 
                  ? 'text-blue-700 bg-blue-50' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActiveLink('/contact') 
                  ? 'text-blue-700 bg-blue-50' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 leading-tight">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-slate-500 capitalize leading-tight">
                      {user?.role || 'user'}
                    </div>
                  </div>
                  <div className={`w-9 h-9 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-sm`}>
                    {getUserInitial()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-medium text-slate-900">{user?.name || 'User'}</div>
                      <div className="text-sm text-slate-500 truncate mt-0.5">{user?.email || ''}</div>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Profile Settings</span>
                    </Link>

                    <Link 
                      to="/request-loan" 
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Apply for Loan</span>
                    </Link>

                    <Link 
                      to="/loan-repayment" 
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Loan Repayment</span>
                    </Link>
                    
                    <div className="border-t border-slate-100 my-1.5"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-slate-900 hidden sm:block">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <div className={`w-8 h-8 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white shadow-sm`}>
                  {getUserInitial()}
                </div>
              </div>
            )}
            <button 
              onClick={toggleMenu} 
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {open ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/home" 
                    className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink('/home') 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  
                  <Link 
                    to="/dashboard" 
                    className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink('/dashboard') 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link 
                    to="/request-loan" 
                    className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink('/request-loan') 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    Apply for Loan
                  </Link>

                  <Link 
                    to="/loan-repayment" 
                    className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink('/loan-repayment') 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    Loan Repayment
                  </Link>
                </>
              ) : null}
              
              <Link 
                to="/about" 
                className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink('/about') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              
              <Link 
                to="/contact" 
                className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink('/contact') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated && (
                <>
                  <Link 
                    to="/profile" 
                    className="block py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>

                  <div className="border-t border-slate-200 my-3"></div>

                  <div className="px-4 py-3 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-900">{user?.name || 'User'}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{user?.email || ''}</div>
                    <div className="text-xs text-blue-600 capitalize mt-1.5 font-medium">{user?.role || 'user'}</div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left py-2.5 px-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <div className="px-4 py-3 border-t border-slate-200 space-y-2">
                <Link 
                  to="/login" 
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    )
  );
}