// @ts-nocheck
/**
 * PersonalPage - Personal/Staff Management
 * Presentation Layer - Main page for managing medical staff
 */

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePersonal } from '../../application/hooks/usePersonal';
import { useWebSocket } from '../../application/hooks/useWebSocket';
import PersonalTable from '../components/PersonalTable';
import PersonalForm from '../components/PersonalForm';
import PersonalStatusBadge from '../components/PersonalStatusBadge';
import PersonalAccessForm, { PersonalAccessData } from '../components/PersonalAccessForm';
import { Personal, CreatePersonalInput } from '../../data/repositories/personal-repository';
import { capitalizeFirst } from '../../utils/string';
import { graphqlClient } from '../../data/repositories/graphql-client';
import { CREATE_USER_FOR_PERSONAL } from '../../data/repositories/mutations';

type ModalMode = 'create' | 'edit' | 'access' | null;

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
  const { subscribe } = useWebSocket();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
  const [newPersonal, setNewPersonal] = useState<Personal | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);

  // Load personal on mount
  useEffect(() => {
    loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
  }, [roleFilter, statusFilter, availableOnlyFilter]);

  // Setup WebSocket subscriptions for real-time personal updates
  useEffect(() => {
    // Subscribe to personal created events
    const unsubCreated = subscribe('personal_created', () => {
      console.log('Personal created, reloading list');
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
    });

    // Subscribe to personal updated events
    const unsubUpdated = subscribe('personal_updated', () => {
      console.log('Personal updated, reloading list');
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
    });

    // Subscribe to personal status changed events
    const unsubStatusChanged = subscribe('personal_status_changed', () => {
      console.log('Personal status changed, reloading list');
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubCreated();
      unsubUpdated();
      unsubStatusChanged();
    };
  }, [subscribe, roleFilter, statusFilter, availableOnlyFilter]);

  // Filter personal based on search term
  const filteredPersonales = personales.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.nombreCompleto.toLowerCase().includes(searchLower) ||
      p.ci.toLowerCase().includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreatePersonal = async (data: CreatePersonalInput) => {
    try {
      const createdPersonal = await createPersonal(data);
      toast.success('Personal creado exitosamente');

      // Guardar el personal recién creado y mostrar formulario de acceso
      setNewPersonal(createdPersonal);
      setModalMode('access');

      // Recargar la lista de personal con los filtros actuales
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
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

      // Recargar la lista de personal con los filtros actuales
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
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

      // Recargar la lista de personal con los filtros actuales
      loadPersonales(roleFilter || undefined, statusFilter || undefined, availableOnlyFilter);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cambiar estado';
      toast.error(errorMsg);
    }
  };

  const handleCreatePersonalAccess = async (accessData: PersonalAccessData) => {
    if (!newPersonal) return;

    try {
      setAccessLoading(true);

      // Crear usuario en el microservicio de autenticación (ms_autentificacion)
      const response: any = await graphqlClient.request(CREATE_USER_FOR_PERSONAL, {
        name: newPersonal.nombreCompleto,
        email: accessData.email,
        phone: newPersonal.telefono,
        password: accessData.password,
        roleId: accessData.roleId, // Usar el ID del rol seleccionado
      });

      if (response?.createUser) {
        toast.success(
          `Acceso creado exitosamente\nEmail: ${accessData.email}\nEl personal puede iniciar sesión ahora`
        );
        setModalMode(null);
        setNewPersonal(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear acceso';
      toast.error(errorMsg);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedPersonal(null);
    setNewPersonal(null);
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
          <Plus />
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
              <Search className="absolute left-3 top-3 text-gray-400" />
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
                  {capitalizeFirst(role)}
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
                  {capitalizeFirst(status)}
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
              <Plus />
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
                        <p className="font-medium text-gray-900">{personal.nombreCompleto}</p>
                        {personal.especialidad && (
                          <p className="text-sm text-gray-600">{personal.especialidad}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{personal.ci}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {capitalizeFirst(personal.rol)}
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
                          <Edit2 className="text-lg" />
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

      {/* Create/Edit/Access Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {modalMode === 'access' && newPersonal ? (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900">Crear Acceso al Sistema</h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="text-xl" />
                  </button>
                </div>
                <PersonalAccessForm
                  personalName={newPersonal.nombreCompleto}
                  personalEmail={newPersonal.email}
                  personalPhone={newPersonal.telefono}
                  onSubmit={handleCreatePersonalAccess}
                  onCancel={handleCloseModal}
                  loading={accessLoading}
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900">
                    {modalMode === 'create' ? 'Crear Personal' : 'Editar Personal'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="text-xl" />
                  </button>
                </div>

                <PersonalForm
                  personal={modalMode === 'edit' ? selectedPersonal : undefined}
                  onSubmit={modalMode === 'create' ? handleCreatePersonal : handleSavePersonal}
                  onCancel={handleCloseModal}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

