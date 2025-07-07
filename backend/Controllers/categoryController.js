const pool = require('../db.js');

// @desc    Get all categories for a user including their current budget allocations
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    // 1. Ambil semua kategori untuk user
    const [categoriesResult] = await pool.query(
      'SELECT id, name FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name',
      [req.user.id]
    );

    // 2. Ambil data budget dan alokasi untuk semua kategori yang ditemukan
    const categoryIds = categoriesResult.map(cat => cat.id);
    if (categoryIds.length === 0) {
      return res.json([]); // Tidak ada kategori, kembalikan array kosong
    }

    // Mendapatkan bulan dan tahun saat ini (atau bulan/tahun yang sedang aktif di frontend)
    // Untuk tujuan demo, kita asumsikan bulan dan tahun saat ini.
    // Anda mungkin perlu meneruskan month dan year sebagai query parameter dari frontend
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
    const currentYear = new Date().getFullYear();

    const [budgetsWithAllocations] = await pool.query(
      `SELECT
          b.category_id,
          b.id AS budget_id,
          b.amount AS total_budget_amount,
          b.balance AS current_budget_balance,
          ba.account_id,
          ba.amount_allocated
        FROM budgets b
        JOIN budget_accounts ba ON b.id = ba.budget_id
        WHERE b.category_id IN (?) AND b.user_id = ? AND b.month = ? AND b.year = ?`,
      [categoryIds, req.user.id, currentMonth, currentYear]
    );

    // 3. Gabungkan data
    const categoriesWithAllocations = categoriesResult.map(category => {
      const relatedBudgets = budgetsWithAllocations.filter(
        budget => budget.category_id === category.id
      );

      // Agregasi alokasi untuk setiap kategori
      const allocations = relatedBudgets.map(rb => ({
        account_id: rb.account_id,
        amount_allocated: rb.amount_allocated,
      }));

      // Cari total_amount (jika ada budget untuk bulan ini)
      // Kita asumsikan hanya ada satu budget per kategori per bulan/tahun
      const total_amount = relatedBudgets.length > 0 ? relatedBudgets[0].total_budget_amount : 0;
      const current_balance = relatedBudgets.length > 0 ? relatedBudgets[0].current_budget_balance : 0;


      return {
        ...category,
        total_amount: total_amount,
        current_balance: current_balance,
        // Pastikan initialData.allocations di frontend akan memiliki format ini
        allocations: allocations,
      };
    });

    res.json(categoriesWithAllocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new category with optional initial budget from multiple accounts
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name, total_amount, month, year, allocations } = req.body;
  const user_id = req.user.id;
  const trimmedName = name.trim();

  console.log('--- DEBUG createCategory (Backend) ---');
  console.log('req.user:', req.user);
  console.log('Received req.body (Payload dari Frontend):', req.body);
  console.log(`Extracted from req.body: name=${trimmedName}, total_amount=${total_amount}, month=${month}, year=${year}, allocations:`, allocations);

  if (!user_id) {
    return res.status(401).json({ message: 'Tidak terautentikasi: User ID tidak ditemukan.' });
  }

  if (!trimmedName || trimmedName === '') {
    return res.status(400).json({ message: 'Nama kategori tidak boleh kosong.' });
  }

  const totalBudgetAmount = parseFloat(total_amount);
  if (isNaN(totalBudgetAmount) || totalBudgetAmount <= 0) {
    return res.status(400).json({ message: 'Total nominal budget tidak valid.' });
  }
  if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
    return res.status(400).json({ message: 'Bulan dan tahun untuk budget tidak valid.' });
  }
  if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
    return res.status(400).json({ message: 'Alokasi akun wajib diisi.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let newCategoryId;
    // 1. Cek apakah kategori dengan nama ini sudah ada untuk user ini di tabel `categories`
    const [existingCategoryByName] = await connection.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?',
      [user_id, trimmedName]
    );

    if (existingCategoryByName.length > 0) {
      newCategoryId = existingCategoryByName[0].id;
      console.log(`Kategori '${trimmedName}' sudah ada dengan ID: ${newCategoryId}. Akan membuat budget baru untuk kategori ini.`);

      // 1b. Jika kategori sudah ada, cek apakah sudah ada budget untuk kategori ini pada bulan & tahun yang sama
      const [existingBudgetForMonth] = await connection.query(
        'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?',
        [user_id, newCategoryId, parseInt(month, 10), parseInt(year, 10)]
      );

      if (existingBudgetForMonth.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Maaf, budget untuk kategori '${trimmedName}' sudah ada untuk bulan saat ini.` });
      }
    } else {
      // 1c. Jika kategori belum ada, buat kategori baru
      const [categoryResult] = await connection.query(
        'INSERT INTO categories (user_id, name) VALUES (?, ?)',
        [user_id, trimmedName]
      );
      newCategoryId = categoryResult.insertId; // Ini adalah ID KATEGORI baru
      console.log('Kategori baru dibuat dengan ID:', newCategoryId);
    }

    // 2. Insert budget utama (dengan total_amount) untuk kategori (baik yang baru dibuat atau yang sudah ada)
    const [budgetInsertResult] = await connection.query(
      `INSERT INTO budgets (user_id, category_id, month, year, amount, balance) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, newCategoryId, parseInt(month, 10), parseInt(year, 10), totalBudgetAmount, totalBudgetAmount]
    );
    const newBudgetId = budgetInsertResult.insertId; // Ini adalah ID BUDGET yang baru dibuat!
    console.log('Budget baru dibuat dengan ID:', newBudgetId);

    // Pastikan budget berhasil dibuat dan memiliki ID
    if (!newBudgetId) {
      throw new Error('Gagal membuat entri budget utama.');
    }

    // 3. Proses alokasi dari setiap akun
    for (const allocation of allocations) {
      const allocatedAmount = parseFloat(allocation.amount);
      const account_id = allocation.account_id;

      if (isNaN(allocatedAmount) || allocatedAmount <= 0) {
        throw new Error(`Nominal alokasi untuk akun ID ${account_id} tidak valid.`);
      }
      if (!account_id) {
        throw new Error('ID akun untuk alokasi tidak valid.');
      }

      // Simpan detail alokasi ke tabel budget_accounts
      const [budgetAccountInsertResult] = await connection.query(
        'INSERT INTO budget_accounts (budget_id, account_id, amount_allocated) VALUES (?, ?, ?)',
        [newBudgetId, account_id, allocatedAmount]
      );
      console.log(`Budget_Account Insert Result for account ${account_id}:`, budgetAccountInsertResult);


      // Kurangi saldo akun
      const [updateAccountResult] = await connection.query(
        'UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ? AND balance >= ?',
        [allocatedAmount, account_id, user_id, allocatedAmount]
      );
      console.log(`Update Account Result for account ${account_id}:`, updateAccountResult);
      if (updateAccountResult.affectedRows === 0) {
        throw new Error(`Saldo akun ID ${account_id} tidak mencukupi atau akun tidak ditemukan.`);
      }
    }

    await connection.commit();
    console.log('Transaction committed successfully.');
    // Perbarui respons untuk menyertakan alokasi yang baru saja dibuat
    res.status(201).json({
      id: newCategoryId, // Mengembalikan ID kategori, bukan ID budget
      name: trimmedName,
      total_amount: totalBudgetAmount,
      allocations: allocations.map(alloc => ({ // Kembalikan format yang sama dengan yang diharapkan frontend
        account_id: alloc.account_id,
        amount_allocated: parseFloat(alloc.amount)
      }))
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Gagal menyimpan kategori atau alokasi:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Update a category (name only, as per frontend usage)
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { name } = req.body;
  const { id: category_id } = req.params;
  const user_id = req.user.id;
  const trimmedName = name.trim();

  console.log('--- DEBUG updateCategory (Backend) ---');
  console.log('Category ID to update:', category_id);
  console.log('User ID:', user_id);
  console.log('Received req.body (Payload dari Frontend):', req.body);

  if (!user_id) {
    return res.status(401).json({ message: 'Tidak terautentikasi: User ID tidak ditemukan.' });
  }
  if (!trimmedName || trimmedName === '') {
    return res.status(400).json({ message: 'Nama kategori tidak boleh kosong.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // --- VALIDASI: Cek apakah nama kategori sudah ada untuk user ini,
    // --- TETAPI BUKAN UNTUK KATEGORI YANG SEDANG DIEDIT ITU SENDIRI ---
    // Ini memastikan nama kategori unik di antara kategori lain milik user yang sama,
    // terlepas dari bulan/tahun, karena ini mengupdate tabel `categories`.
    const [existingCategory] = await connection.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? AND id != ?',
      [user_id, trimmedName, category_id]
    );

    if (existingCategory.length > 0) {
      await connection.rollback(); // Rollback any pending transaction
      return res.status(400).json({ message: 'Maaf, nama kategori ini sudah digunakan' });
    }
    // --- AKHIR VALIDASI ---

    // 1. Update nama kategori
    const [updateCategoryResult] = await connection.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [trimmedName, category_id, user_id]
    );
    if (updateCategoryResult.affectedRows === 0) {
      throw new Error('Kategori tidak ditemukan atau Anda tidak memiliki izin untuk mengedit.');
    }
    console.log('Category name updated.');

    await connection.commit();
    // Kembalikan hanya informasi yang relevan setelah update nama
    res.json({ id: category_id, name: trimmedName, message: 'Nama kategori berhasil diupdate.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating category name:', error);
    res.status(400).json({ message: error.message || 'Terjadi kesalahan server saat mengupdate kategori.' });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Delete a category, its associated budgets, and return remaining balance proportionally to original accounts
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  const { id } = req.params; // This 'id' is category_id
  const user_id = req.user.id;
  let connection;

  console.log('--- DEBUG deleteCategory (Backend) ---');
  console.log('Category ID to delete:', id);
  console.log('User ID:', user_id);

  if (!user_id) {
    return res.status(401).json({ message: 'Tidak terautentikasi: User ID tidak ditemukan.' });
  }

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Periksa apakah ada transaksi yang terkait dengan kategori ini
    const [transactionRefs] = await connection.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND user_id = ?',
      [id, user_id]
    );
    console.log('Transaction references count:', transactionRefs[0].count);
    if (transactionRefs[0].count > 0) {
      throw new Error('Tidak bisa menghapus kategori karena masih memiliki riwayat transaksi. Harap hapus transaksi terkait terlebih dahulu.');
    }

    // --- PERBAIKAN: Ambil ID budget yang sebenarnya dari tabel `budgets` menggunakan category_id ---
    // Ambil semua budget yang terkait dengan kategori ini (bisa lebih dari satu jika ada di bulan/tahun berbeda)
    const [budgetEntries] = await connection.query(
      'SELECT id, balance, amount, month, year FROM budgets WHERE category_id = ? AND user_id = ?',
      [id, user_id]
    );

    for (const budgetEntry of budgetEntries) {
      const actualBudgetId = budgetEntry.id;
      const totalRemainingBalance = parseFloat(budgetEntry.balance || 0);
      const totalInitialBudgetAmount = parseFloat(budgetEntry.amount || 0);
      const budgetMonth = budgetEntry.month;
      const budgetYear = budgetEntry.year;

      console.log(`Processing Budget ID: ${actualBudgetId} for month ${budgetMonth}/${budgetYear}`);
      console.log(`Total remaining balance: ${totalRemainingBalance}`);
      console.log(`Total initial budget amount: ${totalInitialBudgetAmount}`);


      // 3. Ambil semua alokasi awal dari budget_accounts untuk budget ini
      let originalAllocations = [];
      const [allocationsResult] = await connection.query(
        'SELECT account_id, amount_allocated FROM budget_accounts WHERE budget_id = ?',
        [actualBudgetId]
      );
      originalAllocations = allocationsResult;
      console.log('Original allocations found:', originalAllocations);

      // 4. Proses pengembalian saldo ke akun-akun asal secara proporsional
      if (totalRemainingBalance > 0 && originalAllocations.length > 0) {
        const sumOfInitialAllocatedAmounts = originalAllocations.reduce((sum, alloc) => sum + parseFloat(alloc.amount_allocated), 0);
        console.log('Sum of initial allocated amounts from budget_accounts:', sumOfInitialAllocatedAmounts);

        if (sumOfInitialAllocatedAmounts === 0) {
          console.warn('Peringatan: Total alokasi awal dari budget_accounts adalah 0. Tidak dapat mengembalikan saldo proporsional.');
        } else {
          for (const allocation of originalAllocations) {
            const accountId = allocation.account_id;
            const initialAllocated = parseFloat(allocation.amount_allocated);

            // Hitung proporsi alokasi akun ini terhadap total alokasi awal
            const proportion = initialAllocated / sumOfInitialAllocatedAmounts;
            // Hitung jumlah yang akan dikembalikan ke akun ini
            const refundAmount = proportion * totalRemainingBalance;

            console.log(`Refunding ${refundAmount} to account ID ${accountId} (Proportion: ${proportion.toFixed(2)})`);

            // Tambahkan saldo ke akun yang dipilih
            const [updateAccountResult] = await connection.query(
              'UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?',
              [refundAmount, accountId, user_id]
            );
            console.log('Update account result for ID ' + accountId + ':', updateAccountResult);
            if (updateAccountResult.affectedRows === 0) {
              console.warn(`Peringatan: Gagal mengupdate saldo akun ID ${accountId}. Akun mungkin tidak ditemukan atau bukan milik user.`);
            }
          }
        }
      } else {
        console.log('No remaining balance to return or no original allocations found for this budget entry.');
      }

      // 5. Hapus semua entri dari budget_accounts yang terkait dengan budget ini
      const [deleteBudgetAccountsResult] = await connection.query(
        'DELETE FROM budget_accounts WHERE budget_id = ?',
        [actualBudgetId]
      );
      console.log(`Deleted budget_accounts for budget ID ${actualBudgetId}: ${deleteBudgetAccountsResult.affectedRows} rows affected.`);

      // 6. Hapus entri budget utama
      const [deleteBudgetsResult] = await connection.query(
        'DELETE FROM budgets WHERE id = ? AND user_id = ?',
        [actualBudgetId, user_id]
      );
      console.log(`Deleted budget entry for budget ID ${actualBudgetId}: ${deleteBudgetsResult.affectedRows} rows affected.`);
    } // End of for...of loop for budgetEntries

    // 7. Hapus kategori itu sendiri (setelah semua budget terkait terhapus)
    const [deleteCategoryResult] = await connection.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    console.log('Deleted category affected rows:', deleteCategoryResult.affectedRows);

    // 8. Periksa apakah kategori benar-benar terhapus
    if (deleteCategoryResult.affectedRows === 0) {
      throw new Error('Kategori tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.');
    }

    // 9. Commit transaksi jika semua berhasil
    await connection.commit();
    res.json({ message: 'Kategori dan semua data budget terkait berhasil dihapus. Sisa dana telah dikembalikan ke akun asalnya secara proporsional.' });

  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    if (connection) await connection.rollback();
    console.error("Error deleting category:", error);
    res.status(400).json({ message: error.message || 'Terjadi kesalahan server saat menghapus kategori.' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};