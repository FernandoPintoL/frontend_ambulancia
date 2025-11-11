// @ts-nocheck
import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Map, List } from 'lucide-react';
import useIncidentes from '../../application/hooks/useIncidentes';
import { IncidentsTable } from '../components/IncidentsTable';
import { GoogleMap } from '../components/GoogleMap';
import { IncidentFilter } from '../../data/repositories/incident-repository';
import toast from 'react-hot-toast';

const STATES = [
  { value: 'RECIBIDO', label: 'Recibido' },
  { value: 'EN_ANALISIS_TEXTO', label: 'Análisis de Texto' },
  { value: 'EN_ANALISIS_IMAGEN', label: 'Análisis de Imagen' },
  { value: 'ANALISIS_COMPLETADO', label: 'Análisis Completado' },
  { value: 'ANALIZADO', label: 'Analizado' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const CHANNELS = [
  { value: 'WEB', label: 'Web' },
  { value: 'MOVIL', label: 'Móvil' },
  { value: 'LLAMADA', label: 'Llamada Telefónica' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'TELEGRAM', label: 'Telegram' },
];

export function IncidentesListPage() {
  const {
    incidents,
    loading,
    currentPage,
    pageSize,
    totalElements,
    handlePageChange,
    handleApprove,
    handleReject,
    handleCancel,
    handleFilterChange,
    handleSelectIncident,
  } = useIncidentes();

  const [filters, setFilters] = useState<IncidentFilter>({});
  const [showFilters, setShowFilters] = useState(false);
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

  const handleFilterApply = useCallback(() => {
    handleFilterChange(filters);
    setShowFilters(false);
    toast.success('Filtros aplicados');
  }, [filters, handleFilterChange]);

  const handleFilterReset = useCallback(() => {
    setFilters({});
    handleFilterChange({});
    toast.success('Filtros eliminados');
  }, [handleFilterChange]);

  const handleStateChange = (estado: string) => {
    setFilters((prev) => ({
      ...prev,
      estado: prev.estado === estado ? undefined : estado,
    }));
  };

  const handleChannelChange = (canal: string) => {
    setFilters((prev) => ({
      ...prev,
      canalOrigen: prev.canalOrigen === canal ? undefined : canal,
    }));
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      fechaInicio: start || undefined,
      fechaFin: end || undefined,
    }));
  };

  const handlePriorityRangeChange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      prioridadMin: min,
      prioridadMax: max,
    }));
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Listado de Incidentes</h1>
            <p className="text-slate-600 mt-2">Visualiza y filtra todos los incidentes del sistema</p>
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
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              Filtros {activeFilterCount > 0 && <span className="ml-1 font-bold">({activeFilterCount})</span>}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filtros Avanzados</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estado Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Estado</label>
                <div className="space-y-2">
                  {STATES.map((state) => (
                    <label key={state.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.estado === state.value}
                        onChange={() => handleStateChange(state.value)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{state.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Canal Origen Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Canal de Origen</label>
                <div className="space-y-2">
                  {CHANNELS.map((channel) => (
                    <label key={channel.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.canalOrigen === channel.value}
                        onChange={() => handleChannelChange(channel.value)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Rango de Fechas</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.fechaInicio || ''}
                    onChange={(e) => handleDateRangeChange(e.target.value, filters.fechaFin || '')}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fecha inicio"
                  />
                  <input
                    type="date"
                    value={filters.fechaFin || ''}
                    onChange={(e) => handleDateRangeChange(filters.fechaInicio || '', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fecha fin"
                  />
                </div>
              </div>

              {/* Priority Range */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Rango de Prioridad</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.prioridadMin || ''}
                    onChange={(e) => handlePriorityRangeChange(parseInt(e.target.value) || 0, filters.prioridadMax || 5)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.prioridadMax || ''}
                    onChange={(e) => handlePriorityRangeChange(filters.prioridadMin || 1, parseInt(e.target.value) || 5)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Máx"
                  />
                </div>
              </div>

              {/* Verosimilitud */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Verosimilitud</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.esVerosimil === true}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        esVerosimil: e.target.checked ? true : undefined,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Solo incidentes verosímiles</span>
                </label>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleFilterApply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleFilterReset}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Resultados</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {incidents.length > 0
                    ? `Mostrando ${currentPage * pageSize + 1} a ${Math.min((currentPage + 1) * pageSize, totalElements)} de ${totalElements} incidentes`
                    : 'No se encontraron incidentes'}
                </p>
              </div>
              <div className="text-right text-sm text-slate-600">
                Total: <span className="font-bold text-lg text-slate-900">{totalElements}</span>
              </div>
            </div>

            <IncidentsTable
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
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
                Visualización geográfica de {incidentMarkers.length} incidentes con ubicación ({totalElements} total)
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

export default IncidentesListPage;
