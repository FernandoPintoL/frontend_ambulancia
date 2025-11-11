// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Tag, FileText, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useIncidentes from '../../application/hooks/useIncidentes';
import useDecisionRecommendation from '../../application/hooks/useDecisionRecommendation';
import usePatientVitals from '../../application/hooks/usePatientVitals';
import { AnalisisMLCard } from '../components/AnalisisMLCard';
import { StateTransitionBadge } from '../components/StateTransitionBadge';
import { GoogleMap } from '../components/GoogleMap';
import { SeverityEvaluation } from '../components/SeverityEvaluation';
import { HospitalRecommendationCard } from '../components/HospitalRecommendationCard';
import toast from 'react-hot-toast';

export function IncidenteDetallesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedIncident,
    loading,
    fetchIncidentDetail,
    handleChangeState,
    formatDate,
    getStatusColor,
    getPriorityColor,
  } = useIncidentes();

  // Decision support hooks
  const {
    loading: decisionLoading,
    error: decisionError,
    evaluacion,
    recomendaciones,
    evaluarPaciente,
    recomendarHospitales,
    clearError: clearDecisionError,
  } = useDecisionRecommendation();

  const { vitals, updateVitals } = usePatientVitals();
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIncidentDetail(id);
    }
  }, [id, fetchIncidentDetail]);

  const handleEvaluatePatient = async () => {
    // Validate that we have vital signs
    if (!vitals.edad || !vitals.presionSistolica || !vitals.temperatura) {
      toast.error('Por favor, ingresa los signos vitales del paciente');
      return;
    }

    // Call evaluation
    const result = await evaluarPaciente(vitals);
    if (result) {
      toast.success('Evaluación de severidad completada');
    }
  };

  const handleRecommendHospitals = async () => {
    if (!evaluacion) {
      toast.error('Primero debe evaluar la severidad del paciente');
      return;
    }

    if (!selectedIncident?.ubicacion?.latitud || !selectedIncident?.ubicacion?.longitud) {
      toast.error('La ubicación del incidente no tiene coordenadas válidas');
      return;
    }

    const result = await recomendarHospitales(vitals, {
      latitud: selectedIncident.ubicacion.latitud,
      longitud: selectedIncident.ubicacion.longitud,
    });
    if (result) {
      toast.success('Recomendaciones de hospitales obtenidas');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalles del incidente...</p>
        </div>
      </div>
    );
  }

  if (!selectedIncident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mb-6"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-slate-500 text-lg">No se encontró el incidente</p>
          </div>
        </div>
      </div>
    );
  }

  const incident = selectedIncident;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft size={18} />
          Volver al Listado
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">Código: {incident.codigo}</h1>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(incident.estadoIncidente)}`}>
                  {incident.estadoIncidente.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                Reportado el {formatDate(incident.fechaReporte)}
              </p>
            </div>

            {incident.prioridadFinal && (
              <div className="text-right">
                <p className="text-slate-600 text-sm mb-2">Prioridad Final</p>
                <div className={`text-4xl font-bold ${getPriorityColor(incident.prioridadFinal)}`}>
                  {incident.prioridadFinal}
                </div>
              </div>
            )}
          </div>

          {/* State Transition */}
          <div className="pt-4 border-t border-slate-200">
            <StateTransitionBadge
              currentState={incident.estadoIncidente}
              onStateChange={handleChangeState}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción del Incidente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Descripción del Incidente
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Descripción Original</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-md">{incident.descripcionOriginal}</p>
                </div>

                {incident.tipoIncidenteReportado && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Tipo de Incidente Reportado</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-md">{incident.tipoIncidenteReportado}</p>
                  </div>
                )}

                {incident.tipoIncidenteClasificado && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Tipo de Incidente Clasificado</p>
                    <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                      {incident.tipoIncidenteClasificado}
                    </div>
                  </div>
                )}

                {incident.observaciones && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Observaciones</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-md">{incident.observaciones}</p>
                  </div>
                )}

                {incident.motivoRechazo && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Motivo del Rechazo</p>
                    <p className="text-red-700 bg-red-50 p-3 rounded-md border border-red-200">{incident.motivoRechazo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ML Analysis Card */}
            {incident.analisisTexto && (
              <AnalisisMLCard
                textoAnalizado={incident.analisisTexto.textoAnalizado}
                prioridadCalculada={incident.analisisTexto.prioridadCalculada}
                nivelGravedad={incident.analisisTexto.nivelGravedad}
                tipoIncidentePredicho={incident.analisisTexto.tipoIncidentePredicho}
                categoriasDetectadas={incident.analisisTexto.categoriasDetectadas}
                scoreConfianza={incident.analisisTexto.scoreConfianza}
                estadoAnalisis={incident.analisisTexto.estadoAnalisis}
              />
            )}

            {/* Location Map */}
            {incident.ubicacion && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Ubicación del Incidente
                </h2>
                <GoogleMap
                  initialCenter={
                    incident.ubicacion.latitud && incident.ubicacion.longitud
                      ? { lat: incident.ubicacion.latitud, lng: incident.ubicacion.longitud }
                      : undefined
                  }
                  markers={
                    incident.ubicacion.latitud && incident.ubicacion.longitud
                      ? [
                          {
                            id: `incident_${incident.id}`,
                            lat: incident.ubicacion.latitud,
                            lng: incident.ubicacion.longitud,
                            label: 'Incidente',
                            color: 'FF0000',
                            info: incident.ubicacion.descripcionTextual,
                          },
                        ]
                      : []
                  }
                  readOnly={true}
                  showSearchBar={false}
                  showDistance={false}
                  height="500px"
                  zoom={15}
                />
              </div>
            )}

            {/* Clinical Decision Support Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={20} className="text-blue-600" />
                  Soporte de Decisión Clínica
                </h2>
                <button
                  onClick={() => setShowDecisionPanel(!showDecisionPanel)}
                  className={`px-4 py-2 rounded-lg transition ${
                    showDecisionPanel
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {showDecisionPanel ? 'Contraer' : 'Expandir'}
                </button>
              </div>

              {showDecisionPanel && (
                <div className="space-y-6">
                  {/* Patient Vitals Input */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Signos Vitales del Paciente</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Edad (años)</label>
                        <input
                          type="number"
                          value={vitals.edad || ''}
                          onChange={(e) => updateVitals({ edad: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 45"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Sexo</label>
                        <select
                          value={vitals.sexo}
                          onChange={(e) => updateVitals({ sexo: e.target.value as 'M' | 'F' })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Presión Sistólica (mmHg)</label>
                        <input
                          type="number"
                          value={vitals.presionSistolica || ''}
                          onChange={(e) => updateVitals({ presionSistolica: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 120"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Presión Diastólica (mmHg)</label>
                        <input
                          type="number"
                          value={vitals.presionDiastolica || ''}
                          onChange={(e) => updateVitals({ presionDiastolica: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 80"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">FC (bpm)</label>
                        <input
                          type="number"
                          value={vitals.frecuenciaCardiaca || ''}
                          onChange={(e) => updateVitals({ frecuenciaCardiaca: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 80"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">FR (resp/min)</label>
                        <input
                          type="number"
                          value={vitals.frecuenciaRespiratoria || ''}
                          onChange={(e) => updateVitals({ frecuenciaRespiratoria: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 16"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Temperatura (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={vitals.temperatura || ''}
                          onChange={(e) => updateVitals({ temperatura: parseFloat(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 37.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">O2 Saturación (%)</label>
                        <input
                          type="number"
                          value={vitals.saturacionOxigeno || ''}
                          onChange={(e) => updateVitals({ saturacionOxigeno: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 98"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Nivel de Dolor (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={vitals.nivelDolor || ''}
                          onChange={(e) => updateVitals({ nivelDolor: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Tipo de Incidente</label>
                        <input
                          type="text"
                          value={vitals.tipoIncidente}
                          onChange={(e) => updateVitals({ tipoIncidente: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: Traumatismo"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Tiempo desde Incidente (min)</label>
                        <input
                          type="number"
                          value={vitals.tiempoDesdeIncidente || ''}
                          onChange={(e) => updateVitals({ tiempoDesdeIncidente: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ej: 15"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleEvaluatePatient}
                      disabled={decisionLoading}
                      className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400 font-semibold"
                    >
                      {decisionLoading ? 'Evaluando...' : 'Evaluar Severidad'}
                    </button>
                  </div>

                  {/* Severity Evaluation Results */}
                  {evaluacion && (
                    <div className="border-t border-slate-200 pt-6">
                      <SeverityEvaluation
                        evaluacion={evaluacion}
                        error={decisionError}
                        loading={decisionLoading}
                        onRetry={handleEvaluatePatient}
                      />

                      <button
                        onClick={handleRecommendHospitals}
                        disabled={decisionLoading}
                        className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-slate-400 font-semibold"
                      >
                        {decisionLoading ? 'Obteniendo recomendaciones...' : 'Obtener Recomendaciones de Hospitales'}
                      </button>
                    </div>
                  )}

                  {/* Hospital Recommendations */}
                  {recomendaciones && (
                    <div className="border-t border-slate-200 pt-6">
                      <HospitalRecommendationCard
                        recomendaciones={recomendaciones}
                        loading={decisionLoading}
                        error={decisionError}
                        onRetry={handleRecommendHospitals}
                        userLocation={
                          incident.ubicacion?.latitud && incident.ubicacion?.longitud
                            ? { lat: incident.ubicacion.latitud, lng: incident.ubicacion.longitud }
                            : undefined
                        }
                      />
                    </div>
                  )}

                  {decisionError && !recomendaciones && (
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{decisionError}</p>
                      <button
                        onClick={clearDecisionError}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Solicitante Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Solicitante</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">
                      {incident.solicitante.nombreCompleto.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Nombre</p>
                    <p className="text-slate-900 font-medium">{incident.solicitante.nombreCompleto}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <Phone size={16} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Teléfono</p>
                    <a href={`tel:${incident.solicitante.telefono}`} className="text-blue-600 hover:underline font-medium">
                      {incident.solicitante.telefono}
                    </a>
                  </div>
                </div>

                {incident.solicitante.email && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <Mail size={16} className="text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Email</p>
                      <a href={`mailto:${incident.solicitante.email}`} className="text-blue-600 hover:underline font-medium">
                        {incident.solicitante.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <Tag size={16} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Canal de Origen</p>
                    <p className="text-slate-900 font-medium">{incident.solicitante.canalOrigen}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details Card */}
            {incident.ubicacion && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Detalles de Ubicación</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Descripción</p>
                    <p className="text-slate-900 text-sm mt-1">{incident.ubicacion.descripcionTextual}</p>
                  </div>

                  {incident.ubicacion.ciudad && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold">Provincia/Ciudad</p>
                      <p className="text-slate-900 font-medium mt-1">{incident.ubicacion.ciudad}</p>
                    </div>
                  )}

                  {incident.ubicacion.distrito && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold">Distrito</p>
                      <p className="text-slate-900 font-medium mt-1">{incident.ubicacion.distrito}</p>
                    </div>
                  )}

                  {incident.ubicacion.latitud && incident.ubicacion.longitud && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold">Coordenadas</p>
                      <p className="text-slate-900 font-mono text-sm mt-1">
                        {incident.ubicacion.latitud.toFixed(6)}, {incident.ubicacion.longitud.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Cronología</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Calendar size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600">Fecha de Reporte</p>
                    <p className="text-slate-900 font-medium text-sm">{formatDate(incident.fechaReporte)}</p>
                  </div>
                </div>

                {incident.fechaAnalisisCompletado && (
                  <div className="flex gap-3 pt-3 border-t border-slate-200">
                    <Calendar size={16} className="text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-600">Análisis Completado</p>
                      <p className="text-slate-900 font-medium text-sm">{formatDate(incident.fechaAnalisisCompletado)}</p>
                    </div>
                  </div>
                )}

                {incident.fechaUltimaActualizacion && (
                  <div className="flex gap-3 pt-3 border-t border-slate-200">
                    <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-600">Última Actualización</p>
                      <p className="text-slate-900 font-medium text-sm">{formatDate(incident.fechaUltimaActualizacion)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidenteDetallesPage;
