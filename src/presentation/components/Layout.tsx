/**
 * Layout Component
 * Presentation Layer - Main layout wrapper
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTruck, FiMapPin, FiActivity, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/dispatches', label: 'Dispatches', icon: FiMapPin },
    { path: '/ambulances', label: 'Ambulances', icon: FiTruck },
    { path: '/health', label: 'Health', icon: FiActivity },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 md:translate-x-0 md:static`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FiTruck className="text-2xl text-orange-500" />
            <h1 className="text-xl font-bold">HADS</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="text-xl" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <p className="text-sm text-gray-400">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600"
            >
              <FiMenu className="text-2xl" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => isActive(item.path))?.label || 'HADS'}
            </h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
