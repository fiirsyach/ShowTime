'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="glass p-8 md:p-12 rounded-3xl max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Subscribe to <span className="text-gradient">Newsletter</span>
            </h2>
            <p className="text-white/60 mb-6">
              Get the latest updates on concerts, festivals, and exclusive offers
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark/50 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </form>

            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 mt-4"
              >
                ✅ Subscribed successfully!
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;