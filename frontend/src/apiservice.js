// apiservice.js
const API_URL = 'http://localhost:5000/api'; // Pastikan ini mengarah ke backend Anda

/**
 * Mengambil token otentikasi dari localStorage.
 * @returns {string | null} Token JWT jika ada, atau null.
 */
const getToken = () => localStorage.getItem('userToken');

/**
 * Fungsi utilitas untuk melakukan permintaan API.
 * Menambahkan token otentikasi ke header jika tersedia.
 * Menangani respons error dari server.
 * @param {string} endpoint - Bagian endpoint URL API (misal: '/auth/login').
 * @param {Object} options - Opsi fetch API (method, body, headers, dll.).
 * @returns {Promise<Object | null>} Data JSON dari respons atau null jika 204 No Content.
 * @throws {Error} Jika respons dari server tidak OK.
 */
const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    // Gabungkan header yang ada dengan Content-Type default
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    // Tambahkan header Authorization jika token ada
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        // Tangani error dari backend, termasuk pesan error spesifik
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan pada server');
    }

    // Jika respons 204 No Content atau tidak ada konten, kembalikan null
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return null;
    }

    // Parse respons sebagai JSON
    return response.json();
};

// --- AUTHENTICATION API CALLS ---

/**
 * Mengirim permintaan login ke backend.
 * @param {string} email - Email pengguna.
 * @param {string} password - Sandi pengguna.
 * @returns {Promise<Object>} Respons dari backend yang berisi token dan info pengguna.
 */
export const login = (email, password) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
});

/**
 * Mengirim permintaan registrasi pengguna baru ke backend.
 * @param {string} email - Email pengguna baru.
 * @param {string} password - Sandi pengguna baru.
 * @returns {Promise<Object>} Respons dari backend.
 */
export const register = (email, password) => {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Mengirim permintaan verifikasi email ke backend.
 * @param {string} email - Email yang akan diverifikasi.
 * @param {string} code - Kode verifikasi yang diterima pengguna.
 * @returns {Promise<Object>} Respons dari backend.
 */
export const verifyEmail = (email, code) => apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
});

/**
 * Mengirim permintaan ke backend untuk memulai proses reset sandi.
 * Backend akan mengirim link reset ke email yang diberikan.
 * @param {string} email - Email pengguna yang ingin mereset sandi.
 * @returns {Promise<Object>} Mengembalikan objek respons dari backend.
 */
export const forgotPassword = (email) => apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
});

/**
 * Mengirim sandi baru dan token reset ke backend untuk mengatur ulang sandi pengguna.
 * @param {string} token - Token reset sandi yang diterima dari email.
 * @param {string} newPassword - Sandi baru yang ingin diatur oleh pengguna.
 * @returns {Promise<Object>} Mengembalikan objek respons dari backend.
 */
export const resetPassword = (token, newPassword) => apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
});

// --- TRANSACTIONS API CALLS (CRUD) ---

/**
 * Mengambil daftar transaksi.
 * @returns {Promise<Array<Object>>} Array objek transaksi.
 */
export const getTransactions = () => apiFetch('/transactions');

/**
 * Membuat transaksi baru.
 * @param {Object} data - Data transaksi baru.
 * @returns {Promise<Object>} Objek transaksi yang baru dibuat.
 */
export const createTransaction = (data) => apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
});

/**
 * Memperbarui transaksi yang ada.
 * @param {number} id - ID transaksi yang akan diperbarui.
 * @param {Object} data - Data transaksi yang diperbarui.
 * @returns {Promise<Object>} Objek transaksi yang diperbarui.
 */
export const updateTransaction = (id, data) => apiFetch(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});

/**
 * Menghapus transaksi.
 * @param {number} id - ID transaksi yang akan dihapus.
 * @returns {Promise<null>} Null jika berhasil dihapus.
 */
export const deleteTransaction = (id) => apiFetch(`/transactions/${id}`, { method: 'DELETE' });

// --- CATEGORIES API CALLS (CRUD) ---

/**
 * Mengambil daftar kategori.
 * @returns {Promise<Array<Object>>} Array objek kategori.
 */
export const getCategories = () => apiFetch('/categories');

/**
 * Membuat kategori baru.
 * @param {Object} data - Data kategori baru (misal: { name, amount, account_id, month, year }).
 * @returns {Promise<Object>} Objek kategori yang baru dibuat.
 */
export const createCategory = (data) => apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
});

/**
 * Memperbarui kategori yang ada.
 * @param {number} id - ID kategori yang akan diperbarui.
 * @param {Object} data - Data kategori yang diperbarui.
 * @returns {Promise<Object>} Objek kategori yang diperbarui.
 */
export const updateCategory = (id, data) => apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});

/**
 * Menghapus kategori.
 * @param {number} id - ID kategori yang akan dihapus.
 * @returns {Promise<null>} Null jika berhasil dihapus.
 */
export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' });


// --- BUDGETS API CALLS (Read & Create/Update) ---

/**
 * Mengambil daftar anggaran untuk bulan dan tahun tertentu.
 * @param {number} year - Tahun anggaran.
 * @param {number} month - Bulan anggaran (1-12).
 * @returns {Promise<Array<Object>>} Array objek anggaran.
 */
export const getBudgets = (year, month) => apiFetch(`/budgets?year=${year}&month=${month}`);

/**
 * Mengatur atau memperbarui anggaran untuk kategori tertentu.
 * @param {Object} data - Data anggaran (misal: { user_id, category_id, month, year, amount }).
 * @returns {Promise<Object>} Objek anggaran yang dibuat/diperbarui.
 */
export const setBudget = (data) => apiFetch('/budgets', {
    method: 'POST', // Backend menggunakan POST untuk create/update anggaran
    body: JSON.stringify(data)
});


// --- ACCOUNTS API CALLS (CRUD) ---

/**
 * Memperbarui akun yang ada.
 * @param {number} id - ID akun yang akan diperbarui.
 * @param {Object} data - Data akun yang diperbarui.
 * @returns {Promise<Object>} Objek akun yang diperbarui.
 */
export const updateAccount = (id, data) => apiFetch(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });

/**
 * Menghapus akun.
 * @param {number} id - ID akun yang akan dihapus.
 * @returns {Promise<null>} Null jika berhasil dihapus.
 */
export const deleteAccount = (id) => apiFetch(`/accounts/${id}`, { method: 'DELETE' });

/**
 * Mengambil daftar akun.
 * @returns {Promise<Array<Object>>} Array objek akun.
 */
export const getAccounts = () => apiFetch('/accounts');

/**
 * Membuat akun baru.
 * @param {Object} data - Data akun baru.
 * @returns {Promise<Object>} Objek akun yang baru dibuat.
 */
export const createAccount = (data) => apiFetch('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
});

// --- DEBTS API CALLS (CRUD) ---

/**
 * Mengambil daftar hutang.
 * @returns {Promise<Array<Object>>} Array objek hutang.
 */
export const getDebts = () => apiFetch('/debts');

/**
 * Membuat hutang baru.
 * @param {Object} data - Data hutang baru.
 * @returns {Promise<Object>} Objek hutang yang baru dibuat.
 */
export const createDebt = (data) => apiFetch('/debts', {
    method: 'POST',
    body: JSON.stringify(data),
});

/**
 * Menghapus hutang.
 * @param {number} id - ID hutang yang akan dihapus.
 * @returns {Promise<null>} Null jika berhasil dihapap.
 */
export const deleteDebt = (id) => apiFetch(`/debts/${id}`, {
    method: 'DELETE',
});

/**
 * Menandai hutang sebagai sudah dibayar.
 * Menggunakan metode PATCH untuk update status parsial.
 * @param {number} id - ID hutang yang akan ditandai sebagai dibayar.
 * @returns {Promise<Object>} Objek hutang yang diperbarui.
 */
export const markDebtAsPaid = (id) => apiFetch(`/debts/${id}/status`, {
    method: 'PATCH',
});