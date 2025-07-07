import React, { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field";
import { Trash } from "lucide-react";


const Recent = ({ budgets, transactions, onRowsChange }) => {
  const [rows, setRows] = useState(transactions);

  const sortedTransactions = [...rows].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Menampilkan hanya baris sesuai jumlah halaman
  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const displayedRows = sortedTransactions.slice(0, currentPage * rowsPerPage);
  const hasMoreRows = sortedTransactions.length > displayedRows.length;

  const getBudgetOptions = (date) => {
  const monthKey = new Date(date).toISOString().slice(0, 7); // "YYYY-MM"
  return budgets[monthKey] || [];
};
  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
  const today = new Date().toISOString().slice(0, 10); // format yyyy-mm-dd
  const newRow = {
    id: Date.now(),
    name: "",
    amount: "",
    category: "",
    account: "",
    date: today,
  };
  setRows((prevRows) => [...prevRows, newRow]);
};
  const handleDeleteRow = (id) => {
  const updated = rows.filter((item) => item.id !== id);
  setRows(updated);
  onRowsChange(updated);
  };

  useEffect(() => {
    onRowsChange(rows);
  }, [rows, onRowsChange]); // Kirim rows setiap kali berubah

  return (
    <div className="mt-3 p-4 bg-none rounded shadow-md w-full bg-gray-200">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1 border-black/40 text-black/50 border-l-transparent">Nama Pengeluaran</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Total</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Kategori</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Akun</th>
            <th className="border px-2 py-1 border-black/40 text-black/50 border-r-transparent">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row) => (
            <tr key={row.id}>
              <td className="border p-0 bg-gray-200 border-opacity-40 border-r-black border-b-black">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleChange(row.id, "name", e.target.value)}
                  className="w-full outline-none bg-gray-200"
                />
              </td>
              <td className="border p-0 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                <div className="flex items-center w-full px-2">
                  <CurrencyInput
                    name="amount"
                    value={row.amount}
                    onValueChange={(value) => {
                      const numericValue = value ? parseInt(value.replace(/\D/g, ""), 10) : 0;
                      handleChange(row.id, "amount", numericValue);
                    }}
                    prefix="Rp. "
                    decimalsLimit={0}
                    className="w-full bg-gray-200 outline-none"
                  />
                                  </div>
              </td>
              <td className="border p-0 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                <select
                  value={row.category}
                  onChange={(e) => handleChange(row.id, "category", e.target.value)}
                  className="w-full outline-none bg-gray-200"
                >
                  <option value="">Pilih</option>
                  {getBudgetOptions(row.date).map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-0 bg-gray-200 border-opacity-40 border-r-black border-b-black">
                <input
                  type="text"
                  value={row.account}
                  onChange={(e) => handleChange(row.id, "account", e.target.value)}
                  className="w-full outline-none bg-gray-200"
                />
              </td>
              <td className="border p-0 bg-gray-200 border-opacity-40 border-b-black text-black/60">
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleChange(row.id, "date", e.target.value)}
                  className="w-full outline-none bg-gray-200"
                />
              </td>
              <td className="border">
                <button
                  className="ml-2 text-sm py-1"
                  onClick={() => handleDeleteRow(row.id)}
                  title="Hapus"
                >
                  <Trash className="w-3.5 h-3 text-black hover:text-gray-600" />
                </button>
              </td>
            </tr>
          ))}

          {hasMoreRows && (
            <tr>
              <td colSpan="5" className="border px-2 text-left">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="text-black/40 hover:text-black/80 text-sm"
                >
                  + Load More
                </button>
              </td>
            </tr>
          )}

          <tr>
            <td colSpan="5" className="border px-2 text-left border-b-black/40">
              <button
                onClick={handleAddRow}
                className="text-black/40 hover:text-black/80 text-sm"
              >
                + Tambah Baris
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Recent;