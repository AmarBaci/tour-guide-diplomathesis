import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',    dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const STYLES = {
  success: 'bg-emerald-500 text-white',
  error:   'bg-red-500   text-white',
  info:    'bg-blue-500  text-white',
  warning: 'bg-amber-400 text-gray-900',
};

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
            animate-slide-up backdrop-blur-sm ${STYLES[t.type]}`}
        >
          <span className="font-bold text-lg leading-none mt-0.5">{ICONS[t.type]}</span>
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button
            onClick={() => onRemove(t.id)}
            className="text-current opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
