/**
 * PersonalPage - Personal/Staff Management
 * Presentation Layer - Main page for managing medical staff
 */

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePersonal } from '../../application/hooks/usePersonal';
import PersonalTable from '../components/PersonalTable';
import PersonalForm from '../components/PersonalForm';
import PersonalStatusBadge from '../components/PersonalStatusBadge';
import { Personal, CreatePersonalInput } from '../../data/repositories/personal-repository';

type ModalMode = 'create' | 'edit' | null;

export default function PersonalPage() {
  const {
    personales,
    loading,
    error,
    loadPersonales,
    createPersonal,
    updatePersonal,
    changePersonalStatus,
  } = usePersonal();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);

  // Load personal on mount
  useEffect(() => {
    loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
  }, [roleFilter, statusFilter, availableOnlyFilter]);

  // Filter personal based on search term
  const filteredPersonales = personales.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.nombre_completo.toLowerCase().includes(searchLower) ||
      p.ci.toLowerCase().includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreatePersonal = async (data: CreatePersonalInput) => {
    try {
      await createPersonal(data);
      toast.success('Personal creado exitosamente');
      setModalMode(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear personal';
      toast.error(errorMsg);
    }
  };

  const handleEditPersonal = (personal: Personal) => {
    setSelectedPersonal(personal);
    setModalMode('edit');
  };

  const handleSavePersonal = async (data: any) => {
    if (!selectedPersonal) return;

    try {
      await updatePersonal({
        id: selectedPersonal.id,
        ...data,
      });
      toast.success('Personal actualizado exitosamente');
      setModalMode(null);
      setSelectedPersonal(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar personal';
      toast.error(errorMsg);
    }
  };

  const handleChangeStatus = async (personalId: string, newStatus: string) => {
    try {
      await changePersonalStatus(
        personalId,
        newStatus as 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones'
      );
      toast.success('Estado actualizado');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cambiar estado';
      toast.error(errorMsg);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedPersonal(null);
  };

  const roles = ['paramedico', 'conductor', 'medico', 'enfermero'];
  const statuses = ['disponible', 'en_servicio', 'descanso', 'vacaciones'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-600 mt-1">
            Total: <span className="font-semibold">{personales.length}</span> personal
          </p>
        </div>
        <button
          onClick={() => setModalMode('create')}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Agregar Personal
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, CI o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Available Only */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnlyFilter}
                onChange={(e) => setAvailableOnlyFilter(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Solo disponibles</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button onClick={() => loadPersonales()} className="text-red-600 hover:text-red-700">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Personal Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Personal</h2>

        {loading && filteredPersonales.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPersonales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No hay personal disponible</p>
            <button
              onClick={() => setModalMode('create')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FiPlus />
              Crear el primer personal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CI</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Experiencia
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonales.map((personal) => (
                  <tr key={personal.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{personal.nombre_completo}</p>
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
                    <td className="px-4 py-3">
                      <PersonalStatusBadge
                        status={personal.estado}
                        onChangeStatus={(newStatus) =>
                          handleChangeStatus(personal.id, newStatus)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {personal.experiencia} años
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        {personal.telefono && <p>{personal.telefono}</p>}
                        {personal.email && <p className="text-gray-600">{personal.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPersonal(personal)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? 'Crear Personal' : 'Editar Personal'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <PersonalForm
              personal={modalMode === 'edit' ? selectedPersonal : undefined}
              onSubmit={modalMode === 'create' ? handleCreatePersonal : handleSavePersonal}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
