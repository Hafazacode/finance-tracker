import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDebts, createDebt, deleteDebt, markDebtAsPaid } from './apiservice';

function HalamanHutang() {
const navigate = useNavigate();

  // State untuk menampung data dari API
  const [data, setData] = useState([]);
  // State untuk form input
  const [form, setForm] = useState({
    person_name: '',
    amount: '',
    type: 'hutang', // Default ke hutang
    due_date: '',
    notes: '',
  });
  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data dari server
  const fetchDebts = useCallback(async () => {
    try {
      const debtsData = await getDebts();
      setData(debtsData);
    } catch (err) {
      setError('Gagal memuat data hutang.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk menambah data baru melalui API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDebt({
        ...form,
        amount: Number(form.amount)
      });
      // Setelah berhasil, kosongkan form dan ambil ulang data
      setForm({ person_name: '', amount: '', type: 'hutang', due_date: '', notes: '' });
      fetchDebts();
    } catch (err) {
      alert(err.message); // Tampilkan error jika ada
    }
  };

  // Fungsi untuk menandai lunas melalui API
  const handleLunas = async (id) => {
    try {
      await markDebtAsPaid(id);
      fetchDebts(); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  // Fungsi untuk menghapus data melalui API
  const handleHapus = async (id) => {
    if (window.confirm('Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteDebt(id);
        fetchDebts(); // Refresh data
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('userToken');
      navigate('/');
  };

  // Fungsi isDueSoon tidak perlu diubah
  const isDueSoon = (dateStr) => {
      // ...
  };
  
  // Tampilan loading
  if (isLoading) {
    return <div className="text-center p-10">Loading data...</div>;
  }

  return (
    <div className="flex-col items-start justify-center min-h-screen bg-gray-200 pb-20">
        <div className="w-full bg-gray-700 shadow-md text-center py-9 md:py-32 lg:py-32">
        <h1 className="font-semibold text-white mb-4 text-4xl md:text-6xl lg:text-7xl">
          DuitKu
        </h1>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center mt-5">
        <div className="inline-flex rounded-full overflow-hidden shadow-md border border-gray-500">
          <button
            onClick={() => navigate("/App")}
            className="bg-white text-gray-500 hover:bg-gray-100 px-6 py-2 text-sm md:text-base font-medium rounded-l-full"
          >
            Transaksi
          </button>
          <button
            className="bg-gray-500 text-white px-6 py-2 text-sm md:text-base font-medium rounded-r-full"
          >
            Hutang 
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-md shadow-md mt-10">
        <h1 className="text-2xl text-center font-semibold mb-6">Hutang & Piutang</h1>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" onSubmit={handleSubmit}>
          <input name="person_name" value={form.person_name} onChange={handleInputChange} type="text" placeholder="Nama Pihak" required className="p-2 border rounded" />
          <input name="amount" value={form.amount} onChange={handleInputChange} type="number" placeholder="Nominal (Rp)" required className="p-2 border rounded" />
          <select name="type" value={form.type} onChange={handleInputChange} required className="p-2 border rounded">
            {/* Ganti 'jenis' menjadi 'type' */}
            <option value="hutang">Hutang (Saya berhutang)</option>
            <option value="piutang">Piutang (Orang lain berhutang ke saya)</option>
          </select>
          <input name="due_date" value={form.due_date} onChange={handleInputChange} type="date" className="p-2 border rounded" />
          <button type="submit" className="col-span-1 md:col-span-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded">
            Tambah
          </button>
        </form>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border-b">Nama</th>
              <th className="text-left p-2 border-b">Nominal</th>
              <th className="text-left p-2 border-b">Jenis</th>
              <th className="text-left p-2 border-b">Status</th>
              <th className="text-left p-2 border-b">Jatuh Tempo</th>
              <th className="text-left p-2 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className={isDueSoon(item.due_date) && item.status === 'belum lunas' ? 'bg-yellow-100' : ''}>
                <td className="p-2 border-b">{item.person_name}</td>
                <td className="p-2 border-b">Rp {item.amount.toLocaleString()}</td>
                <td className="p-2 border-b">
                  <span className={`text-white text-xs px-2 py-1 rounded ${item.type === 'hutang' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </td>
                <td className="p-2 border-b">
                  <span
                    className={`text-white text-xs px-2 py-1 rounded ${
                      item.status === 'lunas' ? 'bg-green-500' : 'bg-yellow-400'
                    }`}
                  >
                    {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </td>
                <td className="p-2 border-b">{item.due_date ? new Date(item.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                <td className="p-2 border-b">
                  {item.status === 'belum lunas' ? (
                    <button onClick={() => handleLunas(item.id)} className="text-sm bg-green-500 text-white px-2 py-1 mr-1 rounded">Tandai Lunas</button>
                  ) : (
                    <button disabled className="text-sm bg-gray-300 text-white px-2 py-1 mr-1 rounded">Selesai</button>
                  )}
                  <button onClick={() => handleHapus(item.id)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" className="text-center p-4 text-gray-500">Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HalamanHutang;
