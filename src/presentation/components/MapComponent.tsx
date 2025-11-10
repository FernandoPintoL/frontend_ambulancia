import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  originLat?: number;
  originLon?: number;
  destinationLat?: number;
  destinationLon?: number;
  ambulanceLat?: number;
  ambulanceLon?: number;
  height?: string;
  markerLabel?: string;
}

/**
 * MapComponent - Displays a map with markers for origin, destination, and ambulance location
 */
export default function MapComponent({
  originLat,
  originLon,
  destinationLat,
  destinationLon,
  ambulanceLat,
  ambulanceLon,
  height = '400px',
  markerLabel = 'Ubicación',
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Custom icons
  const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const ambulanceIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map - Default to Bogotá coordinates if no location provided
    const defaultLat = originLat || 4.7110;
    const defaultLon = originLon || -74.0721;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLon], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add origin marker
    if (originLat !== undefined && originLon !== undefined) {
      L.marker([originLat, originLon], {
        icon: originIcon,
        title: 'Punto de Origen',
      })
        .addTo(mapRef.current)
        .bindPopup(`<div class="text-sm"><strong>Origen</strong><br/>Lat: ${originLat.toFixed(4)}<br/>Lon: ${originLon.toFixed(4)}</div>`);
    }

    // Add destination marker
    if (destinationLat !== undefined && destinationLon !== undefined) {
      L.marker([destinationLat, destinationLon], {
        icon: destinationIcon,
        title: 'Destino',
      })
        .addTo(mapRef.current)
        .bindPopup(`<div class="text-sm"><strong>Destino</strong><br/>Lat: ${destinationLat.toFixed(4)}<br/>Lon: ${destinationLon.toFixed(4)}</div>`);
    }

    // Add ambulance marker
    if (ambulanceLat !== undefined && ambulanceLon !== undefined) {
      L.marker([ambulanceLat, ambulanceLon], {
        icon: ambulanceIcon,
        title: 'Ambulancia',
      })
        .addTo(mapRef.current)
        .bindPopup(`<div class="text-sm"><strong>Ambulancia en Ruta</strong><br/>Lat: ${ambulanceLat.toFixed(4)}<br/>Lon: ${ambulanceLon.toFixed(4)}</div>`);
    }

    // Adjust map bounds to show all markers
    const group = new L.FeatureGroup();
    if (originLat !== undefined && originLon !== undefined) {
      group.addLayer(L.marker([originLat, originLon]));
    }
    if (destinationLat !== undefined && destinationLon !== undefined) {
      group.addLayer(L.marker([destinationLat, destinationLon]));
    }
    if (ambulanceLat !== undefined && ambulanceLon !== undefined) {
      group.addLayer(L.marker([ambulanceLat, ambulanceLon]));
    }

    if (group.getLayers().length > 0) {
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.off();
      }
    };
  }, [originLat, originLon, destinationLat, destinationLon, ambulanceLat, ambulanceLon]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: '100%',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
      }}
      className="border border-gray-300"
    />
  );
}
