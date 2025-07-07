import React, { useState, useEffect } from 'react';

function ModalKategori({ isOpen, onClose, onSave, initialData, accounts, mode }) {
  const [name, setName] = useState('');
  const [accountAllocations, setAccountAllocations] = useState([]); // [{ account_id: '...', amount: '...' }]
  const [error, setError] = useState('');
  const [originalAccountBalances, setOriginalAccountBalances] = useState({});
  const [initialCategoryAllocations, setInitialCategoryAllocations] = useState({}); // To store original allocations for the category being edited

  // Calculate total budget in real-time from allocations
  const calculatedTotalAmount = accountAllocations.reduce((sum, alloc) => {
    const amount = parseFloat(alloc.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setName(initialData?.name || '');

      // Simpan saldo asli akun saat modal dibuka
      const initialBalances = {};
      accounts.forEach(acc => {
        initialBalances[acc.id] = acc.balance;
      });
      setOriginalAccountBalances(initialBalances);

      // Jika mode 'edit', inisialisasi accountAllocations dengan data yang ada
      if (mode === 'edit' && initialData && initialData.allocations) {
        const currentAllocations = initialData.allocations.map(alloc => ({
          account_id: alloc.account_id,
          amount: parseFloat(alloc.amount_allocated) // Pastikan formatnya sesuai
        }));
        // PENTING: Set accountAllocations di sini agar checkbox terisi
        setAccountAllocations(currentAllocations);

        // Simpan alokasi awal untuk kategori yang sedang diedit
        const categoryInitialAllocations = {};
        initialData.allocations.forEach(alloc => {
          categoryInitialAllocations[alloc.account_id] = parseFloat(alloc.amount_allocated);
        });
        setInitialCategoryAllocations(categoryInitialAllocations);
      } else { // Mode 'add'
        setAccountAllocations([]); // Reset alokasi untuk mode 'add'
        setInitialCategoryAllocations({}); // Reset untuk mode 'add'
      }
    }
  }, [isOpen, initialData, mode, accounts]);

  const handleAllocationChange = (accountId, amount) => {
    // Hanya izinkan perubahan jika mode adalah 'add'
    if (mode === 'add') {
      setAccountAllocations(prev => {
        const existingIndex = prev.findIndex(alloc => alloc.account_id === accountId);
        const newAmount = amount === '' ? '' : parseFloat(amount);

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = { account_id: accountId, amount: newAmount };
          return updated;
        } else {
          return [...prev, { account_id: accountId, amount: newAmount }];
        }
      });
    }
  };

  const handleCheckboxChange = (accountId, isChecked) => {
    // Hanya izinkan perubahan jika mode adalah 'add'
    if (mode === 'add') {
      setAccountAllocations(prev => {
        if (isChecked) {
          // Tambahkan akun jika dicentang, dengan jumlah awal dari initialData jika ada
          const existingAllocation = initialData?.allocations?.find(alloc => alloc.account_id === accountId);
          return [...prev, { account_id: accountId, amount: existingAllocation ? parseFloat(existingAllocation.amount_allocated) : '' }];
        } else {
          // Hapus akun jika tidak dicentang
          return prev.filter(alloc => alloc.account_id !== accountId);
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }

    if (mode === 'add') {
      if (accountAllocations.length === 0) {
        setError('Harap pilih setidaknya satu akun untuk alokasi dana.');
        return;
      }

      const validAllocations = [];
      for (const alloc of accountAllocations) {
        const parsedAmount = parseFloat(alloc.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          setError(`Nominal alokasi untuk akun ${accounts.find(a => a.id === alloc.account_id)?.name || alloc.account_id} tidak valid atau kosong.`);
          return;
        }

        const prevAllocationForCategory = initialCategoryAllocations[alloc.account_id] || 0;
        const effectiveAccountBalance = originalAccountBalances[alloc.account_id] + prevAllocationForCategory;

        if (parsedAmount > effectiveAccountBalance) {
          setError(`Alokasi untuk akun ${accounts.find(a => a.id === alloc.account_id)?.name} melebihi saldo yang tersedia.`);
          return;
        }

        validAllocations.push({ account_id: alloc.account_id, amount: parsedAmount });
      }

      if (calculatedTotalAmount <= 0) {
        setError('Total budget kategori harus lebih dari Rp 0.');
        return;
      }

      onSave({ name, total_amount: calculatedTotalAmount, allocations: validAllocations });

    } else if (mode === 'edit') {
      // Untuk mode 'edit', hanya kirim ID dan nama
      onSave({ id: initialData.id, name });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {mode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nama Kategori:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Conditional rendering for allocation section */}
          {mode === 'add' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Alokasi dari Akun:
                </label>
                {accounts.length > 0 ? (
                  accounts.map(account => {
                    // Periksa apakah akun ini sudah dialokasikan untuk kategori ini
                    const isAccountAllocated = accountAllocations.some(alloc => alloc.account_id === account.id);
                    // Ambil jumlah alokasi untuk akun ini
                    const allocatedAmountForThisAccount = accountAllocations.find(alloc => alloc.account_id === account.id)?.amount || '';

                    return (
                      <div key={account.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`account-${account.id}`}
                          className="mr-2"
                          checked={isAccountAllocated} // Ini yang memastikan checkbox tercentang
                          onChange={(e) => handleCheckboxChange(account.id, e.target.checked)}
                          // disabled={mode === 'edit'} // No longer needed here as the whole section is hidden
                        />
                        <label htmlFor={`account-${account.id}`} className="text-gray-700 mr-2 flex-grow">
                          {account.name}{' '}
                          (Saldo Tersedia:{' '}
                          Rp {
                            (() => {
                              const allocatedAmount = parseFloat(allocatedAmountForThisAccount);
                              const amount = isNaN(allocatedAmount) ? 0 : allocatedAmount;
                              const available = originalAccountBalances[account.id] - amount;
                              return available.toLocaleString('id-ID');
                            })()
                          })
                        </label>

                        {isAccountAllocated && (
                          <input
                            type="number"
                            className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/3"
                            value={allocatedAmountForThisAccount}
                            onChange={(e) => handleAllocationChange(account.id, e.target.value)}
                            min="0"
                            step="any"
                            placeholder="Jumlah"
                            required={isAccountAllocated} // Required only if checked in add mode
                            // disabled={mode === 'edit'} // No longer needed here
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada akun tersedia. Harap buat akun terlebih dahulu.</p>
                )}
              </div>

              <div className="mb-4 text-lg font-bold text-gray-800">
                Total Budget Kategori: Rp {calculatedTotalAmount.toLocaleString('id-ID')}
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              {mode === 'add' ? 'Tambah' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalKategori;