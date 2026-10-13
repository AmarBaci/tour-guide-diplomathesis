import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible modal wrapper with backdrop blur and ESC-to-close.
 *
 * Usage:
 *   <Modal open={show} onClose={() => setShow(false)} title="Confirm Booking">
 *     ...content...
 *   </Modal>
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const overlayRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
