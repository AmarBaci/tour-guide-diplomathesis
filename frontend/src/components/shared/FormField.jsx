import React from 'react';

/**
 * Reusable form field — label + input/select/textarea + error message.
 *
 * Usage:
 *   <FormField label="Email" type="email" value={email} onChange={...} error={errors.email} required />
 *   <FormField label="Message" as="textarea" value={msg} onChange={...} />
 *   <FormField label="Role" as="select" value={role} onChange={...} options={[{value:'tourist',label:'Tourist'}]} />
 */
export default function FormField({
  label,
  as: Component = 'input',
  type = 'text',
  options = [],
  error,
  className = '',
  id,
  ...props
}) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const base =
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors
     bg-white dark:bg-gray-800
     text-gray-800 dark:text-gray-100
     placeholder-gray-400 dark:placeholder-gray-500
     border-gray-200 dark:border-gray-600
     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
     disabled:opacity-50 disabled:cursor-not-allowed
     ${error ? 'border-red-400 focus:ring-red-400' : ''}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {Component === 'select' ? (
        <select id={fieldId} className={base} {...props}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : Component === 'textarea' ? (
        <textarea id={fieldId} className={`${base} resize-none`} rows={4} {...props} />
      ) : (
        <input id={fieldId} type={type} className={base} {...props} />
      )}

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}
