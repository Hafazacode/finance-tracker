const pool = require('../db.js');

// @desc    Get budgets for a specific month and year
// @route   GET /api/budgets?year=YYYY&month=MM
// @access  Private
const getBudgets = async (req, res) => {
  const { year, month } = req.query;
  
  // Validasi input
  if (!year || !month) {
    return res.status(400).json({ message: 'Tahun dan bulan diperlukan' });
  }

  // Pastikan year dan month adalah angka valid
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: 'Format tahun/bulan tidak valid' });
  }

  try {
    const query = `
      SELECT 
        c.id as category_id, 
        c.name as category_name,
        b.id as budget_id,
        b.amount,
        b.balance,
        (
          SELECT COALESCE(SUM(t.amount), 0) FROM transactions t 
          WHERE t.user_id = ? AND t.category_id = c.id AND t.type = 'expense' 
          AND YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ?
        ) as used
      FROM categories c
      LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ? AND b.year = ? AND b.month = ?
      WHERE c.user_id = ? OR c.user_id IS NULL
    `;
    
    const params = [
      req.user.id, 
      yearNum, 
      monthNum, 
      req.user.id, 
      yearNum, 
      monthNum, 
      req.user.id
    ];
    
    const [budgets] = await pool.query(query, params);
    res.json(budgets);

  } catch (error) {
    console.error('Error in getBudgets:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set or update a budget for a category
// @route   POST /api/budgets
// @access  Private
const allocateBudget = async (req, res) => {
  const { category_id, amount_to_add, account_id, year, month } = req.body;
  
  // Validasi input
  if (!category_id || !account_id || !year || !month) {
    return res.status(400).json({ message: 'Semua field diperlukan' });
  }

  // Konversi dan validasi angka
  const allocationAmount = parseFloat(amount_to_add);
  if (isNaN(allocationAmount) || allocationAmount <= 0) {
    return res.status(400).json({ message: 'Jumlah alokasi harus angka positif' });
  }

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: 'Format tahun/bulan tidak valid' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Kurangi saldo dari akun riil
    const [updateResult] = await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ? AND balance >= ?',
      [allocationAmount, account_id, req.user.id, allocationAmount]
    );
    
    if (updateResult.affectedRows === 0) {
      throw new Error('Saldo akun tidak mencukupi atau akun tidak ditemukan');
    }
    
    // 2. Tambahkan saldo ke amplop budget (buat jika belum ada)
    await connection.query(
      `INSERT INTO budgets (user_id, category_id, month, year, amount, balance)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)`,
      [req.user.id, category_id, monthNum, yearNum, 0, allocationAmount]
    );

    await connection.commit();
    res.status(201).json({ message: 'Dana berhasil dialokasikan ke budget' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in allocateBudget:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getBudgets,
  allocateBudget,
};