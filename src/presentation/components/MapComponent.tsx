// @ts-nocheck
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface TrackingPoint {
  latitude: number;
  longitude: number;
  velocidad?: number;
  timestamp?: string;
}

interface MapComponentProps {
  originLat?: number;
  originLon?: number;
  destinationLat?: number;
  destinationLon?: number;
  ambulanceLat?: number;
  ambulanceLon?: number;
  trackingPoints?: TrackingPoint[];
  height?: string;
  markerLabel?: string;
  showRoute?: boolean;
  showTrackingPoints?: boolean;
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
  trackingPoints = [],
  height = '400px',
  markerLabel = 'Ubicación',
  showRoute = true,
  showTrackingPoints = true,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const trackingMarkersRef = useRef<L.Marker[]>([]);

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

  /**
   * Create numbered marker icon
   */
  const createNumberedIcon = (number: number, color: string) => {
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${number}</text>
      </svg>
    `;
    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  /**
   * Create HTML for tracking point popup
   */
  const createTrackingPopup = (point: TrackingPoint, index: number) => {
    const velocity = point.velocidad ? `${point.velocidad.toFixed(1)} km/h` : 'N/A';
    const time = point.timestamp ? new Date(point.timestamp).toLocaleTimeString('es-CO') : 'N/A';
    return `
      <div class="text-sm font-sans">
        <strong>Punto ${index + 1}</strong><br/>
        Lat: ${point.latitude.toFixed(6)}<br/>
        Lon: ${point.longitude.toFixed(6)}<br/>
        Velocidad: ${velocity}<br/>
        Hora: ${time}
      </div>
    `;
  };

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
    ( mapRef.current as any).eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Clear existing polyline
    if (polylineRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Clear tracking markers
    trackingMarkersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    trackingMarkersRef.current = [];

    // Draw polyline from tracking points if enabled
    if (showRoute && showTrackingPoints && trackingPoints.length > 1) {
      const latlngs = trackingPoints.map((p) => [p.latitude, p.longitude] as [number, number]);
      polylineRef.current = L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 5',
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(mapRef.current);
    }

    // Add tracking point markers if enabled
    if (showTrackingPoints && trackingPoints.length > 0) {
      trackingPoints.forEach((point, index) => {
        const marker = L.marker([point.latitude, point.longitude], {
          icon: createNumberedIcon(index + 1, '#6366f1'),
          title: `Punto ${index + 1}`,
        })
          .addTo(mapRef.current!)
          .bindPopup(createTrackingPopup(point, index));

        trackingMarkersRef.current.push(marker);
      });
    }

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

    // Add ambulance marker (only if not already shown as a tracking point)
    if (
      ambulanceLat !== undefined &&
      ambulanceLon !== undefined &&
      !trackingPoints.some((p) => p.latitude === ambulanceLat && p.longitude === ambulanceLon)
    ) {
      L.marker([ambulanceLat, ambulanceLon], {
        icon: ambulanceIcon,
        title: 'Ambulancia',
      })
        .addTo(mapRef.current)
        .bindPopup(`<div class="text-sm"><strong>Ambulancia en Ruta</strong><br/>Lat: ${ambulanceLat.toFixed(4)}<br/>Lon: ${ambulanceLon.toFixed(4)}</div>`);
    }

    // Adjust map bounds to show all markers and polyline
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
    trackingPoints.forEach((point) => {
      group.addLayer(L.marker([point.latitude, point.longitude]));
    });

    if (group.getLayers().length > 0) {
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.off();
      }
    };
  }, [
    originLat,
    originLon,
    destinationLat,
    destinationLon,
    ambulanceLat,
    ambulanceLon,
    trackingPoints,
    showRoute,
    showTrackingPoints,
  ]);

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
