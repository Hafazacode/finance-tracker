import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartKeuangan = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 🧠 Pindahkan SEMUA hook ke atas
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      return txMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const categoryTotals = useMemo(() => {
    return filtered.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  }, [filtered]);

  const data = useMemo(() => {
    const categories = Object.keys(categoryTotals);
    const colors = ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa'];
    return {
      labels: ['Pengeluaran'],
      datasets: categories.map((category, index) => ({
        label: category,
        data: [categoryTotals[category]],
        backgroundColor: colors[index % colors.length],
      })),
    };
  }, [categoryTotals]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Laporan Keuangan (${selectedMonth})` },
    },
  }), [selectedMonth]);

  // Setelah semua hook selesai → baru lakukan conditional render
  if (filtered.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-2">
        <div className="mb-1">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-3 py-1 bg-gray-100"
          />
        </div>
        <div className="flex justify-center items-center h-10">
          <p className='text-xl text-red-700'>
            Tidak ada transaksi di bulan ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="mb-1">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-1 bg-gray-100"
        />
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ChartKeuangan;