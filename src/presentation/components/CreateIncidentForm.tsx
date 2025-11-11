// @ts-nocheck
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useIncidentes from '../../application/hooks/useIncidentes';
import { CreateIncidentInput } from '../../data/repositories/incident-repository';
import { MapPin, Loader2 } from 'lucide-react';

// Validation Schema
const createIncidentSchema = z.object({
  descripcionOriginal: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  tipoIncidenteReportado: z.string().optional(),
  nombreSolicitante: z.string().min(1, 'Nombre del solicitante requerido'),
  telefonoSolicitante: z.string().min(9, 'Teléfono válido requerido'),
  emailSolicitante: z.string().email('Email válido requerido').optional(),
  canalOrigen: z.string().min(1, 'Canal de origen requerido'),
  descripcionUbicacion: z.string().min(1, 'Descripción de ubicación requerida'),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  ciudad: z.string().optional(),
  distrito: z.string().optional(),
  zona: z.string().optional(),
  direccion: z.string().optional(),
});

type CreateIncidentFormData = z.infer<typeof createIncidentSchema>;

interface CreateIncidentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateIncidentForm({ onSuccess, onCancel }: CreateIncidentFormProps) {
  const { handleCreateIncident, loading } = useIncidentes();
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateIncidentFormData>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      canalOrigen: 'WEB',
      descripcionUbicacion: '',
    },
  });

  const canalOrigen = watch('canalOrigen');
  const descripcionUbicacion = watch('descripcionUbicacion');

  const onSubmit = async (data: CreateIncidentFormData) => {
    try {
      const input: CreateIncidentInput = {
        descripcionOriginal: data.descripcionOriginal,
        tipoIncidenteReportado: data.tipoIncidenteReportado,
        solicitanteInput: {
          nombreCompleto: data.nombreSolicitante,
          telefono: data.telefonoSolicitante,
          email: data.emailSolicitante,
          canalOrigen: data.canalOrigen,
        },
        ubicacionInput: {
          descripcionTextual: data.descripcionUbicacion,
          ciudad: data.ciudad,
          distrito: data.distrito,
          zona: data.zona,
          direccion: data.direccion,
          latitud: selectedLocation?.lat,
          longitud: selectedLocation?.lng,
        },
      };

      const result = await handleCreateIncident(input);
      if (result) {
        toast.success('Incidente creado exitosamente');
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creando incidente');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Crear Nuevo Incidente</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección: Descripción del Incidente */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-lg font-semibold text-slate-800 px-2">Descripción del Incidente</legend>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('descripcionOriginal')}
                rows={4}
                placeholder="Describe detalladamente el incidente..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.descripcionOriginal && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcionOriginal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Incidente (Opcional)
              </label>
              <input
                {...register('tipoIncidenteReportado')}
                type="text"
                placeholder="Ej: Accidente de tránsito, Emergencia médica, etc."
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Sección: Solicitante */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-lg font-semibold text-slate-800 px-2">Información del Solicitante</legend>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  {...register('nombreSolicitante')}
                  type="text"
                  placeholder="Ej: Juan Pérez García"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.nombreSolicitante && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombreSolicitante.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono *
                </label>
                <input
                  {...register('telefonoSolicitante')}
                  type="tel"
                  placeholder="Ej: +51 987654321"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.telefonoSolicitante && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefonoSolicitante.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (Opcional)
                </label>
                <input
                  {...register('emailSolicitante')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.emailSolicitante && (
                  <p className="text-red-500 text-sm mt-1">{errors.emailSolicitante.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Canal de Origen *
                </label>
                <select
                  {...register('canalOrigen')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WEB">Web</option>
                  <option value="MOVIL">Móvil</option>
                  <option value="LLAMADA">Llamada Telefónica</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="TELEGRAM">Telegram</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Sección: Ubicación */}
        <fieldset className="border border-slate-200 rounded-lg p-4">
          <legend className="text-lg font-semibold text-slate-800 px-2">Ubicación del Incidente</legend>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción de Ubicación *
              </label>
              <textarea
                {...register('descripcionUbicacion')}
                rows={2}
                placeholder="Ej: Avenida Principal esquina con Calle Secundaria"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.descripcionUbicacion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcionUbicacion.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              <MapPin size={18} />
              {showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
            </button>

            {showMap && (
              <div className="bg-slate-100 p-4 rounded-md border border-slate-300">
                <p className="text-sm text-slate-600 mb-2">
                  {selectedLocation
                    ? `Ubicación seleccionada: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                    : 'Haz clic en el mapa para seleccionar una ubicación'}
                </p>
                <div className="bg-slate-300 h-64 rounded flex items-center justify-center">
                  <p className="text-slate-600">Mapa integrado aquí (Leaflet)</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Provincia/Ciudad
                </label>
                <input
                  {...register('ciudad')}
                  type="text"
                  placeholder="Ej: Lima"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distrito
                </label>
                <input
                  {...register('distrito')}
                  type="text"
                  placeholder="Ej: San Isidro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Zona
                </label>
                <input
                  {...register('zona')}
                  type="text"
                  placeholder="Ej: Zona Centro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección
                </label>
                <input
                  {...register('direccion')}
                  type="text"
                  placeholder="Ej: Calle Principal 123"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Botones */}
        <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Incidente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateIncidentForm;
