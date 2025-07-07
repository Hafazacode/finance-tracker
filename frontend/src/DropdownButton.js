import React, { useState, useRef, useEffect } from "react";

const DropdownAksi = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-1/6 flex justify-end items-start" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 text-lg p-0 m-0 leading-none font-bold"
      >
        &#8230; {/* Tiga titik */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-6 bg-white border rounded shadow-lg z-10 w-24">
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-1 text-gray-700 hover:bg-gray-100 text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-1 text-red-600 hover:bg-gray-100 text-xs"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownAksi;