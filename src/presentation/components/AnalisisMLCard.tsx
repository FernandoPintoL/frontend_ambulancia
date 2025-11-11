// @ts-nocheck
import React from 'react';
import { Zap, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface AnalisisMLProps {
  textoAnalizado?: string;
  prioridadCalculada?: number;
  nivelGravedad?: number;
  tipoIncidentePredicho?: string;
  categoriasDetectadas?: Record<string, any>;
  scoreConfianza?: number;
  estadoAnalisis?: string;
}

export function AnalisisMLCard({
  textoAnalizado,
  prioridadCalculada,
  nivelGravedad,
  tipoIncidentePredicho,
  categoriasDetectadas,
  scoreConfianza,
  estadoAnalisis,
}: AnalisisMLProps) {
  const getGravityColor = (gravity?: number): string => {
    if (!gravity) return 'bg-gray-100 text-gray-800';
    if (gravity >= 4) return 'bg-red-100 text-red-800';
    if (gravity >= 3) return 'bg-orange-100 text-orange-800';
    if (gravity >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityColor = (priority?: number): string => {
    if (!priority) return 'text-gray-500';
    if (priority >= 4) return 'text-red-600';
    if (priority >= 3) return 'text-orange-600';
    if (priority >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAnalysisStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      COMPLETADO: {
        bg: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={16} />,
        label: 'Análisis Completado',
      },
      EN_PROGRESO: {
        bg: 'bg-blue-100 text-blue-800',
        icon: <Zap size={16} className="animate-spin" />,
        label: 'En Progreso',
      },
      ERROR: {
        bg: 'bg-red-100 text-red-800',
        icon: <AlertCircle size={16} />,
        label: 'Error en Análisis',
      },
    };
    return statusConfig[status || 'COMPLETADO'] || statusConfig.COMPLETADO;
  };

  const status = getAnalysisStatusBadge(estadoAnalisis);
  const categories = categoriasDetectadas || {};

  if (!estadoAnalisis) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto mb-2 text-slate-400" size={32} />
          <p className="text-slate-500 text-sm">No hay análisis disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200 space-y-4">
      {/* Header with Status */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Análisis ML</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg}`}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      {/* Prediction Section */}
      {tipoIncidentePredicho && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tipo de Incidente Predicho</label>
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-md border border-indigo-200">
            <TrendingUp size={18} className="text-indigo-600" />
            <span className="text-indigo-900 font-medium">{tipoIncidentePredicho}</span>
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {scoreConfianza !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Confianza del Análisis</label>
            <span className="text-sm font-semibold text-slate-900">{(scoreConfianza * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                scoreConfianza >= 0.8
                  ? 'bg-green-500'
                  : scoreConfianza >= 0.6
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${scoreConfianza * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Priority and Gravity Grid */}
      <div className="grid grid-cols-2 gap-4">
        {prioridadCalculada !== undefined && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Prioridad Calculada</label>
            <div className={`text-3xl font-bold ${getPriorityColor(prioridadCalculada)}`}>
              {prioridadCalculada}
            </div>
          </div>
        )}

        {nivelGravedad !== undefined && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nivel de Gravedad</label>
            <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getGravityColor(nivelGravedad)}`}>
              {nivelGravedad}
            </div>
          </div>
        )}
      </div>

      {/* Detected Categories */}
      {Object.keys(categories).length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Categorías Detectadas</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([category, value]) => (
              <div
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700"
              >
                <span className="font-medium">{category}:</span>
                <span>{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyzed Text */}
      {textoAnalizado && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Texto Procesado</label>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-700 max-h-32 overflow-y-auto">
            {textoAnalizado}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalisisMLCard;
