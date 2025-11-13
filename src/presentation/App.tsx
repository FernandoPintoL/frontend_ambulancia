// @ts-nocheck
/**
 * App.tsx
 * Presentation Layer - Main App Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../application/store/auth-store';
import { initializeWebSocketListeners } from '../application/store/dispatch-store';
import { initializeWebSocketListenersPersonal } from '../application/store/personal-store';
import { initializeWebSocketListenersIncidents } from '../application/store/incident-websocket-listeners';
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

// Incident Management Pages
import RecepcionPage from './pages/RecepcionPage';
import IncidentesListPage from './pages/IncidentesListPage';
import IncidenteDetallesPage from './pages/IncidenteDetallesPage';

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

  // Initialize WebSocket connection globally
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const { websocketService } = require('../data/repositories/websocket-service');

        // Connect to WebSocket - but don't block if it fails
        try {
          await websocketService.connect();
          console.log('✅ WebSocket conectado exitosamente');
        } catch (wsError) {
          console.warn('⚠️ WebSocket conexión falló, la app continuará sin tiempo real:', wsError);
          // No lanzar error, dejar que la app continúe
        }

        // Initialize listeners for real-time updates
        initializeWebSocketListeners();
        initializeWebSocketListenersPersonal();
        initializeWebSocketListenersIncidents();
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        // Continuar sin WebSocket
      }
    };

    initWebSocket();
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

                  {/* Incidents Management - Recepción */}
                  <Route path="/incidents/reception" element={<RecepcionPage />} />
                  <Route path="/incidents" element={<IncidentesListPage />} />
                  <Route path="/incidents/:id" element={<IncidenteDetallesPage />} />

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
