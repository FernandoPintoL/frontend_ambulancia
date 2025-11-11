// @ts-nocheck
import React, { useState } from 'react';
import { MapPin, Phone, Navigation, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { GoogleMap } from './GoogleMap';
import { RecomendacionHospitales, HospitalRecomendado } from '../../data/repositories/decision-queries';
import toast from 'react-hot-toast';

interface HospitalRecommendationCardProps {
  recomendaciones: RecomendacionHospitales | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  userLocation?: { lat: number; lng: number };
}

/**
 * Component to display hospital recommendations
 * Shows recommended hospitals with distances and availability
 */
export function HospitalRecommendationCard({
  recomendaciones,
  loading = false,
  error = null,
  onRetry,
  userLocation,
}: HospitalRecommendationCardProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecomendado | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold text-red-900">Error Getting Recommendations</h3>
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

  if (!recomendaciones || !recomendaciones.hospitalesRecomendados || recomendaciones.hospitalesRecomendados.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-yellow-600 mb-2" size={32} />
        <p className="text-yellow-900 font-medium">No hospitals available</p>
        <p className="text-yellow-700 text-sm mt-1">There are no hospitals available in your area</p>
      </div>
    );
  }

  // Convert hospitals to map markers
  const hospitalMarkers = recomendaciones.hospitalesRecomendados.map((hospital, index) => ({
    id: hospital.hospitalId,
    lat: hospital.ubicacion.latitud,
    lng: hospital.ubicacion.longitud,
    label: `${index + 1}. ${hospital.nombre}`,
    color: index === 0 ? 'FF0000' : '0000FF', // Red for first recommendation, blue for others
    info: `${hospital.nombre} - ${hospital.distanciaKm.toFixed(1)} km`,
  }));

  // Add user location if available
  const initialCenter = userLocation || hospitalMarkers[0];

  const handleDirections = (hospital: HospitalRecomendado) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.ubicacion.latitud},${hospital.ubicacion.longitud}&destination_place_id=${hospital.hospitalId}`;
    window.open(mapsUrl, '_blank');
    toast.success('Opening directions in Google Maps');
  };

  const handleCall = (hospital: HospitalRecomendado) => {
    toast.success('Emergency contact feature coming soon');
  };

  const getLevelColor = (nivel: string) => {
    switch (nivel) {
      case 'IV':
        return 'bg-red-100 text-red-800';
      case 'III':
        return 'bg-orange-100 text-orange-800';
      case 'II':
        return 'bg-yellow-100 text-yellow-800';
      case 'I':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCapacityIndicator = (disponibilidad: number) => {
    if (disponibilidad >= 70) return { color: 'text-green-600', label: 'Available' };
    if (disponibilidad >= 40) return { color: 'text-yellow-600', label: 'Moderate' };
    return { color: 'text-red-600', label: 'Limited' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Hospital Recommendations</h2>
          <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-semibold text-sm">
            {recomendaciones.hospitalesRecomendados.length} Found
          </span>
        </div>
        <p className="text-blue-100 text-sm">{recomendaciones.mensaje}</p>
        <p className="text-blue-100 text-xs mt-2">
          Cluster: {recomendaciones.clusterUtilizado} • Specialties: {recomendaciones.especialidadesCluster.join(', ')}
        </p>
      </div>

      {/* View Toggle */}
      <div className="border-b border-slate-200 p-4 flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-md transition ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-md transition ${
            viewMode === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Map View
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'list' ? (
          // List View
          <div className="space-y-4">
            {recomendaciones.hospitalesRecomendados.map((hospital, index) => {
              const capacity = getCapacityIndicator(hospital.disponibilidadPorcentaje);
              return (
                <div
                  key={hospital.hospitalId}
                  className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                    selectedHospital?.hospitalId === hospital.hospitalId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  {/* Ranking Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{hospital.nombre}</h3>
                        <p className="text-xs text-slate-500">{hospital.ubicacion.direccion}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(hospital.nivel)}`}>
                      Level {hospital.nivel}
                    </span>
                  </div>

                  {/* Hospital Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Distance */}
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-600">Distance</p>
                        <p className="font-semibold text-slate-900">{hospital.distanciaKm.toFixed(1)} km</p>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-600">Availability</p>
                        <div className="flex items-center gap-1">
                          <p className={`font-semibold ${capacity.color}`}>{hospital.disponibilidadPorcentaje}%</p>
                          <CheckCircle2 size={14} className={capacity.color} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Capacity</span>
                      <span className="text-xs font-semibold text-slate-900">{hospital.disponibilidadPorcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          hospital.disponibilidadPorcentaje >= 70
                            ? 'bg-green-500'
                            : hospital.disponibilidadPorcentaje >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${hospital.disponibilidadPorcentaje}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDirections(hospital)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <Navigation size={16} />
                      Directions
                    </button>
                    <button
                      onClick={() => handleCall(hospital)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition text-sm font-medium"
                    >
                      <Phone size={16} />
                      Call
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Map View
          <div className="space-y-4">
            <GoogleMap
              initialCenter={initialCenter}
              markers={hospitalMarkers}
              onMarkerSelected={(marker) => {
                const hospital = recomendaciones.hospitalesRecomendados.find((h) => h.hospitalId === marker.id);
                if (hospital) setSelectedHospital(hospital);
              }}
              readOnly={true}
              showSearchBar={false}
              showDistance={false}
              height="400px"
              zoom={13}
            />

            {selectedHospital && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedHospital.nombre}</h3>
                <p className="text-sm text-slate-600 mb-3">{selectedHospital.ubicacion.direccion}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDirections(selectedHospital)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 p-4">
        <p className="text-xs text-slate-600">
          These recommendations are based on patient severity assessment, hospital specialties, and current capacity.
          Always prioritize the nearest appropriate facility in emergencies.
        </p>
      </div>
    </div>
  );
}

export default HospitalRecommendationCard;
