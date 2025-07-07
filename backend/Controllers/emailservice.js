// backend/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Pastikan dotenv di-load untuk mengakses variabel lingkungan

// Konfigurasi transporter email Anda
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE_HOST,
    port: process.env.EMAIL_SERVICE_PORT,
    secure: process.env.EMAIL_SERVICE_SECURE === 'true', // true for port 465 (SSL/TLS), false for 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASSWORD,
    },
});

const sendVerificationEmail = async (toEmail, verificationCode) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // <-- GUNAKAN INI SESUAI .env ANDA
        to: toEmail,
        subject: 'Verifikasi Akun Anda - Aplikasi Pencatat Keuangan', // Subjek lebih deskriptif
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(to right, #000000, #333333, #666666); padding: 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 24px;">Verifikasi Akun Anda</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p>Halo,</p>
                        <p>Terima kasih telah mendaftar di Aplikasi Pencatat Keuangan kami. Untuk mengaktifkan akun Anda, silakan gunakan kode verifikasi berikut:</p>
                        <div style="background-color: #e0e0e0; padding: 15px 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
                            <h2 style="margin: 0; color: #000000; font-size: 32px; letter-spacing: 3px;"><b>${verificationCode}</b></h2>
                        </div>
                        <p style="font-size: 14px; color: #777;">Kode ini akan kedaluwarsa dalam waktu 15 menit.</p>
                        <p>Jika Anda tidak mendaftar ke aplikasi kami, harap abaikan email ini.</p>
                    </div>
                    <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #555;">
                        <p>&copy; ${new Date().getFullYear()} Aplikasi Pencatat Keuangan. Semua Hak Dilindungi.</p>
                        <p>Dibuat dengan ❤️ di Yogyakarta, Indonesia</p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email verifikasi berhasil dikirim ke: ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Gagal mengirim email verifikasi ke ${toEmail}:`, error);
        return false;
    }
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: toEmail,
        subject: 'Reset Sandi Akun Anda - Aplikasi Pencatat Keuangan', // Subjek lebih deskriptif
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(to right, #000000, #333333, #666666); padding: 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 24px;">Atur Ulang Sandi Anda</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p>Halo,</p>
                        <p>Anda menerima email ini karena ada permintaan untuk mengatur ulang sandi akun Anda di Aplikasi Pencatat Keuangan.</p>
                        <p>Untuk melanjutkan, silakan klik tombol di bawah ini:</p>
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background: linear-gradient(to right, #000000, #444444, #777777); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Atur Ulang Sandi
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #777;">Link ini akan kedaluwarsa dalam 1 jam untuk alasan keamanan. Jika sudah kedaluwarsa, Anda bisa meminta link baru.</p>
                        <p>Jika Anda tidak meminta reset sandi ini, abaikan email ini.</p>
                    </div>
                    <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #555;">
                        <p>&copy; ${new Date().getFullYear()} Aplikasi Pencatat Keuangan. Semua Hak Dilindungi.</p>
                        <p>Dibuat dengan ❤️ di Yogyakarta, Indonesia</p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email reset sandi berhasil dikirim ke: ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Gagal mengirim email reset sandi ke ${toEmail}:`, error);
        return false;
    }
};

const sendDebtReminderEmail = async (toEmail, debtDetails) => {
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: toEmail,
        subject: `Pengingat ${debtDetails.type === 'hutang' ? 'Hutang' : 'Piutang'} Jatuh Tempo: ${debtDetails.person_name}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(to right, #000000, #333333, #666666); padding: 20px; text-align: center; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 24px;">Pengingat Keuangan</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p>Halo,</p>
                        <p>Ini adalah pengingat dari Aplikasi Pencatat Keuangan Anda:</p>
                        <p>Anda memiliki catatan ${debtDetails.type === 'hutang' ? 'hutang' : 'piutang'} dengan ${debtDetails.person_name} yang telah jatuh tempo atau akan segera jatuh tempo.</p>
                        <ul style="list-style-type: none; padding: 0; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                            <li style="padding: 10px 15px; border-bottom: 1px solid #eee;"><strong>Pihak:</strong> ${debtDetails.person_name}</li>
                            <li style="padding: 10px 15px; border-bottom: 1px solid #eee;"><strong>Jenis:</strong> ${debtDetails.type === 'hutang' ? 'Hutang Anda' : 'Piutang Anda'}</li>
                            <li style="padding: 10px 15px; border-bottom: 1px solid #eee;"><strong>Nominal:</strong> Rp ${debtDetails.amount.toLocaleString('id-ID')}</li>
                            <li style="padding: 10px 15px;"><strong>Jatuh Tempo:</strong> ${new Date(debtDetails.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</li>
                            ${debtDetails.notes ? `<li style="padding: 10px 15px; border-top: 1px solid #eee;"><strong>Catatan:</strong> ${debtDetails.notes}</li>` : ''}
                        </ul>
                        <p>Mohon segera tindak lanjuti catatan ini.</p>
                        <p>Terima kasih atas perhatiannya.</p>
                    </div>
                    <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #555;">
                        <p>&copy; ${new Date().getFullYear()} Aplikasi Pencatat Keuangan. Semua Hak Dilindungi.</p>
                        <p>Dibuat dengan ❤️ di Yogyakarta, Indonesia</p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email pengingat hutang/piutang dikirim ke ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Gagal mengirim email pengingat ke ${toEmail}:`, error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendDebtReminderEmail,
    sendPasswordResetEmail,
};