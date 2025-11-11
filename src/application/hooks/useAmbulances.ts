// @ts-nocheck
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
  const loadAmbulance = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      const data = await ambulanceRepository.getAmbulance(numId);
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
   * Actualiza la ubicación de una ambulancia
   */
  const updateLocation = useCallback(async (
    ambulanceId: string | number,
    latitude: number,
    longitude: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const numId = typeof ambulanceId === 'string' ? parseInt(ambulanceId, 10) : ambulanceId;
      const updated = await ambulanceRepository.updateLocation(
        numId,
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


  return {
    ambulances,
    loading,
    error,
    loadAmbulances,
    loadAmbulance,
    updateLocation,
  };
}
