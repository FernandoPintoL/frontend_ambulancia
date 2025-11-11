// @ts-nocheck
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { Evaluacion } from '../../data/repositories/decision-queries';

interface SeverityEvaluationProps {
  evaluacion: Evaluacion | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Component to display severity evaluation results
 * Shows severity level, confidence, and probability distribution
 */
export function SeverityEvaluation({
  evaluacion,
  loading = false,
  error = null,
  onRetry,
}: SeverityEvaluationProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold text-red-900">Error in Evaluation</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center">
        <Activity className="mx-auto text-slate-400 mb-2" size={32} />
        <p className="text-slate-600">No evaluation data available</p>
      </div>
    );
  }

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case 'CRITICO':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-100 text-red-800' };
      case 'ALTO':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' };
      case 'MEDIO':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' };
      case 'BAJO':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-100 text-green-800' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', badge: 'bg-slate-100 text-slate-800' };
    }
  };

  const getSeverityIcon = (severidad: string) => {
    switch (severidad) {
      case 'CRITICO':
        return <AlertCircle className="text-red-600" size={28} />;
      case 'ALTO':
        return <AlertTriangle className="text-orange-600" size={28} />;
      default:
        return <CheckCircle className="text-green-600" size={28} />;
    }
  };

  const colors = getSeverityColor(evaluacion.severidad);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg shadow-md p-6`}>
      {/* Severity Level */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">Severity Level</p>
          <div className="flex items-center gap-3">
            {getSeverityIcon(evaluacion.severidad)}
            <span className={`text-3xl font-bold ${colors.text}`}>{evaluacion.severidad}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
              {evaluacion.requiereTraslado ? 'Requires Transfer' : 'Local Care'}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6">
        <p className="text-slate-600 text-sm font-medium mb-2">Confidence Score</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                evaluacion.confianza > 0.8
                  ? 'bg-green-500'
                  : evaluacion.confianza > 0.6
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${evaluacion.confianza * 100}%` }}
            />
          </div>
          <span className={`text-lg font-semibold ${colors.text}`}>
            {(evaluacion.confianza * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="space-y-4">
        <p className="text-slate-600 text-sm font-medium">Probability Distribution</p>

        <div className="space-y-3">
          {/* Crítico */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-red-900">Crítico (Critical)</label>
              <span className="text-sm font-semibold text-red-700">
                {(evaluacion.probabilidades.critico * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evaluacion.probabilidades.critico * 100}%` }}
              />
            </div>
          </div>

          {/* Alto */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-orange-900">Alto (High)</label>
              <span className="text-sm font-semibold text-orange-700">
                {(evaluacion.probabilidades.alto * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evaluacion.probabilidades.alto * 100}%` }}
              />
            </div>
          </div>

          {/* Medio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-yellow-900">Medio (Medium)</label>
              <span className="text-sm font-semibold text-yellow-700">
                {(evaluacion.probabilidades.medio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-yellow-100 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evaluacion.probabilidades.medio * 100}%` }}
              />
            </div>
          </div>

          {/* Bajo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-green-900">Bajo (Low)</label>
              <span className="text-sm font-semibold text-green-700">
                {(evaluacion.probabilidades.bajo * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evaluacion.probabilidades.bajo * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-slate-300">
        <p className="text-xs text-slate-600">
          This assessment is based on patient vital signs and is intended to support clinical decision-making.
          Always follow local clinical protocols and medical professional judgment.
        </p>
      </div>
    </div>
  );
}

export default SeverityEvaluation;
