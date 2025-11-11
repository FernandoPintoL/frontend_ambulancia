// @ts-nocheck
/**
 * useRoles Hook
 * Application Layer - Custom React Hook for Role operations
 */

import { useEffect, useState } from 'react';
import { roleRepository, Role } from '../../data/repositories/role-repository';

interface UseRolesResult {
  roles: Role[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage roles from ms_autentificacion
 */
export const useRoles = (): UseRolesResult => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleRepository.getRoles();
      setRoles(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching roles';
      setError(errorMsg);
      console.error('Error in useRoles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
};
