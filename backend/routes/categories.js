const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../Controllers/categoryController.js');
const { protect } = require('../middleware/auth.js');

router.route('/').get(protect, getCategories).post(protect, createCategory);
router.route('/:id').put(protect, updateCategory).delete(protect, deleteCategory);

module.exports = router;
