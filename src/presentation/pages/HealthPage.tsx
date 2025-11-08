import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiCpu, FiDatabase, FiServer } from 'react-icons/fi';

export default function HealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual GraphQL queries
    const mockHealth = {
      status: 'healthy',
      graphql: { status: 'operational', latency: 45 },
      database: { status: 'operational', connections: 12 },
      cache: { status: 'operational', hitRate: 0.87 },
      websocket: { status: 'operational', activeConnections: 34 },
      mlService: { status: 'operational', processingTime: 120 },
    };

    const mockModels = [
      {
        id: 'severity-model-v1',
        name: 'Severity Prediction Model',
        version: '1.2.0',
        accuracy: 0.94,
        lastTrained: '2025-11-05',
        status: 'active',
      },
      {
        id: 'eta-model-v1',
        name: 'ETA Prediction Model',
        version: '1.0.5',
        accuracy: 0.89,
        lastTrained: '2025-11-04',
        status: 'active',
      },
      {
        id: 'optimization-model-v1',
        name: 'Route Optimization Model',
        version: '1.1.2',
        accuracy: 0.91,
        lastTrained: '2025-11-06',
        status: 'active',
      },
    ];

    setHealth(mockHealth);
    setModels(mockModels);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    return status === 'operational' || status === 'healthy'
      ? 'badge-success'
      : status === 'degraded'
      ? 'badge-warning'
      : 'badge-danger';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operacional';
      case 'healthy':
        return 'Saludable';
      case 'degraded':
        return 'Degradado';
      case 'down':
        return 'Inactivo';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salud del Sistema</h1>
        <p className="text-gray-600">Monitoreo del estado de servicios y modelos ML</p>
      </div>

      {/* Estado General */}
      {health && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Estado General del Sistema</h2>
            <span className={`badge ${getStatusBadge(health.status)} text-lg px-4 py-2`}>
              {health.status === 'healthy' && <FiCheckCircle className="mr-2" />}
              {health.status !== 'healthy' && <FiAlertCircle className="mr-2" />}
              {getStatusLabel(health.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GraphQL */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiServer className="text-blue-600" />
                <h3 className="font-semibold">GraphQL API</h3>
                <span className={`badge ${getStatusBadge(health.graphql.status)}`}>
                  {getStatusLabel(health.graphql.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Latencia: {health.graphql.latency}ms</p>
            </div>

            {/* Database */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiDatabase className="text-green-600" />
                <h3 className="font-semibold">Base de Datos</h3>
                <span className={`badge ${getStatusBadge(health.database.status)}`}>
                  {getStatusLabel(health.database.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Conexiones activas: {health.database.connections}
              </p>
            </div>

            {/* Cache */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCpu className="text-purple-600" />
                <h3 className="font-semibold">Cache (Redis)</h3>
                <span className={`badge ${getStatusBadge(health.cache.status)}`}>
                  {getStatusLabel(health.cache.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Hit Rate: {(health.cache.hitRate * 100).toFixed(1)}%
              </p>
            </div>

            {/* WebSocket */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiServer className="text-orange-600" />
                <h3 className="font-semibold">WebSocket</h3>
                <span className={`badge ${getStatusBadge(health.websocket.status)}`}>
                  {getStatusLabel(health.websocket.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Conexiones activas: {health.websocket.activeConnections}
              </p>
            </div>

            {/* ML Service */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCpu className="text-red-600" />
                <h3 className="font-semibold">Servicio ML</h3>
                <span className={`badge ${getStatusBadge(health.mlService.status)}`}>
                  {getStatusLabel(health.mlService.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Tiempo procesamiento: {health.mlService.processingTime}ms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modelos ML */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Modelos de Machine Learning</h2>

        <div className="grid gap-4">
          {models.map((model) => (
            <div key={model.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{model.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">ID: {model.id}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Versión</p>
                      <p className="font-medium">{model.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Precisión</p>
                      <p className="font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Último Entrenamiento</p>
                      <p className="font-medium text-sm">
                        {new Date(model.lastTrained).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Estado</p>
                      <p className="font-medium">
                        <span className={`badge ${getStatusBadge(model.status)}`}>
                          {model.status === 'active' ? 'Activo' : model.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <button className="btn-secondary whitespace-nowrap">
                  Reentrenar
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Precisión</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${model.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Recomendaciones</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Todo los servicios están operacionales</li>
          <li>• Rendimiento del sistema óptimo</li>
          <li>• Se recomienda revisión semanal de modelos ML</li>
        </ul>
      </div>
    </div>
  );
}
