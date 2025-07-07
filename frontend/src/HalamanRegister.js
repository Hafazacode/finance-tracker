// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { register } from './apiservice'; // Pastikan path benar

// Import ikon mata dari lucide-react
import { Eye, EyeOff } from 'lucide-react'; 

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State untuk mengontrol visibilitas password
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email dan password tidak boleh kosong.");
            return;
        }

        // Tambahkan validasi password minimal 6 karakter
        if (password.length < 6) {
            setError("Password harus memiliki minimal 6 karakter.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await register(email, password);
            navigate('/verifikasi', { state: { email } });
        } catch (err) {
            setError(err.message || "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
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
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                required
                            />
                            {/* Input Password dengan ikon mata */}
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} // Tipe input dinamis
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10" // Tambah padding kanan
                                    required
                                />
                                <span 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)} // Toggle state
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Ikon Lucide */}
                                </span>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Mendaftarkan...' : 'Daftar'}
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
        </div>
    );
};

export default Register;