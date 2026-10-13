import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-200">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}