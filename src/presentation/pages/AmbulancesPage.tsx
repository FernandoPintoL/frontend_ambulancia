import { useEffect, useState } from 'react';
import { FiTruck, FiMapPin, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'maintenance'>('all');

  useEffect(() => {
    // TODO: Implement actual GraphQL query
    const mockAmbulances = [
      {
        id: 'AMB-001',
        name: 'Ambulancia Centro 1',
        status: 'available',
        location: { lat: 4.7110, lon: -74.0721 },
        crew: 'Juan García, María López',
        lastUpdate: new Date().toISOString(),
        responseTime: 8,
      },
      {
        id: 'AMB-002',
        name: 'Ambulancia Centro 2',
        status: 'busy',
        location: { lat: 4.7150, lon: -74.0680 },
        crew: 'Carlos Ramírez, Ana Martínez',
        lastUpdate: new Date().toISOString(),
        responseTime: 12,
      },
      {
        id: 'AMB-003',
        name: 'Ambulancia Norte 1',
        status: 'available',
        location: { lat: 4.7500, lon: -74.0500 },
        crew: 'Pedro Sánchez, Rosa García',
        lastUpdate: new Date().toISOString(),
        responseTime: 15,
      },
      {
        id: 'AMB-004',
        name: 'Ambulancia Norte 2',
        status: 'maintenance',
        location: { lat: 4.7500, lon: -74.0500 },
        crew: 'Disponible',
        lastUpdate: new Date().toISOString(),
        responseTime: null,
      },
    ];
    setAmbulances(mockAmbulances);
    setLoading(false);
  }, []);

  const filteredAmbulances = ambulances.filter((amb) =>
    filter === 'all' || amb.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'badge-success';
      case 'busy':
        return 'badge-info';
      case 'maintenance':
        return 'badge-warning';
      default:
        return 'badge-danger';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'En Servicio';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flota de Ambulancias</h1>
        <p className="text-gray-600">Monitoreo y gestión de ambulancias</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-blue-600">{ambulances.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Disponibles</p>
          <p className="text-3xl font-bold text-green-600">
            {ambulances.filter((a) => a.status === 'available').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">En Servicio</p>
          <p className="text-3xl font-bold text-blue-600">
            {ambulances.filter((a) => a.status === 'busy').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Mantenimiento</p>
          <p className="text-3xl font-bold text-yellow-600">
            {ambulances.filter((a) => a.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          {['all', 'available', 'busy', 'maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'Todas'}
              {status === 'available' && 'Disponibles'}
              {status === 'busy' && 'En Servicio'}
              {status === 'maintenance' && 'Mantenimiento'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ambulancias */}
      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : filteredAmbulances.length > 0 ? (
        <div className="grid gap-4">
          {filteredAmbulances.map((ambulance) => (
            <div key={ambulance.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FiTruck className="text-2xl text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{ambulance.name}</h3>
                      <p className="text-gray-600 text-sm">ID: {ambulance.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Personal</p>
                      <p className="font-medium">{ambulance.crew}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Ubicación</p>
                      <p className="font-medium flex items-center gap-1">
                        <FiMapPin className="text-red-600" />
                        {ambulance.location.lat.toFixed(4)}, {ambulance.location.lon.toFixed(4)}
                      </p>
                    </div>
                    {ambulance.responseTime && (
                      <div>
                        <p className="text-gray-600 text-sm">Tiempo de Respuesta Promedio</p>
                        <p className="font-medium">{ambulance.responseTime} min</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 text-sm">Última Actualización</p>
                      <p className="font-medium text-sm">
                        {new Date(ambulance.lastUpdate).toLocaleTimeString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`badge ${getStatusColor(ambulance.status)}`}>
                    {ambulance.status === 'available' && <FiCheckCircle />}
                    {ambulance.status !== 'available' && <FiAlertCircle />}
                    {getStatusLabel(ambulance.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">No hay ambulancias en este estado</p>
        </div>
      )}
    </div>
  );
}
