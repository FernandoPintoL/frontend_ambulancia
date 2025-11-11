// @ts-nocheck
/**
 * PersonalAccessForm Component
 * Presentation Layer - Form to create system access credentials for personal
 */

import { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoles } from '../../application/hooks/useRoles';
import type { Role } from '../../data/repositories/role-repository';

export interface PersonalAccessData {
  email: string;
  password: string;
  confirmPassword: string;
  roleId: string;
}

interface PersonalAccessFormProps {
  personalName: string;
  personalEmail?: string;
  personalPhone?: string;
  onSubmit: (data: PersonalAccessData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PersonalAccessForm({
  personalName,
  personalEmail = '',
  personalPhone = '',
  onSubmit,
  onCancel,
  loading = false,
}: PersonalAccessFormProps) {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<PersonalAccessData>({
    email: personalEmail,
    password: '',
    confirmPassword: '',
    roleId: '', // Se inicializa vacío, luego se llena con el primer rol disponible
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-llenar con el primer rol disponible cuando se cargan los roles
  useEffect(() => {
    if (roles.length > 0 && !formData.roleId) {
      setFormData((prev) => ({
        ...prev,
        roleId: roles[0].id,
      }));
    }
  }, [roles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear acceso';
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900">Crear Acceso al Sistema</h3>
        <p className="text-sm text-gray-600 mt-1">
          Credenciales de acceso para: <span className="font-medium">{personalName}</span>
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="inline mr-2" />
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Rol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Shield className="inline mr-2" />
          Rol de Acceso
        </label>

        {rolesLoading ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Loader2 className="animate-spin mr-2" />
            Cargando roles...
          </div>
        ) : rolesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Error al cargar roles: {rolesError}
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
            No hay roles disponibles. Contacta al administrador.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                  formData.roleId === role.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="roleId"
                    value={role.id}
                    checked={formData.roleId === role.id}
                    onChange={handleChange}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{role.name}</p>
                    <p className="text-xs text-gray-600">{role.description || 'Sin descripción'}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="inline mr-2" />
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="inline mr-2" />
          Confirmar Contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirma tu contraseña"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-2">💡 Información importante:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>El personal podrá usar estas credenciales para acceder al sistema</li>
          <li>Cada rol tiene permisos específicos según sus funciones</li>
          <li>Los paramédicos podrán hacer seguimiento GPS de las rutas</li>
          <li>Los despachadores podrán gestionar despachos y ambulancias</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creando acceso...
            </>
          ) : (
            <>
              <User />
              Crear Acceso
            </>
          )}
        </button>
      </div>
    </form>
  );
}
