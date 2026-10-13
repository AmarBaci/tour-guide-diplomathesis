import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦅</span>
              <span className="text-white font-bold text-lg">Albania Tourism Hub</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting travellers with the best of Albania — licensed guides, authentic experiences, and verified agencies.
            </p>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Login Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tourist/login" className="hover:text-white transition-colors">Tourist</Link></li>
              <li><Link to="/guide/login" className="hover:text-white transition-colors">Licensed Guide</Link></li>
              <li><Link to="/agency-admin/login" className="hover:text-white transition-colors">Agency Admin</Link></li>
              <li><Link to="/ministry-admin/login" className="hover:text-white transition-colors">Ministry Admin</Link></li>
              <li><Link to="/platform-admin/login" className="hover:text-white transition-colors">Platform Admin</Link></li>
            </ul>
          </div>

          {/* Register */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Register</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tourist/signup" className="hover:text-white transition-colors">As Tourist</Link></li>
              <li><Link to="/guide/signup" className="hover:text-white transition-colors">As Guide</Link></li>
              <li><Link to="/agency-admin/signup" className="hover:text-white transition-colors">As Agency</Link></li>
              <li><Link to="/ministry-admin/signup" className="hover:text-white transition-colors">As Ministry</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Albania Tourism Hub. All rights reserved.</p>
          <p>Built for the Albanian Ministry of Tourism</p>
        </div>
      </div>
    </footer>
  );
}