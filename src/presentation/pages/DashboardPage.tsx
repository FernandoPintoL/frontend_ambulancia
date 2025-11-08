/**
 * Dashboard Page
 * Presentation Layer - Main dashboard with overview
 */

import { useEffect } from 'react';
import { useDispatch } from '@hooks/useDispatch';
import { usePredictions } from '@hooks/usePredictions';
import { FiBarChart3, FiTruck, FiAlertCircle, FiCheck } from 'react-icons/fi';

const DashboardPage = () => {
  const { loadRecentDispatches, dispatches } = useDispatch();
  const { getModelsHealth, loading: healthLoading } = usePredictions();

  useEffect(() => {
    loadRecentDispatches(24);
  }, []);

  const stats = {
    total: dispatches.length,
    pending: dispatches.filter((d) => d.status === 'pending').length,
    inTransit: dispatches.filter((d) => d.status === 'in_transit').length,
    completed: dispatches.filter((d) => d.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of dispatch operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Dispatches', value: stats.total, icon: FiBarChart3, color: 'blue' },
          { label: 'Pending', value: stats.pending, icon: FiAlertCircle, color: 'yellow' },
          { label: 'In Transit', value: stats.inTransit, icon: FiTruck, color: 'orange' },
          { label: 'Completed', value: stats.completed, icon: FiCheck, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="text-4xl text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Dispatches */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Dispatches (Last 24h)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dispatches.slice(0, 5).map((dispatch) => (
                <tr key={dispatch.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{dispatch.patientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dispatch.description.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dispatch.severityLevel <= 2
                          ? 'bg-red-100 text-red-800'
                          : dispatch.severityLevel <= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Level {dispatch.severityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {dispatch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
