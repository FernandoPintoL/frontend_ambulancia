import { useCallback, useState } from 'react';
import { ambulanceRepository, Ambulance as AmbulanceType } from '../../data/repositories/ambulance-repository';

interface Ambulance extends AmbulanceType {
  name?: string;
  location?: { lat: number; lon: number };
  crew?: string;
  responseTime?: number;
}

/**
 * Hook para manejar operaciones de ambulancias
 * Proporciona métodos para cargar, actualizar y gestionar ambulancias
 */
export function useAmbulances() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga todas las ambulancias
   */
  const loadAmbulances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanceRepository.listAmbulances();
      setAmbulances(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading ambulances';
      setError(message);
      console.error('Error loading ambulances:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga una ambulancia específica por ID
   */
  const loadAmbulance = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanceRepository.getAmbulance(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading ambulance';
      setError(message);
      console.error('Error loading ambulance:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga el estado de la flota
   */
  const loadFleetStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanceRepository.getFleetStatus();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading fleet status';
      setError(message);
      console.error('Error loading fleet status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza la ubicación de una ambulancia
   */
  const updateLocation = useCallback(async (
    ambulanceId: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await ambulanceRepository.updateLocation(
        ambulanceId,
        latitude,
        longitude
      );

      // Actualizar en el estado local
      setAmbulances((prev) =>
        prev.map((amb) =>
          amb.id === ambulanceId
            ? { ...amb, location: { lat: latitude, lon: longitude } }
            : amb
        )
      );

      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating location';
      setError(message);
      console.error('Error updating location:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia el estado de una ambulancia
   */
  const setStatus = useCallback(async (
    ambulanceId: string,
    status: 'available' | 'busy' | 'maintenance'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await ambulanceRepository.setStatus(ambulanceId, status);

      // Actualizar en el estado local
      setAmbulances((prev) =>
        prev.map((amb) => (amb.id === ambulanceId ? { ...amb, status } : amb))
      );

      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error setting status';
      setError(message);
      console.error('Error setting status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene estadísticas de ambulancias
   */
  const getAmbulanceStats = useCallback(async (ambulanceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const stats = await ambulanceRepository.getAmbulanceStats(ambulanceId, 7);
      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading stats';
      setError(message);
      console.error('Error loading stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene las ambulancias disponibles más cercanas a una ubicación
   */
  const findNearestAvailable = useCallback(
    async (latitude: number, longitude: number, maxDistance: number = 10) => {
      try {
        setLoading(true);
        setError(null);
        const nearest = await ambulanceRepository.getAvailableAmbulancesNear(
          latitude,
          longitude,
          maxDistance
        );
        return nearest;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error finding nearest ambulance';
        setError(message);
        console.error('Error finding nearest ambulance:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    ambulances,
    loading,
    error,
    loadAmbulances,
    loadAmbulance,
    loadFleetStatus,
    updateLocation,
    setStatus,
    getAmbulanceStats,
    findNearestAvailable,
  };
}
