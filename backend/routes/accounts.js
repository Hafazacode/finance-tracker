// backend/routes/accounts.js

const express = require('express');
const router = express.Router();
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../Controllers/accountController');

// Rute ini sudah otomatis terproteksi jika kita terapkan 'protect' di server.js
router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').put(updateAccount).delete(deleteAccount);
module.exports = router;