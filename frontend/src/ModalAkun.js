import React, { useState, useEffect } from 'react';

const ModalAkun = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0); // State untuk saldo, akan diisi dari initialData atau 0

  // Tentukan apakah ini mode edit atau tambah berdasarkan initialData
  const isEditMode = initialData !== null && initialData !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Jika mode edit, isi form dengan data yang ada
        setName(initialData.name);
        setBalance(initialData.balance); // Tampilkan saldo yang sudah ada
      } else {
        // Jika mode tambah, kosongkan nama dan set saldo ke 0
        setName('');
        setBalance(0); // Saldo awal otomatis 0 untuk akun baru
      }
    }
  }, [initialData, isOpen, isEditMode]); // Tambahkan isEditMode ke dependency array

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      // Anda bisa menambahkan notifikasi di sini jika nama kosong
      return;
    }

    // Kirim data kembali ke komponen induk
    // Untuk mode edit, gunakan ID yang ada dan saldo yang tidak berubah dari state (yang diambil dari initialData)
    // Untuk mode tambah, ID akan null dan saldo akan 0
    onSave({
      id: initialData?.id, // Akan undefined/null jika mode tambah
      name,
      balance: isEditMode ? balance : 0, // Gunakan saldo yang ada untuk edit, 0 untuk tambah
      type: 'General' // Tipe akun, bisa disesuaikan jika ada tipe lain
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        {/* Judul modal dinamis */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {isEditMode ? 'Edit Akun' : 'Tambah Akun Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700">Nama Akun (cth: Dompet, Bank BRI)</label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            {/* Input saldo: read-only dan menampilkan pesan sesuai mode */}
            <label htmlFor="account-balance" className="block text-sm font-medium text-gray-700">
              {isEditMode ? 'Saldo Saat Ini' : 'Saldo Awal'}
            </label>
            <input
              id="account-balance"
              type="text" // Menggunakan type="text" karena ini read-only dan bisa diformat
              value={isEditMode ? `Rp ${Number(balance).toLocaleString('id-ID')}` : 'Rp 0'}
              readOnly // Membuat input tidak bisa diedit
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode
                ? 'Saldo hanya dapat diubah melalui transaksi (pendapatan/pengeluaran).'
                : 'Saldo awal otomatis Rp 0 dan akan bertambah melalui pendapatan.'}
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-sm"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAkun;
