// @ts-nocheck
/**
 * Layout Component
 * Presentation Layer - Main layout wrapper
 * Modern & Responsive Sidebar Navigation
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Truck, MapPin, Activity, Menu, X, LogOut, User, ChevronRight, Settings, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../application/store/auth-store';
import { useWebSocket } from '../../application/hooks/useWebSocket';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isConnected } = useWebSocket();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/incidents/reception', label: 'Recepción de Incidentes', icon: AlertCircle },
    { path: '/incidents', label: 'Listado de Incidentes', icon: AlertCircle },
    { path: '/dispatches', label: 'Despachos', icon: MapPin },
    { path: '/personal', label: 'Personal', icon: User },
    { path: '/ambulances', label: 'Ambulancias', icon: Truck },
    { path: '/health', label: 'Salud', icon: Activity },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        md:translate-x-0 md:static
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
        flex flex-col shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Truck className="text-xl text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">HADS</h1>
                <p className="text-xs text-gray-400">Sistema de Despacho</p>
              </div>
            )}
          </div>

          {/* Close/Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex items-center justify-center p-1 hover:bg-slate-700 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
            >
              <ChevronRight className={`text-lg transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => !sidebarCollapsed && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group
                ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              title={sidebarCollapsed ? label : ''}
            >
              <Icon className="text-lg flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium text-sm">{label}</span>
                  {isActive(path) && (
                    <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                  )}
                </>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 border border-slate-700">
                  {label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
            {!sidebarCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-white text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-lg"
                >
                  <LogOut className="text-lg" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <User className="text-white text-sm" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                  title="Cerrar Sesión"
                >
                  <LogOut className="text-lg" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t border-slate-700/50 text-center ${sidebarCollapsed ? 'text-xs' : ''}`}>
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="text-2xl text-gray-700" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {navItems.find((item) => isActive(item.path))?.label || 'HADS'}
                </h2>
                <p className="text-xs text-gray-500">Sistema de Despacho de Ambulancias</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {/* WebSocket Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
                <span>{isConnected ? 'En línea' : 'Sin conexión'}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                <span>{new Date().toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay - Mobile Only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
