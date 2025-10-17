import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Subtle background texture */}
      <div className="fixed inset-0 bg-[linear-gradient(45deg,#fafafa_25%,transparent_25%),linear-gradient(-45deg,#fafafa_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fafafa_75%),linear-gradient(-45deg,transparent_75%,#fafafa_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] opacity-20"></div>
      
      {/* Minimal cursor effect */}
      <motion.div
        className="fixed w-96 h-96 pointer-events-none z-10 mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)",
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
        <section className="pt-32 pb-20 px-6 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="text-xs font-medium text-gray-500 tracking-wider uppercase border-b border-gray-300 pb-1">Contact Us</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-light mb-8 leading-tight text-gray-900 tracking-tight">
                Get in touch
                <br />
                <span className="text-gray-600">with our team</span>
              </h1>

              <div className="border-l-2 border-gray-300 pl-6">
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Reach out with questions about our platform and services. 
                  We're here to help you navigate your financial journey.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-16 lg:grid-cols-2">
              
              {/* Contact Information */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  {[
                    {
                      title: "Email",
                      content: "support@creditchain.com",
                      description: "Send us an email anytime"
                    },
                    {
                      title: "Phone",
                      content: "+1 (555) 123-4567",
                      description: "Mon-Fri from 9am to 6pm"
                    },
                    {
                      title: "Office",
                      content: "123 Financial District\nMumbai, India",
                      description: ""
                    },
                    {
                      title: "Response Time",
                      content: "Within 24 hours",
                      description: "For all inquiries"
                    }
                  ].map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 pb-8 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-normal mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
                            {contact.title}
                          </h3>
                          <p className="text-gray-600 text-lg font-light mb-2 whitespace-pre-line">
                            {contact.content}
                          </p>
                          {contact.description && (
                            <p className="text-gray-500 text-sm">{contact.description}</p>
                          )}
                        </div>
                        <div className="w-8 h-px bg-gray-300 group-hover:w-12 group-hover:bg-gray-900 transition-all duration-300 mt-4 ml-6"></div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Business Hours */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-normal mb-4 text-gray-900">Business Hours</h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM IST</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="border border-gray-100 bg-white"
              >
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-light mb-2 text-gray-900">Send a message</h2>
                  <p className="text-gray-600">We'll respond as soon as possible</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 bg-white"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 bg-white"
                      placeholder="What is this regarding?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-3">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 bg-white resize-none"
                      placeholder="Your message here..."
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full px-8 py-4 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors duration-200 border border-gray-900 mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
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
                    Ready to begin?
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
                <p className="text-lg leading-relaxed text-gray-300 mb-6">
                  Whether you're looking to apply for a loan, need technical support, 
                  or want to learn more about our platform, our team is here to assist you. 
                  We typically respond to all inquiries within 24 hours.
                </p>
                <p className="text-gray-400">
                  For urgent matters, please call our support line during business hours.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}