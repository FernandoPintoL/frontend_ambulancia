import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiMapPin, FiTrendingUp, FiNavigation, FiWifiOff, FiWifi } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch } from '../../application/hooks/useDispatch';
import { useWebSocket } from '../../application/hooks/useWebSocket';
import { dispatchRepository } from '../../data/repositories/dispatch-repository';
import MapComponent from '../components/MapComponent';

interface TrackingPoint {
  id: string;
  despacho_id: string;
  latitud: number;
  longitud: number;
  velocidad?: number;
  altitud?: number;
  precision?: number;
  timestamp_gps: string;
}

interface TrackingStats {
  totalPoints: number;
  distanciaKm: number;
  velocidadPromedio: number;
  velocidadMaxima: number;
  tiempoTranscurrido: string;
  altitudMinima: number;
  altitudMaxima: number;
}

export default function TrackingHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedDispatch, loading: dispatchLoading, selectDispatch } = useDispatch();
  const { isConnected, subscribe } = useWebSocket();

  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPoints, setFilteredPoints] = useState<TrackingPoint[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  /**
   * Reload tracking data from server
   */
  const reloadTrackingData = async () => {
    if (!id) return;

    try {
      const points = await dispatchRepository.getRecentDispatches(24);
      const dispatchPoints = points as any;

      if (dispatchPoints && dispatchPoints.historialRastreo) {
        const trackingData = dispatchPoints.historialRastreo as TrackingPoint[];
        setTrackingPoints(trackingData);
        calculateStats(trackingData);
        applyFilters(trackingData);
        setLastUpdateTime(new Date().toLocaleTimeString('es-CO'));
      }
    } catch (err) {
      console.error('Error reloading tracking data:', err);
    }
  };

  // Load dispatch and tracking history
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load dispatch details
        await selectDispatch(id);

        // Load tracking history
        await reloadTrackingData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar historial';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, selectDispatch]);

  // Setup WebSocket subscriptions for real-time updates
  useEffect(() => {
    if (!id) return;

    // Subscribe to ambulance location updates
    const unsubLocationUpdate = subscribe('ambulance_location_updated', (data: any) => {
      // Check if this update is for our dispatch's ambulance
      if (data.dispatchId === id) {
        console.log('Location update received, reloading tracking data');
        reloadTrackingData();
      }
    });

    // Subscribe to dispatch status changes
    const unsubStatusChange = subscribe('dispatch_status_changed', (data: any) => {
      if (data.dispatchId === id) {
        console.log('Status change detected, reloading data');
        reloadTrackingData();
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubLocationUpdate();
      unsubStatusChange();
    };
  }, [id, subscribe]);

  // Apply filters when inputs change
  useEffect(() => {
    applyFilters(trackingPoints);
  }, [dateFilter, sortOrder, trackingPoints]);

  /**
   * Calculate statistics from tracking points
   */
  const calculateStats = (points: TrackingPoint[]) => {
    if (points.length === 0) {
      setStats(null);
      return;
    }

    // Calculate distance using Haversine formula
    const totalDistance = calculateTotalDistance(points);

    // Calculate velocities
    const velocidades = points
      .filter((p) => p.velocidad !== undefined && p.velocidad !== null)
      .map((p) => p.velocidad as number);

    const velocidadPromedio = velocidades.length > 0 ? Math.round(velocidades.reduce((a, b) => a + b, 0) / velocidades.length) : 0;
    const velocidadMaxima = velocidades.length > 0 ? Math.round(Math.max(...velocidades)) : 0;

    // Calculate altitude
    const altitudes = points
      .filter((p) => p.altitud !== undefined && p.altitud !== null)
      .map((p) => p.altitud as number);

    const altitudMinima = altitudes.length > 0 ? Math.round(Math.min(...altitudes)) : 0;
    const altitudMaxima = altitudes.length > 0 ? Math.round(Math.max(...altitudes)) : 0;

    // Calculate time elapsed
    const firstTime = new Date(points[0].timestamp_gps).getTime();
    const lastTime = new Date(points[points.length - 1].timestamp_gps).getTime();
    const diffMs = lastTime - firstTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const tiempoTranscurrido = `${hours}h ${minutes}m`;

    setStats({
      totalPoints: points.length,
      distanciaKm: Math.round(totalDistance * 100) / 100,
      velocidadPromedio,
      velocidadMaxima,
      tiempoTranscurrido,
      altitudMinima,
      altitudMaxima,
    });
  };

  /**
   * Calculate total distance using Haversine formula
   */
  const calculateTotalDistance = (points: TrackingPoint[]): number => {
    let totalDistance = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];

      const distance = haversineDistance(
        point1.latitud,
        point1.longitud,
        point2.latitud,
        point2.longitud
      );

      totalDistance += distance;
    }

    return totalDistance;
  };

  /**
   * Haversine formula to calculate distance between two coordinates
   */
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Apply filters to tracking points
   */
  const applyFilters = (points: TrackingPoint[]) => {
    let filtered = [...points];

    // Apply date filter
    if (dateFilter) {
      const selectedDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((p) => new Date(p.timestamp_gps).toDateString() === selectedDate);
    }

    // Apply sort order
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp_gps).getTime();
      const timeB = new Date(b.timestamp_gps).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    setFilteredPoints(filtered);
  };

  /**
   * Export tracking data to CSV
   */
  const exportToCSV = () => {
    if (trackingPoints.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Punto', 'Fecha/Hora', 'Latitud', 'Longitud', 'Velocidad (km/h)', 'Altitud (m)', 'Precisión (m)'];
    const rows = trackingPoints.map((p, i) => [
      i + 1,
      new Date(p.timestamp_gps).toLocaleString('es-CO'),
      p.latitud.toFixed(6),
      p.longitud.toFixed(6),
      p.velocidad?.toFixed(2) || 'N/A',
      p.altitud?.toFixed(2) || 'N/A',
      p.precision?.toFixed(2) || 'N/A',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `rastreo-${id}-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Archivo CSV descargado');
  };

  if (loading || dispatchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !selectedDispatch) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Despacho no encontrado'}</p>
        <button onClick={() => navigate('/dispatches')} className="btn-primary">
          Volver a despachos
        </button>
      </div>
    );
  }

  const originLat = (selectedDispatch as any).ubicacion_origen_lat;
  const originLon = (selectedDispatch as any).ubicacion_origen_lng;
  const firstPoint = filteredPoints[0];
  const lastPoint = filteredPoints[filteredPoints.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/dispatches/${id}`)} className="btn-secondary flex items-center gap-2 w-fit">
            <FiArrowLeft />
            Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Rastreo</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <p>Despacho #{id}</p>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <FiWifi className="text-green-600 text-sm" />
                    <span className="text-green-600 font-medium">En línea</span>
                  </>
                ) : (
                  <>
                    <FiWifiOff className="text-red-600 text-sm" />
                    <span className="text-red-600 font-medium">Sin conexión</span>
                  </>
                )}
              </div>
              {lastUpdateTime && (
                <p className="text-gray-500">Actualizado: {lastUpdateTime}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reloadTrackingData}
            className="btn-secondary flex items-center gap-2"
            title="Actualizar datos"
          >
            <FiNavigation />
            Actualizar
          </button>
          <button onClick={exportToCSV} disabled={trackingPoints.length === 0} className="btn-primary flex items-center gap-2">
            <FiDownload />
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Points */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Puntos GPS</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPoints}</p>
              </div>
              <FiMapPin className="text-blue-600 text-4xl opacity-20" />
            </div>
          </div>

          {/* Distance */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Distancia</p>
                <p className="text-3xl font-bold text-green-600">{stats.distanciaKm} km</p>
              </div>
              <FiNavigation className="text-green-600 text-4xl opacity-20" />
            </div>
          </div>

          {/* Average Speed */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Velocidad Promedio</p>
                <p className="text-3xl font-bold text-orange-600">{stats.velocidadPromedio} km/h</p>
              </div>
              <FiTrendingUp className="text-orange-600 text-4xl opacity-20" />
            </div>
          </div>

          {/* Max Speed */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Velocidad Máxima</p>
                <p className="text-3xl font-bold text-red-600">{stats.velocidadMaxima} km/h</p>
              </div>
              <FiTrendingUp className="text-red-600 text-4xl opacity-20" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Ruta de Ambulancia</h2>
            <MapComponent
              originLat={originLat}
              originLon={originLon}
              destinationLat={(selectedDispatch as any).ubicacion_destino_lat}
              destinationLon={(selectedDispatch as any).ubicacion_destino_lng}
              ambulanceLat={lastPoint?.latitud}
              ambulanceLon={lastPoint?.longitud}
              trackingPoints={filteredPoints.map((p) => ({
                latitude: p.latitud,
                longitude: p.longitud,
                velocidad: p.velocidad,
                timestamp: p.timestamp_gps,
              }))}
              height="500px"
              showRoute={true}
              showTrackingPoints={true}
            />
            {stats && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Tiempo Transcurrido</p>
                    <p className="font-semibold">{stats.tiempoTranscurrido}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Altitud Mín/Máx</p>
                    <p className="font-semibold">
                      {stats.altitudMinima}m / {stats.altitudMaxima}m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Summary */}
        <div className="space-y-4">
          {/* Filters Card */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Filtros</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} className="input-field">
                  <option value="desc">Más Reciente</option>
                  <option value="asc">Más Antiguo</option>
                </select>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{filteredPoints.length}</span> de <span className="font-semibold">{trackingPoints.length}</span> puntos
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {stats && (
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold mb-3 text-blue-900">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Inicio:</span>
                  <span className="font-semibold">
                    {firstPoint ? new Date(firstPoint.timestamp_gps).toLocaleTimeString('es-CO') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Fin:</span>
                  <span className="font-semibold">
                    {lastPoint ? new Date(lastPoint.timestamp_gps).toLocaleTimeString('es-CO') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Duración:</span>
                  <span className="font-semibold">{stats.tiempoTranscurrido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Distancia:</span>
                  <span className="font-semibold">{stats.distanciaKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Vel. Promedio:</span>
                  <span className="font-semibold">{stats.velocidadPromedio} km/h</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Points Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Detalles de Puntos GPS</h2>

        {filteredPoints.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay puntos de rastreo disponibles</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Latitud</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Longitud</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Velocidad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Altitud</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Precisión</th>
                </tr>
              </thead>
              <tbody>
                {filteredPoints.map((point, index) => (
                  <tr key={point.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(point.timestamp_gps).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{point.latitud.toFixed(6)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{point.longitud.toFixed(6)}</td>
                    <td className="px-4 py-3 text-sm">
                      {point.velocidad !== undefined && point.velocidad !== null ? (
                        <span className="badge badge-info">{point.velocidad.toFixed(1)} km/h</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {point.altitud !== undefined && point.altitud !== null ? `${point.altitud.toFixed(0)}m` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {point.precision !== undefined && point.precision !== null ? `${point.precision.toFixed(0)}m` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
