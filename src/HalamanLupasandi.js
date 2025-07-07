import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LupaSandi = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-500 to-gray-700 transition-all duration-500">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-xl overflow-hidden bg-gray-500">

        {/* Left Background */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/4 bg-gradient-to-br from-black via-gray-500 to-gray-700 flex items-center justify-center "
        >
          {/* No content inside, pure background */}
        </motion.div>

        {/* Middle Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full md:w-1/2 bg-white p-10"
        >
          <h2 className="text-3xl font-bold text-gray-700 text-center">Lupa Sandi</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Masukkan email untuk reset kata sandi</p>

          <form onSubmit={handleSubmit} className="space-y-4 ">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
            >
              Kirim Link Reset
            </motion.button>
          </form>

          {submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-green-600 text-center"
            >
              Link reset telah dikirim ke email Anda.
            </motion.div>
          )}
        </motion.div>

        {/* Right Background */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/4 bg-gradient-to-bl from-black via-gray-500 to-gray-700 flex items-center justify-center"
        >
          {/* No content inside, pure background */}
        </motion.div>
      </div>
    </div>
  );
};

export default LupaSandi;
