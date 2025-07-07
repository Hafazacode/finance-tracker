// backend/scheduler.js
const cron = require('node-cron');
const pool = require('./db.js'); // Import pool koneksi database Anda
const { sendDebtReminderEmail } = require('./Controllers/emailservice.js'); // Pastikan path ini benar!
// Catatan: Saya mengubah path dari 'Controllers/emailservice.js' menjadi 'services/emailService.js'
// karena ini adalah penempatan yang lebih umum dan konsisten dengan struktur yang kita diskusikan.
// Jika emailService.js Anda berada di dalam folder 'Controllers', sesuaikan path ini.

// --- PENTING: Pastikan MySQL timezone di db.js sudah benar disetel ke UTC ---
// seperti yang kita bahas sebelumnya (pool.on('connection', ...) atau global config)

// Fungsi untuk memeriksa hutang/piutang jatuh tempo dan mengirim pengingat
const checkAndSendDebtReminders = async () => {
    console.log('Menjalankan pengecekan hutang/piutang jatuh tempo...');

    const now = new Date();
    // Dapatkan tanggal hari ini (00:00:00 UTC) dan tanggal besok (00:00:00 UTC)
    // Ini penting agar perbandingan tanggal di database akurat dan tidak terpengaruh waktu sekarang.
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const tomorrow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1));

    // Format ke string YYYY-MM-DD untuk perbandingan dengan kolom DATE di MySQL
    const todayFormatted = today.toISOString().slice(0, 10);
    const tomorrowFormatted = tomorrow.toISOString().slice(0, 10);

    try {
        // Query untuk mencari hutang/piutang yang:
        // 1. Belum lunas (status = 'belum lunas')
        // 2. Jatuh tempo TEPAT hari ini ATAU TEPAT besok
        // 3. Email pengingat belum dikirim HARI INI untuk event ini (last_reminder_sent < today 00:00:00 UTC)
        const [debts] = await pool.query(`
            SELECT d.*, u.email
            FROM debts d
            JOIN users u ON d.user_id = u.id
            WHERE d.status = 'belum lunas'
            AND (
                d.due_date = ? -- Jatuh tempo TEPAT hari ini
                OR
                d.due_date = ? -- Jatuh tempo TEPAT besok (1 hari sebelum hari H)
            )
            AND (
                d.last_reminder_sent IS NULL -- Belum pernah dikirim
                OR
                DATE(d.last_reminder_sent) < ? -- Atau terakhir dikirim sebelum hari ini (untuk mengirim ulang jika due_date = today dan pengingat yesterday)
            )
            ORDER BY d.due_date ASC;
        `, [todayFormatted, tomorrowFormatted, todayFormatted]);

        if (debts.length === 0) {
            console.log('Tidak ada hutang/piutang yang jatuh tempo hari ini atau besok yang perlu diingatkan.');
            return;
        }

        console.log(`Ditemukan ${debts.length} hutang/piutang yang perlu diingatkan.`);

        for (const debt of debts) {
            if (debt.email) {
                // Tentukan jenis pengingat (H-1 atau Hari H)
                let reminderType = '';
                if (debt.due_date.toISOString().slice(0, 10) === todayFormatted) {
                    reminderType = 'Hari Ini Jatuh Tempo';
                } else if (debt.due_date.toISOString().slice(0, 10) === tomorrowFormatted) {
                    reminderType = 'Besok Jatuh Tempo';
                }

                console.log(`Mengirim pengingat (${reminderType}) ke ${debt.email} untuk ${debt.person_name} (Jatuh tempo: ${debt.due_date})`);
                
                await sendDebtReminderEmail(debt.email, {
                    person_name: debt.person_name,
                    amount: debt.amount,
                    type: debt.type,
                    due_date: debt.due_date, // Kirim tanggal asli dari DB
                    notes: debt.notes,
                    reminderType: reminderType // Tambahkan jenis pengingat untuk pesan email
                });

                // Update kolom last_reminder_sent ke waktu UTC saat ini
                await pool.query(
                    'UPDATE debts SET last_reminder_sent = ? WHERE id = ?',
                    [now.toISOString().slice(0, 19).replace('T', ' '), debt.id]
                );
            } else {
                console.warn(`User dengan ID ${debt.user_id} tidak memiliki email atau email tidak ditemukan.`);
            }
        }
        console.log('Pengecekan dan pengiriman pengingat selesai.');

    } catch (error) {
        console.error('Error saat memeriksa hutang/piutang jatuh tempo:', error);
    }
};

// Jadwalkan fungsi untuk berjalan setiap hari pada jam tertentu (misal 08:00 pagi UTC)
// Ini adalah waktu ketika scheduler akan "bangun" dan memeriksa kondisi hutang.
// '0 8 * * *' berarti pada menit ke-0, jam ke-8, setiap hari, setiap bulan, setiap hari dalam seminggu.
cron.schedule('* * * * *', () => { // Setiap menit
    console.log('Running debt reminder check (DEBUG MODE)');
    checkAndSendDebtReminders();
}, {
    timezone: "UTC"
});

console.log('Scheduler pengingat hutang/piutang telah dimulai.');

module.exports = {
    checkAndSendDebtReminders
};