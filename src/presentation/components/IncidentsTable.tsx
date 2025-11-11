// @ts-nocheck
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Check, X, Trash2 } from 'lucide-react';
import useIncidentes from '../../application/hooks/useIncidentes';
import { Incidente } from '../../application/store/incident-store';
import toast from 'react-hot-toast';

interface IncidentsTableProps {
  incidents: Incidente[];
  onSelectIncident: (incident: Incidente) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function IncidentsTable({
  incidents,
  onSelectIncident,
  onApprove,
  onReject,
  onCancel,
  totalPages,
  currentPage,
  onPageChange,
  loading,
}: IncidentsTableProps) {
  const { getStatusColor, getPriorityColor, formatDate, handleApprove, handleReject, handleCancel } =
    useIncidentes();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo');
      return;
    }
    try {
      await handleReject(id, rejectReason);
      toast.success('Incidente rechazado');
      setRejectingId(null);
      onReject?.(id);
    } catch (error) {
      toast.error('Error al rechazar incidente');
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <p className="text-slate-500 text-lg">No se encontraron incidentes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Código</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Descripción</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Prioridad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Solicitante</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Fecha Reporte</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-mono text-slate-900">{incident.codigo}</td>
                <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                  {incident.descripcionOriginal}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.estadoIncidente)}`}>
                    {incident.estadoIncidente.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${getPriorityColor(incident.prioridadFinal)}`}>
                    {incident.prioridadFinal || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <div>
                    <p className="font-medium">{incident.solicitante.nombreCompleto}</p>
                    <p className="text-xs text-slate-500">{incident.solicitante.telefono}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDate(incident.fechaReporte)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Approve Button */}
                    {(incident.estadoIncidente === 'RECIBIDO' ||
                      incident.estadoIncidente === 'ANALIZADO') && (
                      <button
                        onClick={() => {
                          handleApprove(incident.id);
                          onApprove?.(incident.id);
                          toast.success('Incidente aprobado');
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                        title="Aprobar"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    {/* Reject Button */}
                    {(incident.estadoIncidente === 'RECIBIDO' ||
                      incident.estadoIncidente === 'ANALIZADO') && (
                      <button
                        onClick={() => handleRejectClick(incident.id)}
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded transition"
                        title="Rechazar"
                      >
                        <X size={18} />
                      </button>
                    )}

                    {/* Cancel Button */}
                    {incident.estadoIncidente !== 'CANCELADO' &&
                      incident.estadoIncidente !== 'RECHAZADO' && (
                        <button
                          onClick={() => {
                            if (
                              confirm('¿Estás seguro de que quieres cancelar este incidente?')
                            ) {
                              handleCancel(incident.id, 'Cancelado por usuario');
                              onCancel?.(incident.id);
                              toast.success('Incidente cancelado');
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                          title="Cancelar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Motivo de Rechazo</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica por qué se rechaza este incidente..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRejectSubmit(rejectingId)}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Rechazar Incidente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm text-slate-600">
          Página <span className="font-semibold">{currentPage + 1}</span> de{' '}
          <span className="font-semibold">{totalPages || 1}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncidentsTable;
