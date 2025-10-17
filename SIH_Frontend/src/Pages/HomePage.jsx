import { motion } from "framer-motion";
import { useUser } from '../Context/UserContext';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user } = useUser();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const totalLoans = user?.loanHistory?.length || 0;
  const activeLoans = user?.loanHistory?.filter(loan => loan.status === "Pending")?.length || 0;
  const repaidLoans = user?.loanHistory?.filter(loan => loan.status === "Repaid")?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 overflow-hidden relative">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-white/90"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
      
      {/* Refined Cursor Effect */}
      <motion.div
        className="fixed w-80 h-80 pointer-events-none z-10 mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
          left: mousePosition.x - 160,
          top: mousePosition.y - 160,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-20">
        {/* Welcome Section */}
        <section className="text-center py-24 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-8 px-4 py-2 border border-slate-300 bg-white/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-slate-700 text-sm font-light tracking-widest">
                WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase()}
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-light mb-8 leading-tight text-slate-900 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Financial Clarity
              <br />
              <span className="font-normal">Awaits</span>
            </motion.h1>

            <motion.p
              className="text-lg max-w-2xl mx-auto mb-12 text-slate-600 leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Manage your credit journey with precision and insight. 
              Your financial future starts with informed decisions today.
            </motion.p>
          </motion.div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Credit Score",
                value: user?.creditScore || "—",
                subtitle: "Current standing",
                color: "text-emerald-700",
                bg: "bg-white border border-slate-200"
              },
              {
                title: "Total Loans",
                value: totalLoans,
                subtitle: "All applications",
                color: "text-blue-700",
                bg: "bg-white border border-slate-200"
              },
              {
                title: "Active",
                value: activeLoans,
                subtitle: "Current commitments",
                color: "text-amber-700",
                bg: "bg-white border border-slate-200"
              },
              {
                title: "Completed",
                value: repaidLoans,
                subtitle: "Successful closures",
                color: "text-violet-700",
                bg: "bg-white border border-slate-200"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`p-8 text-left hover:shadow-sm transition-all duration-500 ${stat.bg}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <h3 className="text-sm font-medium text-slate-500 mb-3 tracking-wide">{stat.title}</h3>
                <div className={`text-3xl font-light mb-2 ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-slate-400 font-light">{stat.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Profile Information */}
            <motion.div
              className="bg-white border border-slate-200 p-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-light mb-8 text-slate-900 tracking-wide">Personal Profile</h2>
              <div className="space-y-5">
                {[
                  { label: "Full Name", value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Contact", value: user?.contact || "Not provided" },
                  { 
                    label: "Risk Profile", 
                    value: user?.riskBand,
                    color: user?.riskBand?.includes('Low') ? 'text-emerald-700' : 
                          user?.riskBand?.includes('High') ? 'text-rose-700' : 'text-amber-700'
                  },
                  { 
                    label: "Member Since", 
                    value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between border-b border-slate-100 pb-4">
                    <span className="text-slate-600 font-light">{item.label}</span>
                    <span className={`font-medium ${item.color || 'text-slate-900'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white border border-slate-200 p-10"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-light mb-8 text-slate-900 tracking-wide">Quick Actions</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Apply for Loan",
                    description: "Begin new application process",
                    path: "/request-loan"
                  },
                  {
                    title: "View Dashboard",
                    description: "Comprehensive analytics overview",
                    path: "/dashboard"
                  },
                  {
                    title: "Loan History",
                    description: "Review past transactions",
                    path: "/loan-history"
                  },
                  {
                    title: "Profile Settings",
                    description: "Manage account preferences",
                    path: "/profile"
                  }
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="block"
                  >
                    <motion.div
                      className="p-5 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 text-left w-full group"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <h3 className="font-medium text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-light">{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Activity */}
        {user?.loanHistory && user.loanHistory.length > 0 && (
          <section className="py-16 px-6 max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-light mb-4 text-slate-900 tracking-wide">Recent Activity</h2>
              <p className="text-slate-600 font-light">Your latest financial transactions and status</p>
            </motion.div>

            <div className="space-y-5">
              {user.loanHistory.slice(0, 3).map((loan, index) => (
                <motion.div
                  key={index}
                  className="bg-white border border-slate-200 p-7 hover:border-slate-300 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-slate-900 mb-2">Loan #{index + 1}</h3>
                      <p className="text-slate-600 font-light">
                        ₹{loan.amount?.toLocaleString()} • {loan.tenureMonths} months
                      </p>
                      {loan.borrowedAt && (
                        <p className="text-sm text-slate-400 mt-2 font-light">
                          Initiated {new Date(loan.borrowedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-4 py-1 text-sm font-medium border ${
                      loan.status === "Repaid" ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                      loan.status === "Defaulted" ? "border-rose-200 text-rose-700 bg-rose-50" :
                      "border-blue-200 text-blue-700 bg-blue-50"
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Subtle Background Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-slate-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}