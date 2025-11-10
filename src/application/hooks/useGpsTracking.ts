/**
 * useGpsTracking Hook
 * Application Layer - Custom React Hook for GPS tracking operations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchRepository } from '../../data/repositories/dispatch-repository';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  velocidad?: number;
  altitud?: number;
  precision?: number;
  timestamp: number;
}

export interface UseGpsTrackingResult {
  isTracking: boolean;
  isSupported: boolean;
  currentLocation: GpsLocation | null;
  error: string | null;
  startTracking: (dispatchId: string, interval?: number) => Promise<void>;
  stopTracking: () => void;
  recordLocation: (dispatchId: string, location: GpsLocation) => Promise<any>;
  clearError: () => void;
}

/**
 * Hook to manage GPS tracking for dispatch
 */
export const useGpsTracking = (): UseGpsTrackingResult => {
  const [isTracking, setIsTracking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GpsLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<GpsLocation | null>(null);

  // Check if Geolocation API is supported
  useEffect(() => {
    const supported = 'geolocation' in navigator;
    setIsSupported(supported);
  }, []);

  /**
   * Start tracking GPS location
   */
  const startTracking = useCallback(
    async (dispatchId: string, interval: number = 5000) => {
      if (!isSupported) {
        setError('Geolocation API not supported');
        return;
      }

      if (isTracking) {
        setError('Tracking already in progress');
        return;
      }

      setError(null);
      setIsTracking(true);

      try {
        // Request high accuracy
        const watchOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        };

        // Watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position: GeolocationPosition) => {
            const { latitude, longitude, accuracy } = position.coords;
            const { speed, altitude } = position.coords;

            const location: GpsLocation = {
              latitude,
              longitude,
              velocidad: speed ? Math.round(speed * 3.6) : undefined, // m/s to km/h
              altitud: altitude ?? undefined,
              precision: accuracy,
              timestamp: position.timestamp,
            };

            setCurrentLocation(location);
            lastLocationRef.current = location;
          },
          (err) => {
            let errorMessage = 'Unknown error';

            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = 'Permiso denegado para acceder a la ubicación';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = 'Información de ubicación no disponible';
                break;
              case err.TIMEOUT:
                errorMessage = 'Tiempo de espera agotado obteniendo ubicación';
                break;
              default:
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Geolocation error:', errorMessage);
          },
          watchOptions
        );

        // Setup interval to record location to dispatch
        intervalRef.current = setInterval(async () => {
          if (lastLocationRef.current) {
            try {
              await dispatchRepository.recordGpsLocation(
                dispatchId,
                lastLocationRef.current.latitude,
                lastLocationRef.current.longitude,
                lastLocationRef.current.velocidad,
                lastLocationRef.current.altitud,
                lastLocationRef.current.precision
              );
            } catch (err) {
              console.error('Failed to record GPS location:', err);
              // Don't stop tracking on record error, just log it
            }
          }
        }, interval);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al iniciar rastreo';
        setError(errorMessage);
        setIsTracking(false);
      }
    },
    [isSupported, isTracking]
  );

  /**
   * Stop tracking GPS location
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
  }, []);

  /**
   * Record single location to dispatch
   */
  const recordLocation = useCallback(
    async (dispatchId: string, location: GpsLocation) => {
      try {
        setError(null);
        const result = await dispatchRepository.recordGpsLocation(
          dispatchId,
          location.latitude,
          location.longitude,
          location.velocidad,
          location.altitud,
          location.precision
        );
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al registrar ubicación';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    isSupported,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    recordLocation,
    clearError,
  };
};
