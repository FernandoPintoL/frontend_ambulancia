// @ts-nocheck
import { useCallback, useState } from 'react';
import { googleMapsService } from '../../data/repositories/google-maps-service';

/**
 * Marker Interface for GoogleMap
 */
export interface Marker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color?: string;
  info?: string;
}

/**
 * Location Interface
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Custom Hook for Google Maps Integration
 * Provides convenient methods for managing markers, calculations, and directions
 */
export function useGoogleMap() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

  /**
   * Add a single marker
   */
  const addMarker = useCallback((marker: Marker) => {
    setMarkers((prev) => [...prev, marker]);
  }, []);

  /**
   * Add multiple markers
   */
  const addMarkers = useCallback((newMarkers: Marker[]) => {
    setMarkers((prev) => [...prev, ...newMarkers]);
  }, []);

  /**
   * Update a marker by ID
   */
  const updateMarker = useCallback((id: string, updates: Partial<Marker>) => {
    setMarkers((prev) =>
      prev.map((marker) => (marker.id === id ? { ...marker, ...updates } : marker))
    );
  }, []);

  /**
   * Remove a marker by ID
   */
  const removeMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
    if (selectedMarker?.id === id) {
      setSelectedMarker(null);
    }
  }, [selectedMarker]);

  /**
   * Clear all markers
   */
  const clearMarkers = useCallback(() => {
    setMarkers([]);
    setSelectedMarker(null);
  }, []);

  /**
   * Get distance between two markers
   */
  const getDistanceBetween = useCallback((id1: string, id2: string): number | null => {
    const marker1 = markers.find((m) => m.id === id1);
    const marker2 = markers.find((m) => m.id === id2);

    if (!marker1 || !marker2) return null;

    return googleMapsService.calculateDistance(
      { lat: marker1.lat, lng: marker1.lng },
      { lat: marker2.lat, lng: marker2.lng }
    );
  }, [markers]);

  /**
   * Get total distance of all markers (route)
   */
  const getTotalDistance = useCallback((): number => {
    if (markers.length < 2) return 0;
    const locations = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
    return googleMapsService.calculateRouteDistance(locations);
  }, [markers]);

  /**
   * Get formatted total distance
   */
  const getFormattedTotalDistance = useCallback((): string => {
    return googleMapsService.formatDistance(getTotalDistance());
  }, [getTotalDistance]);

  /**
   * Get center location of all markers
   */
  const getCenterLocation = useCallback((): Location => {
    if (markers.length === 0) return { lat: 0, lng: 0 };
    const locations = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
    return googleMapsService.getCenterLocation(locations);
  }, [markers]);

  /**
   * Get bounds containing all markers
   */
  const getBounds = useCallback(() => {
    if (markers.length === 0) {
      return { ne: { lat: 0, lng: 0 }, sw: { lat: 0, lng: 0 } };
    }
    const locations = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
    return googleMapsService.getBounds(locations);
  }, [markers]);

  /**
   * Get directions URL between two markers
   */
  const getDirectionsUrl = useCallback(
    (id1: string, id2: string, travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING' = 'DRIVING'): string | null => {
      const marker1 = markers.find((m) => m.id === id1);
      const marker2 = markers.find((m) => m.id === id2);

      if (!marker1 || !marker2) return null;

      return googleMapsService.getDirectionsUrl(
        { lat: marker1.lat, lng: marker1.lng },
        { lat: marker2.lat, lng: marker2.lng },
        travelMode
      );
    },
    [markers]
  );

  /**
   * Check if location is within bounds
   */
  const isWithinBounds = useCallback(
    (location: Location, bounds: { ne: Location; sw: Location } | null = null): boolean => {
      const boundsToCheck = bounds || getBounds();
      return googleMapsService.isWithinBounds(location, boundsToCheck);
    },
    [getBounds]
  );

  /**
   * Get zoom level appropriate for current markers
   */
  const getAppropriateZoom = useCallback((mapWidth: number = 400, mapHeight: number = 300): number => {
    if (markers.length === 0) return 13;
    if (markers.length === 1) return 15;

    const bounds = getBounds();
    return googleMapsService.getZoomForBounds(bounds, mapWidth, mapHeight);
  }, [markers, getBounds]);

  /**
   * Format location for display
   */
  const formatLocation = useCallback((location: Location): string => {
    return googleMapsService.formatLocation(location);
  }, []);

  /**
   * Get marker by ID
   */
  const getMarkerById = useCallback(
    (id: string): Marker | null => {
      return markers.find((m) => m.id === id) || null;
    },
    [markers]
  );

  /**
   * Select a marker
   */
  const selectMarker = useCallback((id: string) => {
    const marker = markers.find((m) => m.id === id);
    if (marker) {
      setSelectedMarker(marker);
    }
  }, [markers]);

  /**
   * Deselect current marker
   */
  const deselectMarker = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  /**
   * Create marker icon URL
   */
  const createMarkerIconUrl = useCallback((color: string = 'FF0000', label: string = ''): string => {
    return googleMapsService.createMarkerIconUrl(color, label);
  }, []);

  return {
    // State
    markers,
    selectedMarker,

    // Marker management
    addMarker,
    addMarkers,
    updateMarker,
    removeMarker,
    clearMarkers,
    getMarkerById,
    selectMarker,
    deselectMarker,

    // Distance calculations
    getDistanceBetween,
    getTotalDistance,
    getFormattedTotalDistance,

    // Location calculations
    getCenterLocation,
    getBounds,
    getAppropriateZoom,

    // Navigation
    getDirectionsUrl,

    // Utilities
    isWithinBounds,
    formatLocation,
    createMarkerIconUrl,
  };
}

export default useGoogleMap;
