// @ts-nocheck
/**
 * PersonalTable Component
 * Presentation Layer - Reusable table for displaying personal
 */

import { Edit2 } from 'lucide-react';
import { Personal } from '../../data/repositories/personal-repository';
import PersonalStatusBadge from './PersonalStatusBadge';

interface PersonalTableProps {
  personales: Personal[];
  loading?: boolean;
  onEdit?: (personal: Personal) => void;
  onStatusChange?: (personalId: string, status: string) => void;
}

export default function PersonalTable({
  personales,
  loading = false,
  onEdit,
  onStatusChange,
}: PersonalTableProps) {
  if (loading && personales.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (personales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No hay personal disponible</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CI</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Experiencia
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contacto</th>
            {onEdit && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {personales.map((personal) => (
            <tr key={personal.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{personal.nombreCompleto}</p>
                  {personal.especialidad && (
                    <p className="text-sm text-gray-600">{personal.especialidad}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{personal.ci}</td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {personal.rol.charAt(0).toUpperCase() + personal.rol.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 min-w-[150px]">
                {onStatusChange ? (
                  <PersonalStatusBadge
                    status={personal.estado}
                    onChangeStatus={(newStatus) => onStatusChange(personal.id, newStatus)}
                  />
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {personal.estado.charAt(0).toUpperCase() + personal.estado.slice(1)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{personal.experiencia} años</td>
              <td className="px-4 py-3 text-sm">
                <div>
                  {personal.telefono && <p>{personal.telefono}</p>}
                  {personal.email && <p className="text-gray-600">{personal.email}</p>}
                </div>
              </td>
              {onEdit && (
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => onEdit(personal)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="text-lg" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
