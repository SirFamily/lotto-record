'use client';

import { useEffect } from 'react';

const toastStyles = {
  success: 'border-green-300 bg-green-50 text-green-800',
  error: 'border-red-300 bg-red-50 text-red-800',
  info: 'border-blue-300 bg-blue-50 text-blue-800',
  warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
};

export default function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-5 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 transform rounded-md border px-4 py-3 shadow-lg transition-all ${toastStyles[type]}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
