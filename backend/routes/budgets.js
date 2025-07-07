const express = require('express');
const router = express.Router();
const { getBudgets, allocateBudget } = require('../Controllers/budgetController.js');
const { protect } = require('../middleware/auth.js');

router.route('/').get(protect, getBudgets).post(protect, allocateBudget);

module.exports = router;
