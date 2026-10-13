import React from 'react';
import { useState } from "react";

export default function PasswordInput({ label, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-4">
      {label && <label className="block text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "👁️" : "👁️🗨️"}
        </button>
      </div>
    </div>
  );
}