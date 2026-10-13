import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext({
  activeTab: '',
  setActiveTab: () => {},
  navItems: [],
  setNavItems: () => {},
});

export function DashboardProvider({ children }) {
  const [activeTab, setActiveTab] = useState('');
  const [navItems, setNavItems] = useState([]);

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab, navItems, setNavItems }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
