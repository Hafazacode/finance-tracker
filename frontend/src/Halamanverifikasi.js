// frontend/src/pages/HalamanVerifikasi.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyEmail, register } from './apiservice'; // Asumsi apiService ada di src/apiService.js

const Halamanverifikasi = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialEmail = location.state?.email || '';
    const [email, setEmail] = useState(initialEmail);
    const [verificationCode, setVerificationCode] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    // State baru untuk tipe modal (misal: 'verifySuccess', 'resendSuccess', 'error')
    const [modalType, setModalType] = useState(null);

    useEffect(() => {
        if (!initialEmail) {
            setError("Email tidak ditemukan. Harap masukkan email Anda.");
            // Mungkin juga tampilkan modal error di sini jika email tidak ada
            // setShowResultModal(true);
            // setModalType('error');
        }
    }, [initialEmail]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email || !verificationCode) {
            setError("Email dan kode verifikasi tidak boleh kosong.");
            setModalType('error'); // Set tipe modal ke error
            setShowResultModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null); // Pastikan ini null sebelum mencoba lagi

        try {
            const response = await verifyEmail(email, verificationCode);
            setSuccessMessage(response.message);
            if (response.token) {
                localStorage.setItem('userToken', response.token);
            }
            setModalType('verifySuccess'); // Set tipe modal ke sukses verifikasi
            setShowResultModal(true);
        } catch (err) {
            setError(err.message);
            setModalType('error'); // Set tipe modal ke error
            setShowResultModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        setError(null);
        // setSuccessMessage(null); // Tidak perlu disetel null di sini, karena akan diganti dengan pesan resend

        try {
            // Asumsi `register` hanya mengirim email dan tidak mengembalikan token/status verifikasi akun
            await register(email, "placeholder_password"); // Menggunakan password placeholder
            setSuccessMessage("Kode verifikasi baru telah dikirim ke email Anda.");
            setModalType('resendSuccess'); // Set tipe modal ke sukses pengiriman ulang
            setShowResultModal(true);
        } catch (err) {
            setError(err.message);
            setModalType('error'); // Set tipe modal ke error
            setShowResultModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseResultModal = () => {
        setShowResultModal(false);
        if (modalType === 'verifySuccess') { // Hanya navigasi jika verifikasi akun berhasil
            navigate('/'); // Arahkan ke dashboard jika sukses verifikasi
        }
        // Jika modalType adalah 'resendSuccess' atau 'error', tetap di halaman verifikasi
        // Reset modalType setelah ditutup jika perlu
        setModalType(null);
        setError(null); // Bersihkan error setelah modal ditutup
        setSuccessMessage(null); // Bersihkan successMessage setelah modal ditutup
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
                    <h2 className="text-3xl font-bold text-gray-700 text-center">Verifikasi Email</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">Masukkan kode verifikasi yang telah dikirimkan ke email Anda.</p>

                    <form onSubmit={handleVerify} className="space-y-4 ">
                        <input
                            type="email"
                            placeholder="Email Anda"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            required
                            readOnly={!!location.state?.email}
                        />
                        <input
                            type="text"
                            placeholder="Kode Verifikasi (6 digit)"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            maxLength="6"
                            required
                        />

                        {error && !showResultModal && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {successMessage && !showResultModal && <p className="text-sm text-green-600 text-center">{successMessage}</p>}


                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Memverifikasi...' : 'Verifikasi Akun'}
                        </motion.button>
                    </form>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Tidak menerima kode? <button onClick={handleResendCode} disabled={isLoading || !email} className="text-blue-500 hover:text-blue-800">Kirim Ulang Kode</button>
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

            {/* Modal Hasil Verifikasi (Sukses/Error) */}
            <AnimatePresence>
                {showResultModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                            <h2 className={`text-2xl font-bold ${modalType === 'error' ? 'text-red-600' : 'text-green-600'} mb-2 w-full block`}>
                                {modalType === 'verifySuccess' ? 'Verifikasi Berhasil!' :
                                 modalType === 'resendSuccess' ? 'Kode Terkirim!' :
                                 'Terjadi Kesalahan!'}
                            </h2>
                            <p className="text-gray-500 mb-6">{successMessage || error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCloseResultModal}
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

export default Halamanverifikasi;