// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Zap, Clock, Map, List } from 'lucide-react';
import useIncidentes from '../../application/hooks/useIncidentes';
import useIncidentWebSocket from '../../application/hooks/useIncidentWebSocket';
import { CreateIncidentForm } from '../components/CreateIncidentForm';
import { IncidentsTable } from '../components/IncidentsTable';
import { GoogleMap } from '../components/GoogleMap';
import toast from 'react-hot-toast';

export function RecepcionPage() {
  const {
    incidents,
    loading,
    error,
    currentPage,
    pageSize,
    totalElements,
    highPriorityCount,
    pendingAnalysisCount,
    handlePageChange,
    handleCreateIncident,
    handleApprove,
    handleReject,
    handleCancel,
    clearError,
  } = useIncidentes();

  const { onIncidentCreated, onIncidentUpdated, onIncidentStatusChanged } = useIncidentWebSocket();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const totalPages = Math.ceil(totalElements / pageSize);

  // Convert incidents to map markers
  const incidentMarkers = incidents
    .filter(incident => incident.ubicacion?.latitud && incident.ubicacion?.longitud)
    .map(incident => ({
      id: incident.id,
      lat: incident.ubicacion!.latitud,
      lng: incident.ubicacion!.longitud,
      label: `${incident.codigo}`,
      color:
        incident.estadoIncidente === 'RECIBIDO' ? 'FFD700' : // Gold
        incident.estadoIncidente === 'APROBADO' ? '00FF00' : // Green
        incident.estadoIncidente === 'RECHAZADO' ? 'FF0000' : // Red
        '0000FF', // Blue for others
      info: `${incident.descripcionOriginal.substring(0, 100)}...`,
    }));

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubCreateSubscribe = onIncidentCreated((incident) => {
      toast.success('Nuevo incidente recibido en tiempo real', {
        icon: '🆕',
      });
    });

    const unsubUpdateSubscribe = onIncidentUpdated((incident) => {
      toast.success('Incidente actualizado en tiempo real', {
        icon: '♻️',
      });
    });

    const unsubStatusSubscribe = onIncidentStatusChanged((data) => {
      toast.success(`Estado del incidente actualizado a: ${data.estadoIncidente.replace(/_/g, ' ')}`, {
        icon: '🔄',
      });
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      unsubCreateSubscribe();
      unsubUpdateSubscribe();
      unsubStatusSubscribe();
    };
  }, [onIncidentCreated, onIncidentUpdated, onIncidentStatusChanged]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    toast.success('Incidente creado exitosamente');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-red-800">Error cargando incidentes</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Centro de Recepción de Incidentes</h1>
            <p className="text-slate-600 mt-2">Gestiona la recepción, análisis y aprobación de incidentes reportados</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-white rounded-lg shadow border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <List size={18} />
                Tabla
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Map size={18} />
                Mapa
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={20} />
              {showCreateForm ? 'Cancelar' : 'Nuevo Incidente'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Incidents */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Incidentes</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalElements}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Alta Prioridad</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{highPriorityCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Zap className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Pending Analysis */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pendiente de Análisis</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingAnalysisCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Create Incident Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <CreateIncidentForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Incidents View Section */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Listado de Incidentes</h2>
              <p className="text-slate-600 text-sm mt-1">
                Mostrando {incidents.length > 0 ? currentPage * pageSize + 1 : 0} a{' '}
                {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} incidentes
              </p>
            </div>

            <IncidentsTable
              incidents={incidents}
              onSelectIncident={(incident) => {
                // TODO: Navigate to incident detail page
                console.log('Selected incident:', incident);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Mapa de Incidentes</h2>
              <p className="text-slate-600 text-sm mt-1">
                Visualización geográfica de {incidentMarkers.length} incidentes con ubicación
              </p>
            </div>

            <GoogleMap
              initialCenter={{ lat: 4.6097, lng: -74.0817 }} // Bogotá
              markers={incidentMarkers}
              onMarkerSelected={(marker) => {
                const incident = incidents.find(i => i.id === marker.id);
                if (incident) {
                  console.log('Selected incident:', incident);
                  toast.info(`Incidente: ${incident.codigo}`);
                }
              }}
              readOnly={true}
              showSearchBar={false}
              showDistance={false}
              height="600px"
              zoom={12}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default RecepcionPage;
