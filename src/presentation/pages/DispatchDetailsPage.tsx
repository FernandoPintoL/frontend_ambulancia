import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DispatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [dispatch, setDispatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedAmbulance, setAssignedAmbulance] = useState<any>(null);

  useEffect(() => {
    // TODO: Implement actual GraphQL query to fetch dispatch details
    const mockDispatch = {
      id,
      patientName: 'Juan Pérez',
      patientAge: 45,
      patientPhone: '+57 3001234567',
      description: 'Dolor en el pecho',
      severityLevel: 3,
      status: 'active',
      address: 'Calle 45 #12-34, Bogotá',
      latitude: 4.7110,
      longitude: -74.0721,
      createdAt: new Date().toISOString(),
      assignedAmbulance: {
        id: 'AMB-001',
        name: 'Ambulancia 1',
        status: 'en ruta',
      },
    };
    setDispatch(mockDispatch);
    setAssignedAmbulance(mockDispatch.assignedAmbulance);
    setLoading(false);
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      // TODO: Implement actual GraphQL mutation
      console.log('Update status:', newStatus);
      setDispatch({ ...dispatch, status: newStatus });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    }
  };

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
      <div className="flex items-center gap-4">
        <a href="/dispatches" className="btn-secondary flex items-center gap-2 w-fit">
          <FiArrowLeft />
          Volver
        </a>
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
                  {dispatch.patientPhone}
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
            <p className="text-gray-700 mb-4">{dispatch.address}</p>
            <div className="bg-gray-200 rounded h-64 flex items-center justify-center">
              <p className="text-gray-600">Mapa: {dispatch.latitude}, {dispatch.longitude}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Estado */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Estado</h2>
            <div className="mb-4">
              <span className={`badge badge-${
                dispatch.status === 'pending' ? 'warning' :
                dispatch.status === 'active' ? 'info' :
                'success'
              }`}>
                {dispatch.status}
              </span>
            </div>
            <div className="space-y-2">
              {['pending', 'active', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={dispatch.status === status}
                  className={`w-full py-2 rounded font-medium transition-colors ${
                    dispatch.status === status
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'pending' && 'Pendiente'}
                  {status === 'active' && 'Activo'}
                  {status === 'completed' && 'Completado'}
                  {status === 'cancelled' && 'Cancelado'}
                </button>
              ))}
            </div>
          </div>

          {/* Ambulancia Asignada */}
          {assignedAmbulance && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Ambulancia Asignada</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">ID</p>
                  <p className="font-semibold">{assignedAmbulance.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Nombre</p>
                  <p className="font-semibold">{assignedAmbulance.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Estado</p>
                  <p className="font-semibold badge badge-info">{assignedAmbulance.status}</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
