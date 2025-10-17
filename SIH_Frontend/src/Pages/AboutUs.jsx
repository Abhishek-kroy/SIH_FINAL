import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AboutUs() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Subtle texture background */}
      <div className="fixed inset-0 bg-[linear-gradient(45deg,#fafafa_25%,transparent_25%),linear-gradient(-45deg,#fafafa_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fafafa_75%),linear-gradient(-45deg,transparent_75%,#fafafa_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] opacity-20"></div>
      
      {/* Minimal cursor effect */}
      <motion.div
        className="fixed w-96 h-96 pointer-events-none z-10 mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
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

      <div className="relative z-20">
        {/* Hero Section */}
        <section className="py-40 px-6 border-b border-gray-100 relative">
          <div className="absolute top-20 left-10 w-px h-16 bg-gray-300"></div>
          <div className="absolute bottom-20 right-10 w-px h-16 bg-gray-300"></div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider uppercase border-b border-gray-300 pb-1">About CreditChain</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-light mb-8 leading-tight text-gray-900 tracking-tight">
                Financial inclusion
                <br />
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">through technology</span>
              </h1>

              <div className="border-l-2 border-gray-300 pl-6">
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Revolutionizing financial inclusion through cutting-edge technology and 
                  transparent lending practices for underserved communities.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-20 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 w-px h-full bg-gray-200"></div>
                <div className="pl-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-px bg-gray-900"></div>
                    <h3 className="text-2xl font-normal text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    To democratize access to credit for backward classes and low-income communities 
                    by leveraging AI-driven credit scoring and blockchain technology. We believe 
                    everyone deserves a fair chance at financial growth, regardless of their 
                    economic background.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 w-px h-full bg-gray-200"></div>
                <div className="pl-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-px bg-gray-900"></div>
                    <h3 className="text-2xl font-normal text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    A world where financial services are accessible, transparent, and equitable 
                    for all. We envision a future where AI and blockchain work together to 
                    eliminate bias and create opportunities for those traditionally excluded 
                    from formal financial systems.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 border-y border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-px bg-gray-900"></div>
                <h2 className="text-3xl font-normal text-gray-900">
                  Core Values
                </h2>
              </div>
              <p className="text-gray-600 max-w-2xl text-lg">
                The principles that guide everything we do at CreditChain
              </p>
            </motion.div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  title: "Transparency",
                  desc: "Every transaction and credit decision is recorded on blockchain for complete auditability and trust.",
                },
                {
                  title: "Fairness", 
                  desc: "AI algorithms are designed to eliminate human bias and provide equal opportunities for all applicants.",
                },
                {
                  title: "Innovation",
                  desc: "Constantly evolving our technology to better serve underserved communities with cutting-edge solutions.",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="border-b border-gray-300 pb-1 mb-4 w-12 group-hover:w-24 transition-all duration-500"></div>
                  <h3 className="text-xl font-normal mb-4 text-gray-900 group-hover:text-gray-700 transition-colors">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-px bg-gray-900"></div>
                <h2 className="text-3xl font-normal text-gray-900">
                  Our Impact
                </h2>
              </div>
              <p className="text-gray-600 max-w-2xl text-lg">
                Transforming lives through accessible financial services
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { number: "10,000+", label: "Users Served" },
                { number: "₹50M+", label: "Loans Processed" },
                { number: "95%", label: "Approval Rate" },
                { number: "24h", label: "Average Processing" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="text-3xl font-light text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-500 border-t border-gray-200 pt-2 group-hover:border-gray-400 transition-colors">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 px-6 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="mb-12"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-px bg-white"></div>
                  <h2 className="text-3xl font-normal">
                    Technology
                  </h2>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="border-l-2 border-gray-600 pl-6"
              >
                <p className="text-lg leading-relaxed text-gray-300">
                  At CreditChain, we combine artificial intelligence with blockchain technology 
                  to create a fair, transparent, and efficient lending ecosystem. Our AI models 
                  analyze alternative data points to assess creditworthiness, while blockchain 
                  ensures every transaction is immutable and verifiable. This powerful combination 
                  enables us to serve communities that traditional financial institutions often overlook.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Accent elements */}
        <div className="fixed top-1/4 right-10 w-px h-32 bg-gray-300 opacity-50"></div>
        <div className="fixed bottom-1/4 left-10 w-px h-32 bg-gray-300 opacity-50"></div>
      </div>
    </div>
  );
}