import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white py-16 mt-20">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-700"></div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          {/* Brand section */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-medium text-gray-300 tracking-wider mb-4">CREDITAI</div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Advanced credit scoring platform leveraging artificial intelligence 
              and blockchain technology for transparent, fair financial assessment.
            </p>
          </motion.div>

          {/* Links section */}
          <motion.div 
            className="flex gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 tracking-wider mb-2">PLATFORM</div>
              <div className="space-y-2">
                {['Credit Scoring', 'Risk Assessment', 'Analytics', 'Documentation'].map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 tracking-wider mb-2">COMPANY</div>
              <div className="space-y-2">
                {['About', 'Security', 'Compliance', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} CreditAI. All rights reserved.
              </p>
            </motion.div>

            {/* Legal links */}
            <motion.div 
              className="flex gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {['Privacy Policy', 'Terms of Service', 'Legal'].map((item) => (
                <a 
                  key={item}
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle decorative element */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gray-600"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </footer>
  );
}