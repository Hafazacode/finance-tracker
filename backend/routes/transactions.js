const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../Controllers/transactionController.js');
const { protect } = require('../middleware/auth.js');

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;
