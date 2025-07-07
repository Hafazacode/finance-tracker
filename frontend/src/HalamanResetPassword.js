// frontend/src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword as apiResetPassword } from './apiservice'; // Import fungsi API

// Import ikon mata dari lucide-react
import { Eye, EyeOff } from 'lucide-react'; 

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // State untuk mengontrol visibilitas password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setMessage('Token reset sandi tidak ditemukan di URL.');
            setIsSuccess(false);
            setShowModal(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setIsSuccess(false);

        if (!token) {
            setMessage('Token reset sandi tidak valid atau tidak ada.');
            setIsSuccess(false);
            setShowModal(true);
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage('Sandi baru harus memiliki minimal 6 karakter.');
            setIsSuccess(false);
            setShowModal(true);
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Konfirmasi sandi tidak cocok.');
            setIsSuccess(false);
            setShowModal(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiResetPassword(token, password);

            setMessage(response.message || 'Sandi Anda berhasil diatur ulang.');
            setIsSuccess(true);
            setShowModal(true);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage(err.message || 'Terjadi kesalahan saat mengatur ulang sandi. Silakan coba lagi.');
            setIsSuccess(false);
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (isSuccess) {
            navigate('/');
        }
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
                    <h2 className="text-3xl font-bold text-gray-700 text-center">Atur Ulang Sandi</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">Masukkan sandi baru Anda</p>

                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        {/* Input Sandi Baru */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Sandi Baru"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                                required
                            />
                            <span 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Menggunakan EyeOff dan Eye dari Lucide */}
                            </span>
                        </div>

                        {/* Input Konfirmasi Sandi Baru */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi Sandi Baru"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                                required
                            />
                            <span 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Menggunakan EyeOff dan Eye dari Lucide */}
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Mengatur Ulang...' : 'Atur Ulang Sandi'}
                        </motion.button>
                    </form>

                    {/* --- MODAL UNTUK MENAMPILKAN PESAN SUKSES/ERROR --- */}
                    <AnimatePresence>
                        {showModal && (
                            <motion.div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center"
                                >
                                    <h2 className={`text-2xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'} mb-2 w-full block`}>
                                        {isSuccess ? 'Berhasil!' : 'Gagal!'}
                                    </h2>
                                    <p className="text-gray-500 mb-6">{message}</p>
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
                    {/* --- END MODAL --- */}

                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Kembali ke <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-800 focus:outline-none">Login</button>
                    </div>

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

export default ResetPassword;