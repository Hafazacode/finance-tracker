const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { protect } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const transactionRoutes = require('./routes/transactions');
const debtRoutes = require('./routes/debts');
const { checkAndSendDebtReminders } = require('./scheduler.js');
// Inisialisasi Aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
app.use(express.json()); // Body parser untuk JSON

// Routes
app.get('/', (req, res) => {
  res.send('API Finance Tracker Berjalan...');
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', protect, accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', protect, debtRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
    // --- Jalankan pengecekan pengingat saat server dimulai dan jadwalkan ---
    checkAndSendDebtReminders(); // Eksekusi pertama kali saat server startup
});