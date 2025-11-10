/**
 * App.tsx
 * Presentation Layer - Main App Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../application/store/auth-store';
import { initializeWebSocketListeners } from '../application/store/dispatch-store';
import { initializeWebSocketListenersPersonal } from '../application/store/personal-store';
import { useEffect } from 'react';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DispatchesPage from './pages/DispatchesPage';
import CreateDispatchPage from './pages/CreateDispatchPage';
import DispatchDetailsPage from './pages/DispatchDetailsPage';
import TrackingHistoryPage from './pages/TrackingHistoryPage';
import PersonalPage from './pages/PersonalPage';
import AmbulancesPage from './pages/AmbulancesPage';
import HealthPage from './pages/HealthPage';

export default function App() {
  const { token, setUser } = useAuthStore();

  // Restaurar usuario del localStorage si existe token
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
      }
    }
  }, [token, setUser]);

  // Initialize WebSocket listeners for real-time updates
  useEffect(() => {
    initializeWebSocketListeners();
    initializeWebSocketListenersPersonal();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<DashboardPage />} />

                  {/* Dispatches */}
                  <Route path="/dispatches" element={<DispatchesPage />} />
                  <Route path="/dispatches/new" element={<CreateDispatchPage />} />
                  <Route path="/dispatches/:id" element={<DispatchDetailsPage />} />
                  <Route path="/dispatches/:id/tracking" element={<TrackingHistoryPage />} />

                  {/* Personal */}
                  <Route path="/personal" element={<PersonalPage />} />

                  {/* Ambulances */}
                  <Route path="/ambulances" element={<AmbulancesPage />} />

                  {/* Health */}
                  <Route path="/health" element={<HealthPage />} />

                  {/* Not Found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
