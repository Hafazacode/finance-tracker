// src/ChartKeuangan.js (VERSI BARU DENGAN GRAFIK VERTIKAL)

import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartKeuangan = ({ transactions, type }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 1. Filter transaksi (tidak ada perubahan di sini)
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (txMonth !== selectedMonth) return false;
      return tx.type === type;
    });
  }, [transactions, selectedMonth, type]);

  // 2. Kelompokkan total berdasarkan nama kategori (tidak ada perubahan di sini)
  const categoryTotals = useMemo(() => {
    // Jika tipe adalah PENDAPATAN, kelompokkan berdasarkan NAMA AKUN
    if (type === 'income') {
        return filtered.reduce((acc, tx) => {
            const label = tx.account_name || "Tidak Diketahui"; // Gunakan nama akun sebagai label
            acc[label] = (acc[label] || 0) + (Number(tx.amount) || 0);
            return acc;
        }, {});
    }

    // Jika tidak, berarti PENGELUARAN, kelompokkan berdasarkan NAMA KATEGORI
    return filtered.reduce((acc, tx) => {
        const label = tx.category_name || "Lain-lain";
        acc[label] = (acc[label] || 0) + (Number(tx.amount) || 0);
        return acc;
    }, {});
}, [filtered, type]);

  const data = useMemo(() => {
    // Label untuk sumbu bawah (hanya satu, misal: "Total")
    const labels = [`Laporan ${type} (${selectedMonth})`];
    
    const categoryNames = Object.keys(categoryTotals);
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return {
      labels: labels,
      // Buat satu 'dataset' untuk setiap kategori. Ini kunci untuk legenda dan warna yang berbeda.
      datasets: categoryNames.map((category, index) => ({
        label: category, // Ini akan menjadi nama di legenda (cth: "Makanan")
        data: [categoryTotals[category]], // Nilai untuk kategori ini
        backgroundColor: colors[index % colors.length], // Pilih warna secara berurutan
        borderRadius: 4,
      })),
    };
  }, [categoryTotals, type, selectedMonth]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // Tampilkan legenda
        position: 'top', // Posisi legenda di atas
      },
      title: {
        display: false, // Judul utama bisa disembunyikan
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        //stacked: true, // Tumpuk barnya jika ada beberapa data dalam satu label
      },
      y: { // Format angka di sumbu vertikal (sekarang sumbu Y)
        //stacked: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) return 'Rp ' + (value / 1000000) + 'jt';
            if (value >= 1000) return 'Rp ' + (value / 1000) + 'k';
            return 'Rp ' + value;
          }
        }
      }
    }
  }), []);
  
  const formattedTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow">
      <div className="mb-4 flex justify-between items-center">
        <p className="font-semibold text-lg text-gray-800">{`Grafik ${formattedTitle}`}</p>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-1 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative h-64"> {/* Beri tinggi yang tetap untuk canvas grafik */}
        {filtered.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className='text-sm text-gray-500'>
              Tidak ada data {type.toLowerCase()} di bulan ini.
            </p>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default ChartKeuangan;