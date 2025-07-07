import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setShowModal(true); // Tampilkan modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-500 to-gray-700 transition-all duration-500">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-xl overflow-hidden">
        {/* Left: Form Register */}
        <div className="w-full md:w-1/2 bg-white p-10">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-700">Buat Akun</h2>
            <p className="text-gray-500">Silakan isi form untuk mendaftar.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
              >
                Daftar
              </motion.button>
            </form>

            <div
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer text-center"
            >
              Sudah punya akun? Login disini.
            </div>
          </motion.div>
        </div>

        {/* Right: Smooth Background */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-black via-gray-500 to-gray-700 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white text-center p-6"
          >
            <h1 className="text-5xl font-bold tracking-widest">REGISTER</h1>
            <div className="mt-2 w-14 h-1 bg-white mx-auto"></div>
          </motion.div>
        </div>
      </div>

      {/* Modal Sukses */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2>
              <p className="text-gray-500 mb-6">Akunmu sudah terdaftar. Silakan login.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseModal}
                className="bg-gradient-to-r from-black via-gray-600 to-gray-700 text-white px-6 py-2 rounded-md shadow-md hover:opacity-90 transition"
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;