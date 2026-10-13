import { Link } from "react-router-dom";
import React from 'react';
import DarkModeToggle from '../components/shared/DarkModeToggle';

const accountTypes = [
  {
    title: "Tourist",
    description: "Book tours and explore the beauty of Albania",
    path: "/tourist/login",
    signupPath: "/tourist/signup",
    icon: "🌄",
    gradient: "from-sky-500 to-blue-600",
    accent: "bg-sky-50 text-sky-600",
    bar: "from-sky-400 to-blue-600",
  },
  {
    title: "Licensed Guide",
    description: "Manage your availability, tours and profile",
    path: "/guide/login",
    signupPath: "/guide/signup",
    icon: "🧭",
    gradient: "from-emerald-500 to-green-600",
    accent: "bg-emerald-50 text-emerald-600",
    bar: "from-emerald-400 to-green-600",
  },
  {
    title: "Agency Admin",
    description: "Manage tours, operators and agency settings",
    path: "/agency-admin/login",
    signupPath: "/agency-admin/signup",
    icon: "🏢",
    gradient: "from-violet-500 to-purple-600",
    accent: "bg-violet-50 text-violet-600",
    bar: "from-violet-400 to-purple-600",
  },
  {
    title: "Agency Operator",
    description: "Handle bookings, schedules and guide assignments",
    path: "/agency-operator/login",
    signupPath: null,
    icon: "👨‍💼",
    gradient: "from-indigo-500 to-blue-700",
    accent: "bg-indigo-50 text-indigo-600",
    bar: "from-indigo-400 to-blue-700",
  },
  {
    title: "Ministry Admin",
    description: "Verify guides, agencies and manage policies",
    path: "/ministry-admin/login",
    signupPath: "/ministry-admin/signup",
    icon: "🏛️",
    gradient: "from-amber-500 to-orange-600",
    accent: "bg-amber-50 text-amber-600",
    bar: "from-amber-400 to-orange-600",
  },
  {
    title: "Platform Admin",
    description: "Manage the entire platform and system configuration",
    path: "/platform-admin/login",
    signupPath: null,
    icon: "🔧",
    gradient: "from-slate-500 to-gray-700",
    accent: "bg-slate-100 text-slate-600",
    bar: "from-slate-400 to-gray-700",
  }
];

export default function SelectAccount() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Dark mode toggle */}
        <div className="flex justify-end mb-4">
          <DarkModeToggle />
        </div>

        {/* Page header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium px-4 py-2 rounded-full mb-5">
            <span>👋</span> Welcome to Albania Tourism Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            Choose your portal
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Select your role to sign in or create an account
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accountTypes.map((account) => (
            <Link
              key={account.title}
              to={account.path}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
            >
              {/* Top colour bar — appears on hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${account.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`}
              />

              {/* Icon bubble */}
              <div className={`w-14 h-14 ${account.accent} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform duration-300`}>
                {account.icon}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{account.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">{account.description}</p>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold bg-gradient-to-r ${account.gradient} bg-clip-text text-transparent flex items-center gap-1 group-hover:gap-2 transition-all duration-200`}>
                  Sign in
                  <span>→</span>
                </span>
                {account.signupPath && (
                  <Link
                    to={account.signupPath}
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-gray-400 hover:text-blue-600 hover:underline transition-colors"
                  >
                    Register
                  </Link>
                )}
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-12">
          Need help?{' '}
          <a href="mailto:support@albaniatourism.al" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}