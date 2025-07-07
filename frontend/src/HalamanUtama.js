import ModalAddMonth from "./ModalAddMonth";
import React, { useEffect, useState, useCallback } from "react";
import Recent from './RecentTransaction';
import FilterTransaksi from './FilterTransaksi';
import ChartKeuangan from './ChartKeuangan';
import ModalTransaksi from './ModalTransaksi';
import ModalKategori from './ModalKategori';
import ModalAkun from './ModalAkun';
import { useNavigate } from 'react-router-dom';
import DropdownAksi from "./DropdownButton";
import Modalnotifikasi from './Modalnotifikasi'; // Import the new modal component

import {
  getTransactions,
  getBudgets,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory,
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount
} from './apiservice';

function App() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [budgetsByMonth, setBudgetsByMonth] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [pendapatan, setPendapatan] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalAddMonthOpen, setIsModalAddMonthOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Terkini");
  const [selectedTabPendapatan, setSelectedTabPendapatan] = useState("Terkini");
  const [categoryModalMode, setCategoryModalMode] = useState('add');

  // State for Modalnotifikasi (for general notifications)
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title, message, type = 'info') => {
    setNotificationModal({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotificationModal({ ...notificationModal, isOpen: false });
  };

  // State for Confirmation Modal (using Modalnotifikasi with type 'confirm')
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}, // Function to call on confirmation
    type: 'confirm',
    showCancelButton: true
  });

  const showConfirmation = (title, message, onConfirmAction) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirmAction,
      type: 'confirm',
      showCancelButton: true
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  };


  const [selectedMonth, setSelectedMonth] = useState(() => {
    const savedMonth = localStorage.getItem('selectedMonth');
    if (savedMonth) {
      if (/^\d{4}-\d{2}$/.test(savedMonth)) {
        return savedMonth;
      }
    }
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [availableMonths, setAvailableMonths] = useState(() => {
    const savedMonths = localStorage.getItem('availableMonths');
    if (savedMonths) {
      try {
        const parsedMonths = JSON.parse(savedMonths);
        if (Array.isArray(parsedMonths) && parsedMonths.every(m => typeof m === 'string' && /^\d{4}-\d{2}$/.test(m))) {
          const d = new Date();
          const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return [...new Set([...parsedMonths, currentMonth])].sort();
        }
      } catch (e) {
        console.error("Failed to parse availableMonths from localStorage", e);
      }
    }
    const d = new Date();
    return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`];
  });

  useEffect(() => {
    localStorage.setItem('selectedMonth', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('availableMonths', JSON.stringify(availableMonths));
  }, [availableMonths]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    console.log("[FRONTEND] Starting fetchData...");
    try {
      const [year, month] = selectedMonth.split('-');

      console.log("[FRONTEND] Calling getAccounts()...");
      const accountData = await getAccounts();
      console.log("[FRONTEND] Fetched Accounts (from API):", accountData);
      setAccounts(accountData);
      console.log("[FRONTEND] accounts state updated.");

      // getBudgets sekarang mengembalikan alokasi juga
      const budgetDataRaw = await getBudgets(year, month);
      const transactionData = await getTransactions();

      const budgetDataFiltered = budgetDataRaw.filter(item =>
        (parseFloat(item.amount) > 0 || parseFloat(item.used) > 0)
      );

      setBudgetsByMonth(prev => {
        const updatedBudgets = {
          ...prev,
          [selectedMonth]: budgetDataFiltered
        };
        console.log(`[FRONTEND] Budgets for ${selectedMonth} (filtered):`, budgetDataFiltered);
        return updatedBudgets;
      });

      const expenseTxs = transactionData.filter(tx => tx.type === 'expense');
      const incomeTxs = transactionData.filter(tx => tx.type === 'income');
      setTransactions(expenseTxs);
      setPendapatan(incomeTxs);

      if (budgetDataFiltered.length === 0) {
        setCategories([]);
        console.log(`[FRONTEND] No active budgets found for ${selectedMonth}, setting categories to empty.`);
      } else {
        const uniqueCategories = {};
        budgetDataFiltered.forEach(budget => {
          if (!uniqueCategories[budget.category_id]) {
            uniqueCategories[budget.category_id] = {
              id: budget.category_id,
              name: budget.category_name,
            };
          }
        });
        const categoriesForDisplay = Object.values(uniqueCategories);
        setCategories(categoriesForDisplay);
        console.log(`[FRONTEND] Active Categories for ${selectedMonth} derived from filtered budgets:`, categoriesForDisplay);
      }

    } catch (error) {
      console.error("[FRONTEND] Gagal mengambil data:", error);
      showNotification("Error", "Gagal mengambil data: " + error.message, "error");
    } finally {
      setIsLoading(false);
      console.log("[FRONTEND] fetchData finished.");
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMonth = async (newMonth) => {
    console.log("[FRONTEND] Memulai penambahan bulan baru:", newMonth);
    if (availableMonths.includes(newMonth)) {
      showNotification("Peringatan", "Maaf, bulan sudah ada!", "warning");
      return;
    }

    try {
      setSelectedMonth(newMonth);
      console.log("[FRONTEND] SelectedMonth diatur ke:", newMonth);
      setIsModalAddMonthOpen(false);

      setAvailableMonths(prevMonths => {
        const updated = [...new Set([...prevMonths, newMonth])].sort((a, b) => new Date(a) - new Date(b));
        return updated;
      });

      showNotification("Berhasil", "Bulan baru berhasil ditambahkan! Anda bisa mulai menambahkan kategori dan budget untuk bulan ini.", "success");

    } catch (error) {
      console.error("[FRONTEND] Gagal menambah bulan:", error);
      showNotification("Error", "Terjadi kesalahan saat menambah bulan baru: " + error.message, "error");
    }
  };


  const handleDeleteTransaction = async (transactionId) => {
    showConfirmation(
      "Konfirmasi Hapus",
      "Anda yakin ingin menghapus transaksi ini?",
      async () => { // Ini adalah onConfirmAction
        try {
          await deleteTransaction(transactionId);
          fetchData();
          showNotification("Berhasil", 'Transaksi berhasil dihapus.', "success");
        } catch (error) {
          console.error("[FRONTEND] Gagal menghapus transaksi:", error);
          showNotification("Error", error.message, "error");
        } finally {
          closeConfirmation(); // <--- TAMBAHKAN INI: Tutup modal konfirmasi setelah aksi selesai
        }
      }
    );
  };

  const handleHapusKategori = async (categoryId) => {
    showConfirmation(
      "Konfirmasi Hapus Kategori",
      "Yakin ingin menghapus kategori ini? Ini akan menghapus kategori dari semua bulan dan mengembalikan sisa budget ke akun asalnya secara proporsional.",
      async () => { // Ini adalah onConfirmAction
        try {
          console.log(`[FRONTEND] Menghapus kategori dengan ID: ${categoryId}`);
          await deleteCategory(categoryId);
          fetchData();
          showNotification("Berhasil", 'Kategori berhasil dihapus dari semua bulan. Sisa dana budget telah dikembalikan ke akun asalnya.', "success");
        } catch (error) {
          console.error("[FRONTEND] Gagal hapus kategori:", error);
          showNotification("Error", error.message, "error");
        } finally {
          closeConfirmation(); // <--- TAMBAHKAN INI: Tutup modal konfirmasi setelah aksi selesai
        }
      }
    );
  };

  const handleOpenEditTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    try {
      if (data.id) {
        const { type, ...updateData } = data;
        await updateTransaction(data.id, updateData);
      } else {
        await createTransaction(data);
      }
      setTransactionModalOpen(false);
      fetchData();
      showNotification("Berhasil", 'Transaksi berhasil disimpan!', "success");
    } catch (error) {
      console.error('[FRONTEND] Gagal menyimpan transaksi:', error);
      showNotification("Error", error.message, "error");
    }
  };

  const handleOpenAddCategoryModal = () => {
    setCategoryModalMode('add');
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = async (category) => {
    console.log('[DEBUG] Category data received:', category); // Tambahkan ini untuk debugging

    if (!category || !category.category_id) {
      console.error('Invalid category data:', category);
      showNotification("Error", 'Data kategori tidak valid', "error");
      return;
    }

    setCategoryModalMode('edit');
    setSelectedCategory({
      id: category.category_id, // Pastikan menggunakan category_id
      name: category.category_name
    });
    setCategoryModalOpen(true);
  };

  const handleCategoryModalSave = async (data) => {
    try {
      const [year, month] = selectedMonth.split('-');

      if (categoryModalMode === 'add') {
        const payload = {
          name: data.name,
          total_amount: data.total_amount,
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          allocations: data.allocations
        };
        console.log(`[FRONTEND] Mengirim payload ke createCategory:`, payload);
        await createCategory(payload);
        showNotification("Berhasil", 'Kategori baru berhasil ditambahkan!', "success");

      } else if (categoryModalMode === 'edit') {
        if (!data.id) {
          throw new Error('ID kategori tidak valid');
        }

        const updatePayload = {
          name: data.name
        };

        console.log(`[DEBUG] Updating category with ID: ${data.id}`);
        await updateCategory(data.id, updatePayload);
        showNotification("Berhasil", 'Nama kategori berhasil diupdate!', "success");
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('[FRONTEND] Gagal menyimpan kategori:', error);
      showNotification("Error", error.message, "error");
    }
  };

  const [isAccountModalOpen, setAccountModalOpen] = useState(false);

  const handleOpenAddAccountModal = () => setAccountModalOpen(true);

  const handleSaveAccount = async (data) => {
    try {
      if (data.id) {
        await updateAccount(data.id, data);
      } else {
        await createAccount(data);
      }
      setAccountModalOpen(false);
      fetchData();
      showNotification("Berhasil", 'Akun berhasil disimpan!', "success");
    } catch (error) {
      showNotification("Error", error.message, "error");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    showConfirmation(
      "Konfirmasi Hapus Akun",
      "Yakin ingin menghapus akun ini? Semua transaksi terkait akan ikut terhapus dan aksi ini tidak bisa dibatalkan.",
      async () => { // Ini adalah onConfirmAction
        try {
          await deleteAccount(accountId);
          fetchData();
          showNotification("Berhasil", 'Akun berhasil dihapus.', "success");
        } catch (error) {
          showNotification("Error", error.message, "error");
        } finally {
          closeConfirmation(); // <--- TAMBAHKAN INI: Tutup modal konfirmasi setelah aksi selesai
        }
      }
    );
  };

  const handleOpenEditAccountModal = (account) => {
    setSelectedAccount(account);
    setAccountModalOpen(true);
  };

  const handleLogout = () => {
      localStorage.removeItem('userToken');
      navigate('/');
  };

  const CircularProgress = ({ percentage }) => {
      const pct = Number(percentage);
      const radius = 20;
      const stroke = 4;
      const normalized = radius - stroke / 2;
      const circumference = 2 * Math.PI * normalized;

      const clamped = Math.min(pct, 100);
      const offset = circumference * (1 - clamped / 100);

      const color =
        pct > 99 ? 'stroke-red-500'
        : pct > 50 ? 'stroke-yellow-400'
        : pct > 0 ? 'stroke-green-400'
        : 'stroke-transparent';

      return (
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <circle
            className="stroke-gray-200"
            strokeWidth={stroke}
            fill="transparent"
            r={normalized}
            cx="24"
            cy="24"
          />
          <circle
            className={`transition-all duration-300 ${color}`}
            strokeWidth={stroke}
            fill="transparent"
            r={normalized}
            cx="24"
            cy="24"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
      );
  };

  function formatMonth(monthStr) {
    const [year, month] = monthStr.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-700 text-lg">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col items-start justify-center min-h-screen bg-gray-200 font-sans">
      <div className="w-full bg-gray-700 shadow-md text-center py-9 md:py-32 lg:py-32 relative"> {/* Added relative for absolute positioning of logout */}
        <h1 className="font-semibold text-white mb-4 text-4xl md:text-6xl lg:text-7xl">
          DuitKu
        </h1>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200 ease-in-out"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center mt-5">
        <div className="inline-flex rounded-full overflow-hidden shadow-md border border-gray-500">
          <button
            className="bg-gray-500 text-white px-6 py-2 text-sm md:text-base font-medium rounded-l-full"
          >
            Transaksi
          </button>
          <button
            onClick={() => navigate("/hutang")}
            className="bg-white text-gray-500 hover:bg-gray-100 px-6 py-2 text-sm md:text-base font-medium rounded-r-full transition duration-200 ease-in-out"
          >
            Hutang
          </button>
        </div>
      </div>
      {/* Tampilan kolom bagian kiri */}
      <div className="py-10 px-10 flex flex-col md:flex-row bg-gray-200"> {/* Changed to flex-col for mobile, md:flex-row for larger screens */}
        <div className="flex flex-col w-full md:w-1/6 md:mr-8 mb-8 md:mb-0"> {/* Adjusted width and margin for responsiveness */}
          <div className="flex flex-col">
            <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 py-1 w-full md:w-3/4 mb-2"> {/* Adjusted width for responsiveness */}
              Kategori Bulanan
            </h1>
            <div className="mb-4 py-2">
              <label htmlFor="month-select" className="text-sm font-semibold mr-2 text-gray-700">
                Pilih Bulan:
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "add_new") {
                    setIsModalAddMonthOpen(true);
                  } else {
                    setSelectedMonth(val);
                  }
                }}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {availableMonths
                  .sort((a, b) => new Date(a) - new Date(b))
                  .map((month) => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))
                }
                <option value="add_new">+ Tambah Bulan</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3 py-1 w-full">
              {(budgetsByMonth[selectedMonth] || []).map((item) => {
                const budgetAmount = parseFloat(item.amount) || 0;
                const usedAmount = parseFloat(item.used) || 0;
                const percentage = budgetAmount > 0 ? (usedAmount / budgetAmount) * 100 : 0;
                const budgetBalance = parseFloat(item.balance) || 0;
                if (!item.category_name) return null;
                return (
                  <div
                    key={item.category_id}
                    className="w-full sm:w-1/2 md:w-full lg:w-2/3" // Adjusted width for responsiveness
                  >
                    <div className="bg-white border rounded-xl px-2 py-1 gap-1 flex flex-col w-full border-gray-300 shadow-sm">
                      <div className="flex flex-row justify-between items-center"> {/* Added justify-between and items-center */}
                        <div className="flex flex-wrap items-center">
                          <span className="text-sm font-medium text-gray-800">{item.category_name}</span>
                        </div>
                        <DropdownAksi
                          onEdit={() => handleOpenEditCategoryModal(item)}
                          onDelete={() => handleHapusKategori(item.category_id)}
                        />
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">Saldo Budget</span>
                        <p className="text-sm font-semibold text-gray-900">
                          Rp {budgetBalance.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 items-center relative w-fit group cursor-pointer">
                        <div className="text-[11px] text-gray-700">
                          {percentage.toFixed(0)}%
                        </div>
                        <CircularProgress percentage={percentage} />
                        <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2
                                bg-gray-700 text-white text-[11px] px-2 py-1 rounded-md
                                opacity-0 group-hover:opacity-100 transition-all duration-200
                                whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          Pemakaian
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* + Tambah Kategori Button - Styled */}
              <button
                onClick={handleOpenAddCategoryModal}
                className="w-full md:w-full lg:w-2/3 bg-gray-600 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:bg-gray-700 transition-colors duration-200 mt-2"
              >
                Tambah Kategori
              </button>
            </div>
          </div>
          {/*Tampilan Konten Kedua bagian kiri */}
            <h1 className="bg-gray-500 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-white px-2 py-1 w-full md:w-3/4 mt-8 mb-2"> {/* Adjusted width and margin */}
              Daftar Akun
            </h1>
            <div className="flex flex-wrap gap-3 py-1 w-full">
              {accounts.length > 0 ? (
                    accounts.map(account => {
                      console.log(`[FRONTEND Render] Account ID: ${account.id}, Name: ${account.name}, Balance: ${account.balance}`);
                      return (
                        <div key={account.id} className="w-full sm:w-1/2 md:w-full lg:w-2/3"> {/* Adjusted width for responsiveness */}
                                <div className="bg-white border rounded-xl px-2 py-2 gap-1 flex flex-col w-full border-gray-300 shadow-sm">
                                    <div className="flex flex-row justify-between items-center">
                                        <span className="text-sm font-medium text-gray-800">{account.name}</span>
                                        <DropdownAksi
                                            onEdit={() => handleOpenEditAccountModal(account)}
                                            onDelete={() => handleDeleteAccount(account.id)}
                                        />
                                    </div>
                                   <span className="text-sm font-semibold text-gray-900">
                                        Rp {Number(account.balance).toLocaleString('id-ID')}
                                   </span>
                                </div>
                        </div>
                        );
                      })
              ) : (
                      <p className="p-2 text-sm text-gray-500">Belum ada akun.</p>
              )}
              {/* + Tambah Akun Button - Styled */}
              <button
                  onClick={handleOpenAddAccountModal}
                  className="w-full md:w-full lg:w-2/3 bg-gray-600 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:bg-gray-700 transition-colors duration-200 mt-2"
              >
                Tambah Akun
              </button>
              </div>
        </div>
        {/* bagian tengah */}
        <div className="w-full md:w-3/6 px-0 md:px-2"> {/* Adjusted width and padding for responsiveness */}
          <div className="flex flex-col">
            {/* Title + Table */}
            <h1 className="bg-gray-300 rounded-md text-lg md:text-2xl lg:text-3xl font-bold text-gray-800 mx-0 md:mx-2 px-2 py-1 w-full mb-2"> {/* Adjusted width and margin */}
              Transaksi
            </h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                {["Terkini", "Harian","Bulanan","Tahunan"].map((tab) => (
                  <li key={tab} className="me-2">
                    <button
                      onClick={() => setSelectedTab(tab)}
                      className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${
                        selectedTab === tab
                          ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                          : "border-transparent"
                      } transition duration-200 ease-in-out`}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
                <button
                    onClick={() => handleOpenEditTransactionModal({ type: 'expense' })}
                    title="Tambah Pengeluaran Baru"
                    className="ml-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200 ease-in-out self-center"
                  >
                    + Tambah Transaksi
                  </button>
              </ul>
            </div>
            {/* Content berdasarkan tab */}
            {selectedTab === "Terkini" && (
              <Recent
                budgets={budgetsByMonth}
                akun={null}
                transactions={transactions}
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Harian" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Harian"}
                transactions={transactions}
                setTransactions={setTransactions}
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Bulanan" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Bulanan"}
                transactions={transactions}
                setTransactions={setTransactions}
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
            {selectedTab === "Tahunan" && (
              <FilterTransaksi
                budgets={budgetsByMonth}
                akun={null}
                tab={"Tahunan"}
                transactions={transactions}
                setTransactions={setTransactions}
                type={"Budget"}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionModal}
              />
            )}
          </div>

          {/*Tampilan kedua konten tengah*/}
          <div className="flex flex-col mt-10">
              <h1 className="bg-gray-300 rounded-md text-lg md:text-2xl lg:text-3xl font-bold text-gray-800 mx-0 md:mx-2 px-2 py-1 w-full mb-2"> {/* Adjusted width and margin */}
                Pendapatan
              </h1>
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
                  <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    {["Terkini", "Harian", "Bulanan", "Tahunan"].map((tab) => (
                      <li key={tab} className="me-2">
                      <button
                          onClick={() => setSelectedTabPendapatan(tab)}
                          className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group ${
                          selectedTabPendapatan === tab
                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                            : "border-transparent"
                          } transition duration-200 ease-in-out`}
                      >
                          {tab}
                      </button>
                      </li>
                    ))}
                        <button
                            onClick={() => handleOpenEditTransactionModal({ type: 'income' })}
                            title="Tambah Pendapatan Baru"
                            className="ml-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200 ease-in-out self-center"
                        >
                            + Tambah Pendapatan
                        </button>
                  </ul>
              </div>
              {/* Content berdasarkan tab */}
              {selectedTabPendapatan === "Terkini" && (
                  <Recent
                  budgets={null}
                  akun={null}
                  transactions={pendapatan}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionModal}
                  type={"Akun"}
                  />
              )}
              {selectedTabPendapatan === "Harian" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null}
                  tab={"Harian"}
                  transactions={pendapatan}
                  setTransactions={setPendapatan}
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionModal}
                  />
              )}
              {selectedTabPendapatan === "Bulanan" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null}
                  tab={"Bulanan"}
                  transactions={pendapatan}
                  setTransactions={setPendapatan}
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionModal}
                  />
              )}
              {selectedTabPendapatan === "Tahunan" && (
                  <FilterTransaksi
                  budgets={null}
                  akun={null}
                  tab={"Tahunan"}
                  transactions={pendapatan}
                  setTransactions={setPendapatan}
                  type={"Akun"}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionModal}
                  />
              )}
          </div>
        </div>

        {/* Bagian Kanan */}
        <div className="w-full md:w-2/6 px-0 md:px-2 mt-8 md:mt-0"> {/* Adjusted width and padding for responsiveness */}
          <div className="flex flex-col">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-gray-800 mx-0 md:mx-2 px-2 py-1 w-full mb-2"> {/* Adjusted width and margin */}
              Graph Pengeluaran
            </h1>
            <ChartKeuangan transactions={transactions} type={"expense"} />
          </div>
          <div className="flex flex-col mt-5">
            <h1 className="bg-gray-300 rounded-md text-[13px] md:text-base lg:text-lg font-bold text-gray-800 mx-0 md:mx-2 px-2 py-1 w-full mb-2"> {/* Adjusted width and margin */}
              Graph Pendapatan
            </h1>
            <ChartKeuangan transactions={pendapatan} type={"income"} />
          </div>
        </div>
      </div>

        {/* Modal */}
        <ModalAddMonth
          isOpen={isModalAddMonthOpen}
          onClose={() => setIsModalAddMonthOpen(false)}
          onAddMonth={handleAddMonth}
        />
        <ModalTransaksi
          isOpen={isTransactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
          onSave={handleSaveTransaction}
          initialData={selectedTransaction}
          budgets={budgetsByMonth[selectedMonth] || []}
          accounts={accounts}
        />
        <ModalKategori
          isOpen={isCategoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          onSave={handleCategoryModalSave}
          initialData={selectedCategory}
          accounts={accounts}
          mode={categoryModalMode}
        />
        <ModalAkun
          isOpen={isAccountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onSave={handleSaveAccount}
          initialData={selectedAccount}
        />
        <Modalnotifikasi
          isOpen={notificationModal.isOpen}
          onClose={closeNotification}
          title={notificationModal.title}
          message={notificationModal.message}
          type={notificationModal.type}
        />
        {/* Confirmation Modal (using Modalnotifikasi) */}
        <Modalnotifikasi
          isOpen={confirmationModal.isOpen}
          onClose={closeConfirmation}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          showCancelButton={confirmationModal.showCancelButton}
        />
    </div>
  );
}

export default App;
