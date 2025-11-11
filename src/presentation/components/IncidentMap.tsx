// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
}

interface IncidentMapProps {
  initialLocation?: Location;
  onLocationSelect?: (location: Location) => void;
  readOnly?: boolean;
  height?: string;
  showAddress?: boolean;
  address?: string;
}

declare global {
  interface Window {
    L?: any;
  }
}

export function IncidentMap({
  initialLocation,
  onLocationSelect,
  readOnly = false,
  height = '400px',
  showAddress = false,
  address,
}: IncidentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Leaflet and create map
  useEffect(() => {
    // Check if Leaflet is available
    if (!window.L) {
      setMapError('Leaflet no está disponible. Por favor, incluye la biblioteca de mapas.');
      setIsLoading(false);
      return;
    }

    if (!mapContainer.current) return;

    try {
      // Initialize map
      const center = initialLocation || { lat: -12.0464, lng: -77.0428 }; // Lima, Peru default
      map.current = window.L.map(mapContainer.current).setView([center.lat, center.lng], 13);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Add initial marker if location provided
      if (initialLocation) {
        marker.current = window.L.marker([initialLocation.lat, initialLocation.lng]).addTo(map.current);
        marker.current.bindPopup(`<strong>Ubicación</strong><br/>Lat: ${initialLocation.lat.toFixed(4)}<br/>Lng: ${initialLocation.lng.toFixed(4)}`);
      }

      // Add click handler if not readonly
      if (!readOnly) {
        map.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const location = { lat, lng };
          setSelectedLocation(location);

          // Update or create marker
          if (marker.current) {
            marker.current.setLatLng([lat, lng]);
          } else {
            marker.current = window.L.marker([lat, lng]).addTo(map.current);
          }

          marker.current.bindPopup(
            `<strong>Ubicación Seleccionada</strong><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`
          );
          marker.current.openPopup();

          onLocationSelect?.(location);
          toast.success('Ubicación seleccionada');
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error al inicializar el mapa');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation, readOnly, onLocationSelect]);

  const handleClearLocation = () => {
    if (readOnly) return;

    setSelectedLocation(null);
    if (marker.current) {
      map.current.removeLayer(marker.current);
      marker.current = null;
    }
    onLocationSelect?.(null as any);
    toast.success('Ubicación eliminada');
  };

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleCenter = () => {
    if (selectedLocation && map.current) {
      map.current.setView([selectedLocation.lat, selectedLocation.lng], 15);
    } else if (initialLocation && map.current) {
      map.current.setView([initialLocation.lat, initialLocation.lng], 15);
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
            <MapPin size={16} />
            <span>Haz clic en el mapa para seleccionar una ubicación</span>
          </div>

          {selectedLocation && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleCenter}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Centrar
              </button>
              <button
                onClick={handleClearLocation}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-1"
              >
                <X size={14} />
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-green-800 text-sm">Ubicación Seleccionada</p>
              <p className="text-sm text-green-700 mt-1">
                Lat: <span className="font-mono">{selectedLocation.lat.toFixed(6)}</span>
              </p>
              <p className="text-sm text-green-700">
                Lng: <span className="font-mono">{selectedLocation.lng.toFixed(6)}</span>
              </p>
              {showAddress && address && (
                <p className="text-sm text-green-700 mt-1">
                  Dirección: <span className="font-medium">{address}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      {mapError ? (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-6" style={{ height }}>
          <div className="text-center">
            <MapPin className="mx-auto mb-2 text-red-400" size={32} />
            <p className="text-red-700 font-medium">{mapError}</p>
            <p className="text-red-600 text-sm mt-1">
              Asegúrate de incluir Leaflet en tu HTML: &lt;link href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"&gt;
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-slate-600 text-sm">Cargando mapa...</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <div ref={mapContainer} style={{ height }} className="bg-slate-100" />

          {/* Zoom Controls */}
          {!readOnly && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white border border-slate-300 rounded shadow hover:bg-slate-50 flex items-center justify-center text-lg font-bold transition"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white border border-slate-300 rounded shadow hover:bg-slate-50 flex items-center justify-center text-lg font-bold transition"
                title="Zoom Out"
              >
                −
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!readOnly && (
        <p className="text-xs text-slate-500 text-center">
          Para usar el mapa, debes incluir Leaflet en tu archivo HTML de índice.
        </p>
      )}
    </div>
  );
}

export default IncidentMap;
