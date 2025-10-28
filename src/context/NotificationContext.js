'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import LoadingModal from '@/components/LoadingModal';
import Toast from '@/components/Toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [loading, setLoading] = useState({ visible: false, message: '' });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showLoading = useCallback((message = 'กำลังประมวลผล...') => {
    setLoading({ visible: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({ visible: false, message: '' });
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: '', type: 'info' });
  }, []);

  return (
    <NotificationContext.Provider value={{ showLoading, hideLoading, showToast }}>
      {children}
      {loading.visible && <LoadingModal message={loading.message} />}
      {toast.visible && <Toast message={toast.message} type={toast.type} onDismiss={hideToast} />}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
