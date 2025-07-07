// frontend/src/pages/LupaSandi.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Impor AnimatePresence untuk modal
import { useNavigate } from 'react-router-dom'; // Impor useNavigate untuk navigasi
import { forgotPassword as apiForgotPassword } from './apiservice'; // Impor fungsi API

const LupaSandi = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State untuk indikator loading
    const [message, setMessage] = useState(null); // State untuk pesan sukses/error
    const [isSuccess, setIsSuccess] = useState(false); // State untuk membedakan sukses/error
    const [showModal, setShowModal] = useState(false); // State untuk mengontrol visibilitas modal

    const navigate = useNavigate(); // Hook untuk navigasi

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Mulai loading
        setMessage(null); // Bersihkan pesan sebelumnya
        setIsSuccess(false); // Reset status sukses

        // Validasi frontend dasar: hanya izinkan email @gmail.com
        if (!email.endsWith('@gmail.com')) {
            setMessage('Hanya email dengan domain @gmail.com yang diizinkan.');
            setIsSuccess(false);
            setShowModal(true); // Tampilkan modal error
            setIsLoading(false); // Hentikan loading
            return;
        }

        try {
            // Panggil fungsi API forgotPassword dari apiservice
            const response = await apiForgotPassword(email);

            // Jika respons berhasil, tampilkan pesan sukses dari backend
            setMessage(response.message || 'Jika email Anda terdaftar, link reset sandi telah dikirimkan.');
            setIsSuccess(true);
            setShowModal(true); // Tampilkan modal sukses
            setEmail(''); // Bersihkan input email setelah berhasil
        } catch (err) {
            // Jika ada error dari API (misal: 400, 500), tangani di sini
            setMessage(err.message || 'Terjadi kesalahan saat meminta reset sandi. Silakan coba lagi.');
            setIsSuccess(false);
            setShowModal(true); // Tampilkan modal error
        } finally {
            setIsLoading(false); // Selalu hentikan loading setelah permintaan selesai
        }
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
        // Jika berhasil, arahkan pengguna ke halaman login
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
                            disabled={isLoading} // Nonaktifkan tombol saat loading
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'} {/* Ubah teks tombol */}
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
                        Ingat sandi Anda? <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-800 focus:outline-none">Login</button>
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

export default LupaSandi;