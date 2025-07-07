import React, { useState } from "react";

// Komponen ini sekarang "dumb", hanya menerima data dan fungsi dari parent
const Recent = ({ transactions, type, onDelete, onEdit }) => {
  // Langsung gunakan props, tidak perlu state internal untuk 'rows'
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const displayedRows = sortedTransactions.slice(0, currentPage * rowsPerPage);
  const hasMoreRows = sortedTransactions.length > displayedRows.length;

  const thirdColumnTitle = type === 'Budget' ? 'Kategori' : 'Akun';

  return (
    <div className="mt-3 p-4 bg-none rounded shadow-md w-full bg-gray-200">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1 border-black/40 text-black/50 border-l-transparent">Nama</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Total</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">{thirdColumnTitle}</th>
            <th className="border px-2 py-1 border-black/40 text-black/50">Tanggal</th>
            <th className="border px-2 py-1 border-black/40 text-black/50 border-r-transparent">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {/* Tampilkan data langsung dari 'displayedRows' */}
          {displayedRows.map((row) => (
            <tr key={row.id}>
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black">{row.description}</td>
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                Rp {Number(row.amount).toLocaleString('id-ID')}
              </td>
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-r-black border-b-black text-black/60">
                {type === 'Budget' ? (row.category_name || '-') : (row.account_name || '-')}
              </td>
              <td className="border px-2 py-1 bg-gray-200 border-opacity-40 border-b-black text-black/60">
                {new Date(row.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </td>
              <td className="border px-2 py-1 text-center bg-gray-200 border-opacity-40 border-b-black">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => onEdit(row)}
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  className="ml-2 text-sm text-red-600 hover:underline"
                  onClick={() => onDelete(row.id)}
                  title="Hapus"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}

          {/* Tombol Tambah yang sudah fungsional */}
          <tr>
            <td colSpan="5" className="border px-2 text-left border-b-black/40">
                <button
                    onClick={() => onEdit({ type: type === 'Budget' ? 'expense' : 'income' })}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                    + Tambah {type === 'Budget' ? 'Pengeluaran' : 'Pendapatan'}
                </button>
            </td>
          </tr>
          
          {/* Tombol Tampilkan Lebih Banyak */}
          {hasMoreRows && (
            <tr>
              <td colSpan="5" className="text-center py-2">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="text-gray-500 hover:text-gray-800 text-xs"
                >
                  Tampilkan Lebih Banyak
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recent;