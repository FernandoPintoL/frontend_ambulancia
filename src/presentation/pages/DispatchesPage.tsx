// @ts-nocheck
// @ts-nocheck
import { useState, useEffect } from 'react';
import { Filter, Plus, Search } from 'lucide-react';
import { useDispatch } from '../../application/hooks/useDispatch';
import { useWebSocket } from '../../application/hooks/useWebSocket';

export default function DispatchesPage() {
  const { dispatches, loading, loadDispatches } = useDispatch();
  const { subscribe } = useWebSocket();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    if (newFilter !== 'all') {
      loadDispatches(newFilter);
    } else {
      loadDispatches();
    }
  };

  // Setup WebSocket subscriptions for real-time dispatch updates
  useEffect(() => {
    const unsubCreated = subscribe('dispatch_created', () => {
      console.log('Dispatch created, reloading list');
      loadDispatches(filter !== 'all' ? filter : undefined);
    });

    const unsubStatusChanged = subscribe('dispatch_status_changed', () => {
      console.log('Dispatch status changed, reloading list');
      loadDispatches(filter !== 'all' ? filter : undefined);
    });

    const unsubCompleted = subscribe('dispatch_completed', () => {
      console.log('Dispatch completed, reloading list');
      loadDispatches(filter !== 'all' ? filter : undefined);
    });

    return () => {
      unsubCreated();
      unsubStatusChanged();
      unsubCompleted();
    };
  }, [subscribe, filter]);

  const filteredDispatches = dispatches.filter((dispatch) =>
    dispatch.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispatch.id?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despachos</h1>
          <p className="text-gray-600">Gestiona todas las solicitudes de ambulancia</p>
        </div>
        <a href="/dispatches/new" className="btn-primary flex items-center gap-2">
          <Plus />
          Nuevo Despacho
        </a>
      </div>

      <div className="card space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Filter />
            Filtros
          </button>
        </div>

        <div className="flex gap-2 border-b">
          {['all', 'pending', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status as typeof filter)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filter === status
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'all' && 'Todos'}
              {status === 'pending' && 'Pendientes'}
              {status === 'active' && 'Activos'}
              {status === 'completed' && 'Completados'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : filteredDispatches.length > 0 ? (
        <div className="grid gap-4">
          {filteredDispatches.map((dispatch) => (
            <a
              key={dispatch.id}
              href={`/dispatches/${dispatch.id}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{dispatch.patientName}</h3>
                  <p className="text-gray-600 text-sm">ID: {dispatch.id}</p>
                  <p className="text-gray-600 text-sm">{dispatch.description}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    dispatch.status === 'pending' ? 'badge-warning' :
                    dispatch.status === 'active' ? 'badge-info' :
                    'badge-success'
                  }`}>
                    {dispatch.status}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">No hay despachos disponibles</p>
        </div>
      )}
    </div>
  );
}
