// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword, // <-- TAMBAH: Impor fungsi forgotPassword
    resetPassword,  // <-- TAMBAH: Impor fungsi resetPassword
} = require('../Controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail); // <-- TAMBAH: Rute baru untuk verifikasi email
// Rute untuk permintaan lupa sandi (mengirim link reset ke email)
router.post('/forgot-password', forgotPassword);

// Rute untuk mengatur ulang sandi (menggunakan token dari link email)
router.post('/reset-password', resetPassword);

module.exports = router;