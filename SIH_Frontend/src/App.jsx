import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context/UserContext";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import LandingPage from "./Pages/LandingPage";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import LoanRequestForm from "./Pages/LoanRequestForm";
import UserDashboard from './Pages/UserDashboard';
import HomePage from "./Pages/HomePage";
import LoanHistory from "./Pages/LoanHistory";
import LoanRepayment from "./Pages/LoanRepayment";
import Profile from "./Pages/Profile";
import ProtectedRoute from "./Components/ProtectedRoute"; // ✅ Import ProtectedRoute
import AdminDashboard from "./Pages/AdminDashboard";
import AdminLoanDashboard from "./Pages/AdminLoanDashboard";
import BankDashboard from "./Pages/BankDashboard";
import RiskAssessment from "./Pages/RiskAssessment";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route 
                path="/request-loan" 
                element={
                  <ProtectedRoute>
                    <LoanRequestForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/risk-assessment" 
                element={
                  <ProtectedRoute>
                    <RiskAssessment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
               <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/loans"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLoanDashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/loan-history" 
                element={
                  <ProtectedRoute>
                    <LoanHistory />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/loan-repayment"
                element={
                  <ProtectedRoute>
                    <LoanRepayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/bank"
                element={
                  <ProtectedRoute requireBank>
                    <BankDashboard />
                  </ProtectedRoute>
                }
              />
              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                      404 - Page Not Found
                    </h1>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}
