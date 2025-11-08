/**
 * App.tsx
 * Presentation Layer - Main App Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@components/Layout';
import DashboardPage from '@pages/DashboardPage';
import DispatchesPage from '@pages/DispatchesPage';
import CreateDispatchPage from '@pages/CreateDispatchPage';
import DispatchDetailsPage from '@pages/DispatchDetailsPage';
import AmbulancesPage from '@pages/AmbulancesPage';
import HealthPage from '@pages/HealthPage';

export default function App() {
  return (
    <Router>
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

      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Dispatches */}
          <Route path="/dispatches" element={<DispatchesPage />} />
          <Route path="/dispatches/new" element={<CreateDispatchPage />} />
          <Route path="/dispatches/:id" element={<DispatchDetailsPage />} />

          {/* Ambulances */}
          <Route path="/ambulances" element={<AmbulancesPage />} />

          {/* Health */}
          <Route path="/health" element={<HealthPage />} />

          {/* Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
