const pool = require('../db.js');

// @desc    Get all accounts for a user
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.query(
      'SELECT id, name, type, balance FROM accounts WHERE user_id = ? ORDER BY name',
      [req.user.id]
    );
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
  const { name, type, balance } = req.body;
  const user_id = req.user.id;
  const trimmedName = name.trim();

  if (!trimmedName || balance === undefined) {
    return res.status(400).json({ message: 'Nama dan saldo awal wajib diisi.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // --- VALIDASI: Cek apakah nama akun sudah ada untuk user ini ---
    const [existingAccount] = await connection.query(
      'SELECT id FROM accounts WHERE user_id = ? AND name = ?',
      [user_id, trimmedName]
    );

    if (existingAccount.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Maaf, nama akun ini sudah ada.' });
    }
    // --- AKHIR VALIDASI ---

    const [result] = await connection.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      [user_id, trimmedName, type, balance]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, name: trimmedName, type, balance });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creating account:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Update an account
// @route   PUT /api/accounts/:id
const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { name, type, balance } = req.body;
  const user_id = req.user.id;
  const trimmedName = name.trim();

  if (!trimmedName || balance === undefined) {
    return res.status(400).json({ message: 'Nama dan saldo wajib diisi.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // --- VALIDASI: Cek apakah nama akun sudah ada untuk user ini,
    // --- TETAPI BUKAN UNTUK AKUN YANG SEDANG DIEDIT ITU SENDIRI ---
    const [existingAccount] = await connection.query(
      'SELECT id FROM accounts WHERE user_id = ? AND name = ? AND id != ?',
      [user_id, trimmedName, id]
    );

    if (existingAccount.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Maaf, nama akun ini sudah digunakan oleh akun lain.' });
    }
    // --- AKHIR VALIDASI ---

    const [result] = await connection.query(
      'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      [trimmedName, type, balance, id, user_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Akun tidak ditemukan atau Anda tidak memiliki izin untuk mengedit.' });
    }

    await connection.commit();
    res.json({ message: 'Akun berhasil diupdate' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating account:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Delete an account
// @route   DELETE /api/accounts/:id
const deleteAccount = async (req, res) => {
  const { id: account_id } = req.params;
  const user_id = req.user.id;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Periksa apakah akun digunakan dalam transaksi (pendapatan atau pengeluaran)
    const [transactionRefs] = await connection.query(
      'SELECT COUNT(*) as count FROM transactions WHERE account_id = ? AND user_id = ?',
      [account_id, user_id]
    );

    if (transactionRefs[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Tidak bisa menghapus akun karena masih memiliki riwayat pendapatan. Harap hapus pendapatan terkait terlebih dahulu.' });
    }

    // 2. Periksa apakah akun digunakan dalam alokasi budget
    const [budgetAllocations] = await connection.query(
      `SELECT
          c.name AS category_name,
          b.month,
          b.year,
          b.balance AS budget_balance
       FROM budget_accounts ba
       JOIN budgets b ON ba.budget_id = b.id
       JOIN categories c ON b.category_id = c.id
       WHERE ba.account_id = ? AND b.user_id = ?`,
      [account_id, user_id]
    );

    if (budgetAllocations.length > 0) {
      await connection.rollback();
      const messageParts = budgetAllocations.map(alloc => {
        const monthNames = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const formattedMonth = monthNames[alloc.month - 1];
        const balance = Number(alloc.budget_balance).toLocaleString('id-ID');
        return `Kategori: ${alloc.category_name}, Bulan: ${formattedMonth} ${alloc.year}, Saldo: Rp ${balance}`;
      });
      return res.status(400).json({
        message: `Tidak bisa menghapus akun karena masih digunakan dalam alokasi budget:\n- ${messageParts.join('\n- ')}`
      });
    }

    // 3. Jika tidak ada transaksi atau alokasi budget, hapus akun
    const [result] = await connection.query(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [account_id, user_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Akun tidak ditemukan atau Anda tidak memiliki izin untuk menghapus.' });
    }

    await connection.commit();
    res.json({ message: 'Akun berhasil dihapus.' });

  } catch (error) {
    if (connection) await connection.rollback();
    // Catch specific MySQL error for foreign key constraint if it somehow bypasses the checks
    // Pesan ini akan muncul jika ada foreign key constraint lain yang tidak secara eksplisit dicek di atas.
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        return res.status(400).json({ message: 'Tidak bisa menghapus akun karena masih terhubung dengan data lain. Harap pastikan semua data terkait sudah dihapus.' });
    }
    console.error("Error deleting account:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};