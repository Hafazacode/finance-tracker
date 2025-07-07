const pool = require('../db');

// getTransactions tidak berubah, sudah benar.
const getTransactions = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id, t.description, t.amount, t.transaction_date, t.type, t.account_id,
        a.name as account_name,
        c.name as category_name,
        c.id as category_id
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id -- PERBAIKAN: Ubah dari JOIN menjadi LEFT JOIN
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `;
    const [transactions] = await pool.query(query, [req.user.id]);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// createTransaction tidak berubah, sudah benar.
const createTransaction = async (req, res) => {
  // PENTING: account_id sekarang opsional!
  const { account_id, category_id, type, amount, description, transaction_date } = req.body;
  const transactionAmount = parseFloat(amount);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (type === 'expense' && category_id) {
      // --- LOGIKA BARU: PENGELUARAN DARI AMPLOP BUDGET ---
      const txDate = new Date(transaction_date);
      const year = txDate.getFullYear();
      const month = txDate.getMonth() + 1;

      // 1. Kurangi saldo dari amplop budget, dan pastikan saldo cukup
      const [updateResult] = await connection.query(
        'UPDATE budgets SET balance = balance - ? WHERE user_id = ? AND category_id = ? AND year = ? AND month = ? AND balance >= ?',
        [transactionAmount, req.user.id, category_id, year, month, transactionAmount]
      );
      if (updateResult.affectedRows === 0) {
        throw new Error('Bulan dan tahun tidak sesuai');
      }
      
      // 2. Masukkan transaksi (account_id sekarang NULL karena dari amplop)
      await connection.query(
        'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, null, category_id, type, amount, description, transaction_date]
      );
    } else if (type === 'income') {
      // --- LOGIKA LAMA: PEMASUKAN KE AKUN RIIL ---
      if (!account_id) {
        throw new Error('Pemasukan harus memilih akun tujuan.');
      }
      // Masukkan transaksi
      await connection.query(
        'INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, account_id, null, type, amount, description, transaction_date]
      );
      // Tambah saldo akun
      await connection.query(
        'UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
        [transactionAmount, account_id, req.user.id]
      );
    } else {
      throw new Error("Jenis transaksi tidak valid.");
    }

    await connection.commit();
    res.status(201).json({ message: 'Transaksi berhasil disimpan' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(400).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================================
// ===== FUNGSI UPDATE BARU YANG SUDAH DIPERBAIKI DAN AMAN =====
// =====================================================================
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { category_id, amount, description, transaction_date } = req.body;
  const newAmount = parseFloat(amount);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data transaksi lama untuk tahu tipenya (income/expense)
    const [oldTransactions] = await connection.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (oldTransactions.length === 0) {
      throw new Error('Transaksi tidak ditemukan.');
    }
    const oldTx = oldTransactions[0];
    const oldAmount = parseFloat(oldTx.amount);
    
    // ==================================================
    // 2. KEMBALIKAN DULU DAMPAK DARI TRANSAKSI LAMA
    // ==================================================
    if (oldTx.type === 'expense' && oldTx.category_id) {
      // Jika expense, kembalikan uangnya ke amplop budget lama
      await connection.query(
        'UPDATE budgets SET balance = balance + ? WHERE user_id = ? AND category_id = ? AND YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?',
        [oldAmount, req.user.id, oldTx.category_id, new Date(oldTx.transaction_date).getFullYear(), new Date(oldTx.transaction_date).getMonth() + 1]
      );
    } else if (oldTx.type === 'income' && oldTx.account_id) {
      // Jika income, kurangi uangnya dari akun riil lama
      await connection.query(
        'UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?',
        [oldAmount, oldTx.account_id, req.user.id]
      );
    }

    // ==================================================
    // 3. TERAPKAN DAMPAK DARI TRANSAKSI BARU
    // ==================================================
    if (oldTx.type === 'expense' && category_id) {
      const txDate = new Date(transaction_date);
      const year = txDate.getFullYear();
      const month = txDate.getMonth() + 1;
      
      // Ambil uang dari amplop budget baru
      const [updateResult] = await connection.query(
        'UPDATE budgets SET balance = balance - ? WHERE user_id = ? AND category_id = ? AND year = ? AND month = ? AND balance >= ?',
        [newAmount, req.user.id, category_id, year, month, newAmount]
      );
      if (updateResult.affectedRows === 0) {
        throw new Error('Sisa saldo pada budget tujuan tidak mencukupi.');
      }
    } else if (oldTx.type === 'income' && oldTx.account_id) {
      // Tambahkan uang ke akun riil baru (jika akun diubah saat edit)
      // Catatan: logika edit untuk income tidak menyertakan perubahan akun saat ini, tapi ini untuk masa depan.
      await connection.query(
        'UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
        [newAmount, oldTx.account_id, req.user.id]
      );
    }
    
    // 4. Terakhir, update data di tabel transactions itu sendiri
    await connection.query(
      'UPDATE transactions SET category_id = ?, amount = ?, description = ?, transaction_date = ? WHERE id = ?',
      [category_id || null, amount, description, transaction_date, id]
    );

    await connection.commit();
    res.json({ message: 'Transaksi berhasil diupdate' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(400).json({ message: error.message || 'Server Error saat update transaksi' });
  } finally {
    if (connection) connection.release();
  }
};

// =====================================================================
// ===== FUNGSI DELETE BARU YANG SUDAH DIPERBAIKI DAN AMAN =====
// =====================================================================
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data transaksi yang akan dihapus
    const [transactionsToDelete] = await connection.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (transactionsToDelete.length === 0) {
      throw new Error('Transaksi tidak ditemukan');
    }
    const txToDelete = transactionsToDelete[0];
    const amountToDelete = parseFloat(txToDelete.amount);

    // 2. Kembalikan saldo berdasarkan tipe transaksi
    if (txToDelete.type === 'expense' && txToDelete.category_id) {
        // Jika expense, kembalikan uangnya ke amplop budget
        const txDate = new Date(txToDelete.transaction_date);
        const year = txDate.getFullYear();
        const month = txDate.getMonth() + 1;
        await connection.query(
            'UPDATE budgets SET balance = balance + ? WHERE user_id = ? AND category_id = ? AND year = ? AND month = ?',
            [amountToDelete, req.user.id, txToDelete.category_id, year, month]
        );
    } else if (txToDelete.type === 'income' && txToDelete.account_id) {
        // Jika income, kurangi uangnya dari akun riil
        await connection.query(
            'UPDATE accounts SET balance = balance - ? WHERE id = ?',
            [amountToDelete, txToDelete.account_id]
        );
    }
    
    // 3. Hapus transaksi dari tabel transactions
    await connection.query('DELETE FROM transactions WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Transaksi berhasil dihapus' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(400).json({ message: error.message || 'Server Error saat menghapus transaksi' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
