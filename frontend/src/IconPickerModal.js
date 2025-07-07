import React from "react";

const icons = [
  "/icons/shopping-cart.png",
  "/icons/burger.png",
  "/icons/restaurant.png",
  "/icons/hamburger-soda.png",

];

const IconPickerModal = ({ isOpen, onSelect, onClose }) => {
  //if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Pilih Icon</h3>
        <div className="grid grid-cols-4 gap-4">
          {icons.map((icon, index) => (
            <div
              key={index}
              onClick={() => onSelect(icon)}
              className="cursor-pointer hover:opacity-75"
            >
              <img src={icon} alt="icon" className="w-12 h-12 rounded-full border" />
            </div>
          ))}
          {/* Tambah Icon */}
          <div
            className="w-12 h-12 flex items-center justify-center border rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
            onClick={() => alert("Fitur upload bisa ditambahkan")}
          >
            +
          </div>
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black dark:text-white py-1 rounded">Tutup</button>
      </div>
    </div>
  );
};

export default IconPickerModal;