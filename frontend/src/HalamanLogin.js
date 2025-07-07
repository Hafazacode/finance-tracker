// frontend/src/pages/Welcome.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from './apiservice'; // <-- IMPORT
// Import ikon mata dari Lucide React
import { Eye, EyeOff } from 'lucide-react'; // Pastikan Anda sudah menginstal lucide-react

const Welcome = () => {
    const [username, setUsername] = useState(''); // ini adalah email
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // State baru untuk mengontrol visibilitas password
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await login(username, password);
            localStorage.setItem('userToken', data.token);
            navigate('/app');
        } catch (err) {
            setError(err.message);
        }
    };

    // Fungsi untuk mengubah state showPassword
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-500 to-gray-700 transition-all duration-500">
            <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-xl overflow-hidden">
                {/* Left: Welcome Illustration */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-black via-gray-500 to-gray-700 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-white text-center p-6"
                    >
                        <h1 className="text-5xl font-bold tracking-widest">WELCOME</h1>
                        <div className="mt-2 w-14 h-1 bg-white mx-auto"></div>
                    </motion.div>
                </div>

                {/* Right: Login Form */}
                <div className="w-full md:w-1/2 bg-white p-10">
                    <motion.div
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-gray-700">Log In</h2>
                        <p className="text-gray-500">Login your account to start the service</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>

                            {/* --- BAGIAN INPUT PASSWORD YANG DIMODIFIKASI --- */}
                            <div className="relative"> {/* Tambahkan relative untuk posisi ikon */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10" // Tambah padding kanan untuk ikon
                                />
                                <button
                                    type="button" // Penting: type="button" agar tidak submit form
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Ikon dinamis */}
                                </button>
                            </div>
                            {/* --- AKHIR BAGIAN INPUT PASSWORD YANG DIMODIFIKASI --- */}

                            <div
                                onClick={() => navigate('/lupasandi')}
                                className="text-right text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                Lupa sandi?
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
                            >
                                Masuk
                            </motion.button>
                        </form>
                        <div
                            onClick={() => navigate('/register')}
                            className="text-center text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            Tidak punya akun? Daftar disini.
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;