// @ts-nocheck
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface StateTransitionBadgeProps {
  currentState: string;
  onStateChange?: (newState: string, reason?: string) => Promise<void>;
  allowedTransitions?: string[];
  loading?: boolean;
}

const STATE_CONFIG: Record<string, { color: string; label: string; description: string }> = {
  RECIBIDO: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    label: 'Recibido',
    description: 'Incidente recibido y registrado',
  },
  EN_ANALISIS_TEXTO: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    label: 'Análisis de Texto',
    description: 'Analizando descripción textual',
  },
  EN_ANALISIS_IMAGEN: {
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    label: 'Análisis de Imagen',
    description: 'Analizando contenido multimedia',
  },
  ANALISIS_COMPLETADO: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Análisis Completado',
    description: 'Análisis completado, pendiente revisión',
  },
  ANALIZADO: {
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    label: 'Analizado',
    description: 'Análisis completado y revisado',
  },
  APROBADO: {
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Aprobado',
    description: 'Incidente aprobado',
  },
  RECHAZADO: {
    color: 'bg-red-100 text-red-800 border-red-300',
    label: 'Rechazado',
    description: 'Incidente rechazado',
  },
  CANCELADO: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    label: 'Cancelado',
    description: 'Incidente cancelado',
  },
};

const TRANSITION_RULES: Record<string, string[]> = {
  RECIBIDO: ['EN_ANALISIS_TEXTO', 'ANALIZADO', 'RECHAZADO', 'CANCELADO'],
  EN_ANALISIS_TEXTO: ['EN_ANALISIS_IMAGEN', 'ANALISIS_COMPLETADO', 'RECHAZADO', 'CANCELADO'],
  EN_ANALISIS_IMAGEN: ['ANALISIS_COMPLETADO', 'RECHAZADO', 'CANCELADO'],
  ANALISIS_COMPLETADO: ['ANALIZADO', 'RECHAZADO', 'CANCELADO'],
  ANALIZADO: ['APROBADO', 'RECHAZADO', 'CANCELADO'],
  APROBADO: [],
  RECHAZADO: [],
  CANCELADO: [],
};

export function StateTransitionBadge({
  currentState,
  onStateChange,
  allowedTransitions,
  loading = false,
}: StateTransitionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingState, setPendingState] = useState<string | null>(null);

  const config = STATE_CONFIG[currentState] || STATE_CONFIG.RECIBIDO;
  const availableTransitions = allowedTransitions || TRANSITION_RULES[currentState] || [];

  const handleTransitionClick = (newState: string) => {
    setPendingState(newState);

    // States that require a reason
    if (['RECHAZADO', 'CANCELADO'].includes(newState)) {
      setShowReasonInput(true);
    } else {
      handleStateChange(newState);
    }
  };

  const handleStateChange = async (newState: string) => {
    if (!onStateChange) {
      toast.error('No se puede cambiar el estado en este momento');
      return;
    }

    try {
      await onStateChange(newState, selectedReason || undefined);
      toast.success(`Estado cambió a ${STATE_CONFIG[newState]?.label || newState}`);
      setIsOpen(false);
      setShowReasonInput(false);
      setSelectedReason('');
      setPendingState(null);
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleConfirmReason = () => {
    if (!selectedReason.trim()) {
      toast.error('Debes proporcionar un motivo');
      return;
    }
    if (pendingState) {
      handleStateChange(pendingState);
    }
  };

  return (
    <div className="relative">
      {/* Current State Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || availableTransitions.length === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${config.color} ${
          availableTransitions.length === 0 || loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        }`}
      >
        <span className="font-semibold">{config.label}</span>
        {availableTransitions.length > 0 && <ChevronDown size={18} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && availableTransitions.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2">
          <div className="mb-2 px-3 py-2 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase">Cambiar Estado</p>
            <p className="text-xs text-slate-500 mt-1">{config.description}</p>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {availableTransitions.map((state) => {
              const targetConfig = STATE_CONFIG[state];
              return (
                <button
                  key={state}
                  onClick={() => handleTransitionClick(state)}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded transition ${targetConfig.color} hover:opacity-80 disabled:opacity-50 border`}
                >
                  <div className="font-semibold text-sm">{targetConfig.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{targetConfig.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {pendingState === 'RECHAZADO' ? 'Motivo del Rechazo' : 'Motivo de la Cancelación'}
            </h3>

            <textarea
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              placeholder={
                pendingState === 'RECHAZADO'
                  ? 'Explica por qué se rechaza este incidente...'
                  : 'Explica por qué se cancela este incidente...'
              }
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReasonInput(false);
                  setSelectedReason('');
                  setPendingState(null);
                }}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReason}
                disabled={loading || !selectedReason.trim()}
                className={`px-4 py-2 rounded text-white transition ${
                  pendingState === 'RECHAZADO'
                    ? 'bg-orange-600 hover:bg-orange-700 disabled:opacity-50'
                    : 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                }`}
              >
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StateTransitionBadge;
