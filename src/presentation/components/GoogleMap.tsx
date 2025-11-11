// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, Trash2, Plus } from 'lucide-react';
import { googleMapsService } from '../../data/repositories/google-maps-service';
import toast from 'react-hot-toast';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color?: string;
  info?: string;
}

interface GoogleMapProps {
  initialCenter?: { lat: number; lng: number };
  markers?: Marker[];
  onMarkerSelected?: (marker: Marker) => void;
  onLocationSelected?: (location: { lat: number; lng: number }) => void;
  onMarkersChanged?: (markers: Marker[]) => void;
  height?: string;
  zoom?: number;
  showSearchBar?: boolean;
  readOnly?: boolean;
  showDistance?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleMap({
  initialCenter = { lat: 4.6097, lng: -74.0817 }, // Bogotá
  markers: initialMarkers = [],
  onMarkerSelected,
  onLocationSelected,
  onMarkersChanged,
  height = '500px',
  zoom = 13,
  showSearchBar = true,
  readOnly = false,
  showDistance = true,
}: GoogleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapMarkers = useRef<Map<string, any>>(new Map());
  const [markers, setMarkers] = useState<Marker[]>(initialMarkers);
  const [searchValue, setSearchValue] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !window.google) {
      setError('Google Maps no está disponible');
      setIsLoading(false);
      return;
    }

    try {
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: zoom,
        center: initialCenter,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add click listener if not readonly
      if (!readOnly) {
        map.current.addListener('click', (event: any) => {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };

          const newMarker: Marker = {
            id: `marker_${Date.now()}`,
            lat: location.lat,
            lng: location.lng,
            label: `Punto ${markers.length + 1}`,
            color: 'FF0000',
          };

          setMarkers([...markers, newMarker]);
          onLocationSelected?.(location);
          toast.success('Marcador agregado', { icon: '📍' });
        });
      }

      setIsLoading(false);
    } catch (err) {
      setError('Error inicializando el mapa');
      setIsLoading(false);
    }
  }, []);

  // Add/update markers on map
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    mapMarkers.current.forEach((marker) => marker.setMap(null));
    mapMarkers.current.clear();

    // Add new markers
    markers.forEach((markerData) => {
      const googleMarker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: map.current,
        title: markerData.label,
        icon: googleMapsService.createMarkerIconUrl(markerData.color || 'FF0000', markerData.label.charAt(0)),
      });

      // Add click listener to marker
      googleMarker.addListener('click', () => {
        setSelectedMarker(markerData);
        onMarkerSelected?.(markerData);

        // Show info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-size: 12px;">
              <strong>${markerData.label}</strong><br/>
              Lat: ${markerData.lat.toFixed(4)}<br/>
              Lng: ${markerData.lng.toFixed(4)}<br/>
              ${markerData.info ? `<p>${markerData.info}</p>` : ''}
            </div>
          `,
        });
        infoWindow.open(map.current, googleMarker);
      });

      mapMarkers.current.set(markerData.id, googleMarker);
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });
      const paddedBounds = googleMapsService.padBounds(
        { ne: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
          sw: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() } },
        15
      );
      map.current.fitBounds(paddedBounds);
    } else if (markers.length === 1) {
      map.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.current.setZoom(15);
    }

    onMarkersChanged?.(markers);
  }, [markers, onMarkerSelected, onMarkersChanged, readOnly]);

  const handleSearch = async () => {
    if (!searchValue.trim() || !window.google) {
      toast.error('Ingresa una dirección o lugar');
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: searchValue }, (results: any, status: any) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;
          const newLocation = {
            lat: location.lat(),
            lng: location.lng(),
          };

          map.current.setCenter(newLocation);
          map.current.setZoom(15);

          if (!readOnly) {
            const newMarker: Marker = {
              id: `marker_${Date.now()}`,
              lat: newLocation.lat,
              lng: newLocation.lng,
              label: results[0].formatted_address.split(',')[0],
              color: 'FF0000',
            };

            setMarkers([...markers, newMarker]);
            setSearchValue('');
            toast.success('Ubicación encontrada', { icon: '✅' });
          }
        } else {
          toast.error('Ubicación no encontrada');
        }
      });
    } catch (err) {
      toast.error('Error buscando ubicación');
    }
  };

  const handleDeleteMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
    setSelectedMarker(null);
    toast.success('Marcador eliminado');
  };

  const handleClearAll = () => {
    setMarkers([]);
    setSelectedMarker(null);
    toast.success('Todos los marcadores fueron eliminados');
  };

  const calculateTotalDistance = () => {
    if (markers.length < 2) return 0;

    const locations = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
    return googleMapsService.calculateRouteDistance(locations);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-slate-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-red-50 border border-red-200" style={{ height }}>
        <div className="text-center">
          <MapPin className="mx-auto mb-2 text-red-400" size={32} />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-1">Asegúrate que Google Maps esté disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      {showSearchBar && !readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Busca una dirección o lugar..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Search size={18} />
            Buscar
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-lg">
        <div ref={mapContainer} style={{ height, width: '100%' }} />

        {/* Controls */}
        {!readOnly && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleClearAll}
              className="p-2 bg-white border border-slate-300 rounded-lg shadow hover:bg-red-50 transition"
              title="Eliminar todos los marcadores"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Markers Info */}
      {markers.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Marcadores ({markers.length})</h3>
            {showDistance && markers.length > 1 && (
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Distancia total: {googleMapsService.formatDistance(calculateTotalDistance())}
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                  selectedMarker?.id === marker.id ? 'bg-blue-100 border border-blue-300' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => {
                  setSelectedMarker(marker);
                  map.current?.setCenter({ lat: marker.lat, lng: marker.lng });
                  map.current?.setZoom(16);
                }}
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{marker.label}</p>
                  <p className="text-xs text-slate-600">{googleMapsService.formatLocation({ lat: marker.lat, lng: marker.lng })}</p>
                </div>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMarker(marker.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-green-900">Detalles del Marcador</h4>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Nombre:</strong> {selectedMarker.label}
            </p>
            <p>
              <strong>Latitud:</strong> {selectedMarker.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitud:</strong> {selectedMarker.lng.toFixed(6)}
            </p>
            {selectedMarker.info && (
              <p>
                <strong>Información:</strong> {selectedMarker.info}
              </p>
            )}
          </div>

          <a
            href={googleMapsService.getDirectionsUrl(selectedMarker, selectedMarker)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <Navigation size={16} />
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default GoogleMap;
