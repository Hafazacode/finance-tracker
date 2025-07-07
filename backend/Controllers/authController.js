// backend/controllers/authController.js

const pool = require('../db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Pastikan path ke emailservice.js benar relatif dari authController.js
const { sendVerificationEmail, sendPasswordResetEmail } = require('../Controllers/emailservice.js'); // <-- Perbaikan path

// Fungsi helper untuk menghasilkan token JWT (tetap sama)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Fungsi helper untuk menghasilkan kode verifikasi (tetap sama)
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Kode 6 digit
};

// @desc    Register a new users
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Harap isi semua field' });
    }

    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Hanya email dengan domain @gmail.com yang diizinkan untuk registrasi.' });
    }

    try {
        const [userExists] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            const existingUser = userExists[0];
            if (!existingUser.is_verified) {
                const newVerificationCode = generateVerificationCode();
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
                const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

                await pool.query(
                    'UPDATE users SET verification_code = ?, verification_code_expires_at = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [newVerificationCode, formattedExpiresAt, existingUser.id]
                );
                await sendVerificationEmail(email, newVerificationCode);

                return res.status(200).json({
                    message: 'Akun sudah terdaftar tapi belum terverifikasi. Kode verifikasi baru telah dikirim ke email Anda.',
                    id: existingUser.id,
                    email: existingUser.email
                });
            } else {
                return res.status(400).json({ message: 'User sudah terdaftar.' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, verification_code, is_verified, verification_code_expires_at) VALUES (?, ?, ?, ?, ?)',
            [email, password_hash, verificationCode, false, formattedExpiresAt]
        );
        const insertedId = result.insertId;

        if (insertedId) {
            await sendVerificationEmail(email, verificationCode);
            res.status(201).json({
                message: 'Registrasi berhasil. Harap cek email Anda untuk kode verifikasi.',
                id: insertedId,
                email: email,
            });
        } else {
            res.status(400).json({ message: 'Data user tidak valid' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verifikasi email user
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Harap berikan email dan kode verifikasi.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email sudah terverifikasi.' });
        }

        if (user.verification_code !== code) {
            console.log(`[DEBUG VERIFY] GAGAL: Kode tidak cocok. Email: ${email}, Kode Masukan: ${code}, Kode DB: ${user.verification_code}`);
            return res.status(401).json({ message: 'Kode verifikasi tidak valid.' });
        }

        const now = new Date();
        const expiresDb = new Date(user.verification_code_expires_at);

        console.log(`\n--- DEBUG VERIFIKASI WAKTU ---`);
        console.log(`[DEBUG VERIFY] Email: ${email}`);
        console.log(`[DEBUG VERIFY] Waktu Sekarang (Server UTC): ${now.toISOString()}`);
        console.log(`[DEBUG VERIFY] Waktu Kadaluarsa (DB UTC): ${expiresDb.toISOString()}`);
        console.log(`[DEBUG VERIFY] Perbedaan (expiresDb - now) dalam milidetik: ${expiresDb.getTime() - now.getTime()}`);
        console.log(`[DEBUG VERIFY] Apakah Kedaluwarsa (expiresDb < now)? ${expiresDb < now}`);
        console.log(`------------------------------\n`);

        if (user.verification_code_expires_at && expiresDb < now) {
            return res.status(401).json({ message: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.' });
        }

        await pool.query(
            'UPDATE users SET is_verified = ?, verification_code = NULL, verification_code_expires_at = NULL WHERE id = ?',
            [true, user.id]
        );

        res.status(200).json({
            message: 'Email berhasil diverifikasi!',
            id: user.id,
            email: user.email,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Error saat verifikasi email:', error);
        res.status(500).json({ message: 'Server Error.' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Harap masukkan email dan password.' });
    }

    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Hanya email dengan domain @gmail.com yang diizinkan untuk login.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Email tidak terdaftar.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Password salah.' });
        }

        if (!user.is_verified) {
            return res.status(401).json({ message: 'Akun belum terverifikasi. Harap cek email Anda atau minta kode baru.' });
        }

        res.json({
            id: user.id,
            email: user.email,
            token: generateToken(user.id),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Harap masukkan email Anda.' });
    }

    // Optional: Validasi domain @gmail.com jika Anda hanya mengizinkan Gmail
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Hanya email dengan domain @gmail.com yang diizinkan.' });
    }

    try {
        const [users] = await pool.query('SELECT id, email, is_verified FROM users WHERE email = ?', [email]); // <-- Ambil is_verified
        const user = users[0];

        // --- PERUBAHAN DI SINI: Validasi Email Terdaftar dan Terverifikasi secara eksplisit ---
        if (!user) {
            return res.status(404).json({ message: 'Email tidak terdaftar.' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Akun Anda belum terverifikasi. Silakan verifikasi email Anda terlebih dahulu.' });
        }
        // -------------------------------------------------------------------------------------

        // Hasilkan token reset sandi yang aman dan acak
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // Token berlaku 1 jam
        const formattedExpires = resetTokenExpires.toISOString().slice(0, 19).replace('T', ' ');

        // Simpan token dan waktu kedaluwarsanya ke database
        await pool.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires_at = ? WHERE id = ?',
            [resetToken, formattedExpires, user.id]
        );

        // Buat URL reset sandi yang akan dikirim via email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // Menggunakan env var

        // Kirim email reset sandi
        const emailSent = await sendPasswordResetEmail(email, resetUrl);

        if (!emailSent) {
            // Jika email gagal dikirim (misal masalah SMTP), hapus token dari DB
            await pool.query('UPDATE users SET reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ?', [user.id]);
            return res.status(500).json({ message: 'Gagal mengirim email reset sandi. Silakan coba lagi nanti.' });
        }

        res.status(200).json({ message: 'Link reset sandi telah dikirim ke email Anda.' });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token dan sandi baru tidak boleh kosong.' });
    }

    // Optional: Validasi panjang password minimum
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Sandi baru harus memiliki minimal 6 karakter.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE reset_password_token = ?', [token]);
        const user = users[0];

        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah digunakan.' });
        }

        // Periksa apakah token sudah kedaluwarsa
        const now = new Date();
        const tokenExpires = new Date(user.reset_password_expires_at);

        if (tokenExpires < now) {
            // Hapus token yang sudah kedaluwarsa untuk membersihkan DB
            await pool.query('UPDATE users SET reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ?', [user.id]);
            return res.status(400).json({ message: 'Token reset sandi sudah kedaluwarsa. Silakan minta link baru.' });
        }

        // Hash sandi baru
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Perbarui sandi pengguna dan hapus/invalidasi token reset
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ?',
            [hashedNewPassword, user.id]
        );

        res.status(200).json({ message: 'Sandi berhasil diatur ulang.' });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server Error.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
};