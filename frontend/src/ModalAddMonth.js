import React, { useState } from "react";

const ModalAddMonth = ({ isOpen, onClose, onAddMonth }) => {
  const [newMonth, setNewMonth] = useState("");

  const handleAdd = () => {
    if (newMonth) {
      onAddMonth(newMonth);
      setNewMonth("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Tambah Bulan Baru</h2>
        <input
          type="month"
          value={newMonth}
          onChange={(e) => setNewMonth(e.target.value)}
          className="w-full border px-2 py-1 mb-4 rounded"
        />
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-3 py-1 rounded"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={handleAdd}
          >
            Tambahkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAddMonth;