// backend/routes/debts.js
const express = require('express');
const router = express.Router();
const { getDebts, createDebt, updateDebtStatus, deleteDebt } = require('../Controllers/debtController');

router.route('/')
  .get(getDebts)
  .post(createDebt);

router.route('/:id')
  .delete(deleteDebt);
  
router.route('/:id/status')
  .patch(updateDebtStatus); // Menggunakan PATCH untuk update status

module.exports = router;