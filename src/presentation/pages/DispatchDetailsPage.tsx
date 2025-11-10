import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiClock, FiMap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch } from '../../application/hooks/useDispatch';
import { useWebSocket } from '../../application/hooks/useWebSocket';
import MapComponent from '../components/MapComponent';

export default function DispatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedDispatch, loading, selectDispatch, updateStatus } = useDispatch();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (id) {
      selectDispatch(id).catch((error) => {
        toast.error('Error al cargar despacho');
        console.error(error);
      });
    }
  }, [id, selectDispatch]);

  // Setup WebSocket subscriptions for real-time dispatch updates
  useEffect(() => {
    if (!id) return;

    const unsubStatusChanged = subscribe('dispatch_status_changed', (data: any) => {
      if (data.dispatchId === parseInt(id) || data.dispatchId === id) {
        console.log('Dispatch status changed, reloading');
        selectDispatch(id);
      }
    });

    const unsubLocationUpdated = subscribe('ambulance_location_updated', () => {
      console.log('Ambulance location updated, reloading');
      selectDispatch(id);
    });

    return () => {
      unsubStatusChanged();
      unsubLocationUpdated();
    };
  }, [id, subscribe, selectDispatch]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;

    try {
      await updateStatus(id, newStatus);
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado';
      toast.error(errorMessage);
      console.error('Error updating status:', error);
    }
  };

  // Map backend status values to display values
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    in_transit: 'En Tránsito',
    at_patient: 'En Paciente',
    returning: 'Regresando',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const dispatch = selectedDispatch;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Despacho no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/dispatches" className="btn-secondary flex items-center gap-2 w-fit">
            <FiArrowLeft />
            Volver
          </a>
        </div>
        {dispatch && (
          <button
            onClick={() => navigate(`/dispatches/${id}/tracking`)}
            className="btn-primary flex items-center gap-2"
          >
            <FiMap />
            Ver Rastreo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Paciente */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Información del Paciente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Nombre</p>
                <p className="font-semibold">{dispatch.patientName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Edad</p>
                <p className="font-semibold">{dispatch.patientAge} años</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Teléfono</p>
                <p className="font-semibold flex items-center gap-2">
                  <FiPhone className="text-blue-600" />
                  {(dispatch as any).patientPhone}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Severidad</p>
                <p className={`font-semibold badge ${
                  dispatch.severityLevel <= 2 ? 'badge-warning' :
                  dispatch.severityLevel <= 3 ? 'badge-info' :
                  'badge-danger'
                }`}>
                  Nivel {dispatch.severityLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Descripción</h2>
            <p className="text-gray-700">{dispatch.description}</p>
          </div>

          {/* Ubicación */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiMapPin className="text-blue-600" />
              Ubicación
            </h2>
            <p className="text-gray-700 mb-4">{(dispatch as any).direccion_origen || 'Ubicación no especificada'}</p>
            <MapComponent
              originLat={(dispatch as any).ubicacion_origen_lat}
              originLon={(dispatch as any).ubicacion_origen_lng}
              destinationLat={(dispatch as any).ubicacion_destino_lat}
              destinationLon={(dispatch as any).ubicacion_destino_lng}
              ambulanceLat={( dispatch as any).ambulance?.currentLocation?.latitude}
              ambulanceLon={( dispatch as any).ambulance?.currentLocation?.longitude}
              height="400px"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Estado */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Estado</h2>
            <div className="mb-4">
              <span className={`badge badge-${
                dispatch.status === 'pending' ? 'warning' :
                dispatch.status === 'in_transit' ? 'info' :
                dispatch.status === 'at_patient' ? 'info' :
                dispatch.status === 'returning' ? 'info' :
                'success'
              }`}>
                {statusMap[dispatch.status] || dispatch.status}
              </span>
            </div>
            <div className="space-y-2">
              {['pending', 'in_transit', 'at_patient', 'returning', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={dispatch.status === status || loading}
                  className={`w-full py-2 rounded font-medium transition-colors ${
                    dispatch.status === status || loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusMap[status] || status}
                </button>
              ))}
            </div>
          </div>

          {/* Ambulancia Asignada */}
          {( dispatch as any).ambulance && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Ambulancia Asignada</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">ID</p>
                  <p className="font-semibold">{( dispatch as any).ambulance.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Código</p>
                  <p className="font-semibold">{( dispatch as any).ambulance.code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Estado</p>
                  <p className="font-semibold badge badge-info">{( dispatch as any).ambulance.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Ubicación Actual</p>
                  <p className="font-semibold text-sm">
                    {( dispatch as any).ambulance.currentLocation?.latitude.toFixed(4)}, {( dispatch as any).ambulance.currentLocation?.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información Temporal */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiClock className="text-blue-600" />
              Tiempo
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Creado</p>
                <p className="font-semibold text-sm">
                  {new Date(dispatch.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
              {(dispatch as any).fecha_asignacion && (
                <div>
                  <p className="text-gray-600 text-sm">Asignado</p>
                  <p className="font-semibold text-sm">
                    {new Date((dispatch as any).fecha_asignacion).toLocaleString('es-CO')}
                  </p>
                </div>
              )}
              {(dispatch as any).fecha_llegada && (
                <div>
                  <p className="text-gray-600 text-sm">Llegada</p>
                  <p className="font-semibold text-sm">
                    {new Date((dispatch as any).fecha_llegada).toLocaleString('es-CO')}
                  </p>
                </div>
              )}
              {(dispatch as any).tiempo_real_min && (
                <div>
                  <p className="text-gray-600 text-sm">Tiempo Real</p>
                  <p className="font-semibold">{(dispatch as any).tiempo_real_min} min</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
