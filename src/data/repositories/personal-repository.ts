/**
 * Personal Repository
 * Data Layer - Personal/Staff Management API Operations
 */

import { GraphQLClient } from 'graphql-request';
import {
  GET_PERSONAL,
  LIST_PERSONALES,
} from './queries';
import {
  CREATE_PERSONAL,
  UPDATE_PERSONAL,
  CHANGE_PERSONAL_STATUS,
  ASSIGN_PERSONAL,
  UNASSIGN_PERSONAL,
} from './mutations';

export interface Personal {
  id: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  ci: string;
  rol: 'paramedico' | 'conductor' | 'medico' | 'enfermero';
  especialidad?: string;
  experiencia: number;
  estado: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones';
  telefono?: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePersonalInput {
  nombre: string;
  apellido: string;
  ci: string;
  rol: 'paramedico' | 'conductor' | 'medico' | 'enfermero';
  especialidad?: string;
  experiencia?: number;
  telefono?: string;
  email?: string;
}

export interface UpdatePersonalInput {
  id: string;
  nombre?: string;
  apellido?: string;
  especialidad?: string;
  experiencia?: number;
  telefono?: string;
  email?: string;
}

class PersonalRepository {
  private client: GraphQLClient;

  constructor() {
    const apiUrl = import.meta.env.REACT_APP_GRAPHQL_URL || 'http://localhost:3000/graphql';
    this.client = new GraphQLClient(apiUrl);
  }

  /**
   * Get personal by ID
   */
  async getPersonal(id: string): Promise<Personal> {
    const response = await this.client.request(GET_PERSONAL, { id: parseInt(id) });
    return response.personal;
  }

  /**
   * List all personal with optional filters
   */
  async listPersonales(
    rol?: string,
    estado?: string,
    disponibles?: boolean,
    limit: number = 50,
    offset: number = 0
  ): Promise<Personal[]> {
    const response = await this.client.request(LIST_PERSONALES, {
      rol,
      estado,
      disponibles,
      limit,
      offset,
    });
    return response.personales;
  }

  /**
   * Get personal by role
   */
  async getPersonalesByRol(rol: string, limit: number = 50): Promise<Personal[]> {
    return this.listPersonales(rol, undefined, undefined, limit, 0);
  }

  /**
   * Get available personal
   */
  async getAvailablePersonal(limit: number = 50): Promise<Personal[]> {
    return this.listPersonales(undefined, 'disponible', true, limit, 0);
  }

  /**
   * Create new personal
   */
  async createPersonal(data: CreatePersonalInput): Promise<Personal> {
    const response = await this.client.request(CREATE_PERSONAL, {
      nombre: data.nombre,
      apellido: data.apellido,
      ci: data.ci,
      rol: data.rol,
      especialidad: data.especialidad,
      experiencia: data.experiencia,
      telefono: data.telefono,
      email: data.email,
    });
    return response.crearPersonal;
  }

  /**
   * Update personal
   */
  async updatePersonal(data: UpdatePersonalInput): Promise<Personal> {
    const response = await this.client.request(UPDATE_PERSONAL, {
      id: parseInt(data.id),
      nombre: data.nombre,
      apellido: data.apellido,
      especialidad: data.especialidad,
      experiencia: data.experiencia,
      telefono: data.telefono,
      email: data.email,
    });
    return response.actualizarPersonal;
  }

  /**
   * Change personal status
   */
  async changePersonalStatus(
    id: string,
    estado: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones'
  ): Promise<Personal> {
    const response = await this.client.request(CHANGE_PERSONAL_STATUS, {
      id: parseInt(id),
      estado,
    });
    return response.cambiarEstadoPersonal;
  }

  /**
   * Assign personal to dispatch
   */
  async assignPersonal(
    dispatchId: string,
    personalId: string,
    rolAsignado: string,
    esResponsable?: boolean
  ): Promise<any> {
    const response = await this.client.request(ASSIGN_PERSONAL, {
      despacho_id: parseInt(dispatchId),
      personal_id: parseInt(personalId),
      rol_asignado: rolAsignado,
      es_responsable: esResponsable ?? false,
    });
    return response.asignarPersonal;
  }

  /**
   * Remove personal from dispatch
   */
  async unassignPersonal(dispatchId: string, personalId: string): Promise<any> {
    const response = await this.client.request(UNASSIGN_PERSONAL, {
      despacho_id: parseInt(dispatchId),
      personal_id: parseInt(personalId),
    });
    return response.desasignarPersonal;
  }
}

export const personalRepository = new PersonalRepository();
