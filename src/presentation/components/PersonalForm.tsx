/**
 * PersonalForm Component
 * Presentation Layer - Form for creating/editing personal
 */

import { useState, useEffect } from 'react';
import { Personal, CreatePersonalInput } from '../../data/repositories/personal-repository';

interface PersonalFormProps {
  personal?: Personal | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function PersonalForm({ personal, onSubmit, onCancel }: PersonalFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    rol: 'paramedico',
    especialidad: '',
    experiencia: 0,
    telefono: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personal) {
      setFormData({
        nombre: personal.nombre,
        apellido: personal.apellido,
        ci: personal.ci,
        rol: personal.rol,
        especialidad: personal.especialidad || '',
        experiencia: personal.experiencia,
        telefono: personal.telefono || '',
        email: personal.email || '',
      });
    }
  }, [personal]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    if (!formData.ci.trim()) {
      newErrors.ci = 'La cédula es requerida';
    }
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experiencia' ? parseInt(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
            placeholder="Juan"
          />
          {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`input-field ${errors.apellido ? 'border-red-500' : ''}`}
            placeholder="Pérez"
          />
          {errors.apellido && <p className="text-red-600 text-xs mt-1">{errors.apellido}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cédula <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            disabled={isSubmitting || !!personal}
            className={`input-field ${errors.ci ? 'border-red-500' : ''}`}
            placeholder="1234567890"
          />
          {errors.ci && <p className="text-red-600 text-xs mt-1">{errors.ci}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`input-field ${errors.rol ? 'border-red-500' : ''}`}
          >
            <option value="paramedico">Paramédico</option>
            <option value="conductor">Conductor</option>
            <option value="medico">Médico</option>
            <option value="enfermero">Enfermero</option>
          </select>
          {errors.rol && <p className="text-red-600 text-xs mt-1">{errors.rol}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especialidad
          </label>
          <input
            type="text"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            disabled={isSubmitting}
            className="input-field"
            placeholder="Cardiólogo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Años de Experiencia
          </label>
          <input
            type="number"
            name="experiencia"
            value={formData.experiencia}
            onChange={handleChange}
            disabled={isSubmitting}
            className="input-field"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          disabled={isSubmitting}
          className="input-field"
          placeholder="+58 xxx xxxx xxx"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          placeholder="correo@ejemplo.com"
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Guardando...' : personal ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-secondary flex-1"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
