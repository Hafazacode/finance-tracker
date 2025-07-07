import React, { useState, useEffect, useMemo, useCallback  } from 'react';

const ModalTransaksi = ({ isOpen, onClose, onSave, initialData = null, budgets = [], accounts = []  }) => {
  const [formData, setFormData] = useState({
    description: '', amount: '', transaction_date: new Date().toISOString().slice(0, 10),
    category_id: '', account_id: '', type: 'expense',
  });
  const [error, setError] = useState('');
  const [sisaBudget, setSisaBudget] = useState(null);
  const [isSaveDisabled, setSaveDisabled] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = budgets.reduce((acc, b) => {
        if (b.category_id) { // Hanya proses jika ada kategori
            acc[b.category_id] = { id: b.category_id, name: b.category_name };
        }
        return acc;
    }, {});
    return Object.values(uniqueCategories);
  }, [budgets]);

  const checkBudget = useCallback((kategoriId, jumlahTransaksi) => {
    if (!kategoriId) {
        setSisaBudget(null);
        setSaveDisabled(false);
        return;
    }

    const budgetInfo = budgets.find(b => b.category_id === Number(kategoriId));
    
    // Untuk Model B, sisa budget adalah 'balance' dari amplop.
    const sisaDiAmplop = budgetInfo ? parseFloat(budgetInfo.balance || 0) : 0;
    
    // Saat mode edit, kita harus menambahkan kembali nominal lama dari transaksi ini ke sisa budget
    const originalAmount = (initialData && initialData.id === formData.id) ? parseFloat(initialData.amount || 0) : 0;
    
    const sisaAktualUntukValidasi = sisaDiAmplop + originalAmount;

    setSisaBudget(sisaAktualUntukValidasi);
    setSaveDisabled(parseFloat(jumlahTransaksi || 0) > sisaAktualUntukValidasi);

  }, [budgets, initialData, formData.id]);


  useEffect(() => {
    if (isOpen) {
      const isEdit = initialData?.id;
      const data = isEdit ? initialData : {
        description: '', amount: '', transaction_date: new Date().toISOString().slice(0, 10),
        category_id: '', account_id: '', type: initialData?.type || 'expense',
      };
      
      setFormData({
        ...data,
        account_id: data.account_id || (accounts.length === 1 ? accounts[0].id : ''),
        transaction_date: data.transaction_date ? new Date(data.transaction_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      });

      if (data.type === 'expense') {
        checkBudget(data.category_id, data.amount);
      } else {
        setSisaBudget(null);
        setSaveDisabled(false);
      }
      setError('');
    }
  }, [initialData, isOpen, checkBudget,accounts]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (newFormData.type === 'expense') {
      const katId = name === 'category_id' ? value : newFormData.category_id;
      const jumlah = name === 'amount' ? value : newFormData.amount;
      checkBudget(katId, jumlah);
    } else {
      setSisaBudget(null);
      setSaveDisabled(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.type === 'income' && !formData.account_id) {
        setError("Pemasukan wajib memilih akun tujuan.");
        return;
    }
    if (formData.type === 'expense' && !formData.category_id) {
        setError("Pengeluaran wajib memilih kategori.");
        return;
    }
    setError('');
    onSave({ ...formData, id: initialData?.id });
  };

  if (!isOpen) return null;
  
  const modalTitle = `${initialData?.id ? 'Edit' : 'Tambah'} ${formData.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{modalTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {sisaBudget !== null && (
                <p className={`text-sm mt-1 ${sisaBudget < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  Sisa budget bulan ini: Rp {sisaBudget.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}
           {formData.type === 'income' && (
              <div>
                <label>Masukkan ke Akun</label>
                <select name="account_id" value={formData.account_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">Pilih Akun</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" className="bg-gray-200 px-4 py-2 rounded-md" onClick={onClose}>Batal</button>
            <button type="submit" disabled={isSaveDisabled} className={`px-4 py-2 rounded-md text-white ${isSaveDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTransaksi;
