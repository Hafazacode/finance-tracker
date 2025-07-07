const pool = require('../db');

// @desc    Get all debts for a user
const getDebts = async (req, res) => {
  try {
    const [debts] = await pool.query(
      'SELECT id, person_name, type, amount, status, due_date, notes FROM debts WHERE user_id = ? ORDER BY due_date ASC',
      [req.user.id]
    );
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new debt
const createDebt = async (req, res) => {
  const { person_name, type, amount, due_date, notes } = req.body;
  if (!person_name || !type || !amount) {
    return res.status(400).json({ message: 'Nama, Jenis, dan Nominal wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO debts (user_id, person_name, type, amount, due_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, person_name, type, amount, due_date || null, notes]
    );
    res.status(201).json({ id: result.insertId, ...req.body, status: 'belum lunas' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark a debt as paid
const updateDebtStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE debts SET status = 'lunas' WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    res.json({ message: 'Status berhasil diubah menjadi lunas' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a debt
const deleteDebt = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM debts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    res.json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDebts, createDebt, updateDebtStatus, deleteDebt };