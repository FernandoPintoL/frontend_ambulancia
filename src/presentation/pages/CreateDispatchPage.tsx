import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const dispatchSchema = z.object({
  patientName: z.string().min(1, 'Nombre requerido'),
  patientAge: z.number().min(0, 'Edad inválida'),
  patientPhone: z.string().optional(),
  description: z.string().min(5, 'Descripción requerida'),
  severityLevel: z.number().min(1).max(5),
  patientLat: z.number(),
  patientLon: z.number(),
  address: z.string().optional(),
});

type DispatchFormData = z.infer<typeof dispatchSchema>;

export default function CreateDispatchPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      severityLevel: 2,
      patientLat: 4.7110,
      patientLon: -74.0721,
    },
  });

  const onSubmit = async (data: DispatchFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement actual GraphQL mutation
      console.log('Submit:', data);
      toast.success('Despacho creado exitosamente');
      reset();
      // TODO: Redirect to dispatches page
    } catch (error) {
      toast.error('Error al crear despacho');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dispatches" className="btn-secondary flex items-center gap-2 w-fit">
          <FiArrowLeft />
          Volver
        </a>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Despacho</h1>
          <p className="text-gray-600">Crear una nueva solicitud de ambulancia</p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Paciente *
              </label>
              <input
                type="text"
                {...register('patientName')}
                className="input-field"
                placeholder="Juan Pérez"
              />
              {errors.patientName && (
                <p className="text-red-600 text-sm mt-1">{errors.patientName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad *
              </label>
              <input
                type="number"
                {...register('patientAge', { valueAsNumber: true })}
                className="input-field"
                placeholder="45"
              />
              {errors.patientAge && (
                <p className="text-red-600 text-sm mt-1">{errors.patientAge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                {...register('patientPhone')}
                className="input-field"
                placeholder="+57 3001234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Severidad *
              </label>
              <select
                {...register('severityLevel', { valueAsNumber: true })}
                className="input-field"
              >
                <option value={1}>Baja</option>
                <option value={2}>Moderada</option>
                <option value={3}>Alta</option>
                <option value={4}>Muy Alta</option>
                <option value={5}>Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={4}
              placeholder="Describe los síntomas o la emergencia..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              {...register('address')}
              className="input-field"
              placeholder="Calle 45 #12-34, Bogotá"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitud *
              </label>
              <input
                type="number"
                step="0.0001"
                {...register('patientLat', { valueAsNumber: true })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud *
              </label>
              <input
                type="number"
                step="0.0001"
                {...register('patientLon', { valueAsNumber: true })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <a href="/dispatches" className="btn-secondary">
              Cancelar
            </a>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Creando...' : 'Crear Despacho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
