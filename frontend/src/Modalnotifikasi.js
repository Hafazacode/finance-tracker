import React from 'react';

const Modalnotifikasi = ({ isOpen, onClose, onConfirm, title, message, type = 'info', showCancelButton = false }) => {
  if (!isOpen) return null;

  let headerBgClass = 'bg-gray-500';
  let titleColorClass = 'text-white';
  let messageColorClass = 'text-gray-800';
  let confirmButtonBgClass = 'bg-blue-600 hover:bg-blue-700'; // Default for info/confirm

  switch (type) {
    case 'success':
      headerBgClass = 'bg-green-500';
      confirmButtonBgClass = 'bg-green-600 hover:bg-green-700';
      break;
    case 'error':
      headerBgClass = 'bg-red-500';
      confirmButtonBgClass = 'bg-red-600 hover:bg-red-700';
      messageColorClass = 'text-red-700';
      break;
    case 'warning':
      headerBgClass = 'bg-yellow-500';
      confirmButtonBgClass = 'bg-yellow-600 hover:bg-yellow-700';
      messageColorClass = 'text-yellow-800';
      break;
    case 'confirm': // New type for confirmation
      headerBgClass = 'bg-blue-500';
      confirmButtonBgClass = 'bg-blue-600 hover:bg-blue-700';
      break;
    default: // info
      // default classes are already set
      break;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        {/* Modal Header */}
        <div className={`${headerBgClass} px-6 py-3 rounded-t-lg`}>
          <h3 className={`text-lg font-semibold ${titleColorClass}`}>{title}</h3>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className={`text-sm ${messageColorClass} mb-6`}>{message}</p>
          <div className="flex justify-end space-x-3">
            {showCancelButton && (
              <button
                onClick={onClose} // Cancel button just closes the modal
                className="px-6 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 shadow"
              >
                Batal
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) {
                  onConfirm(); // Call onConfirm. The App component will now handle closing this modal.
                } else {
                  onClose(); // For simple notifications, close immediately.
                }
              }}
              className={`px-6 py-2 rounded-md font-semibold text-white ${confirmButtonBgClass} transition-colors duration-200 shadow`}
            >
              {showCancelButton ? 'Ya' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modalnotifikasi;
