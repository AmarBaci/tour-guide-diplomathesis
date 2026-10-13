import React from 'react';

/**
 * Reusable card with consistent shadow + hover lift.
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card hover onClick={...}>...</Card>
 *   <Card className="p-4">...</Card>
 */
export default function Card({ children, className = '', hover = false, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        rounded-2xl shadow-sm
        ${hover ? 'cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
