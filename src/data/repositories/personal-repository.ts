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
    const apiUrl = (process.env as any).REACT_APP_GRAPHQL_URL || 'http://localhost:8001/graphql';
    this.client = new GraphQLClient(apiUrl);
  }

  /**
   * Get personal by ID
   */
  async getPersonal(id: string): Promise<Personal> {
    const response: any = await this.client.request(GET_PERSONAL, { id: parseInt(id) });
    return response.personal;
  }

  /**
   * List all personal with optional filters
   */
  async listPersonales(
    rol?: string,
    estado?: string,
    disponiblesOnly?: boolean,
    limit?: number,
    offset?: number
  ): Promise<Personal[]> {
    const response: any = await this.client.request(LIST_PERSONALES, {
      rol: rol || null,
      estado: estado || null,
      disponiblesOnly: disponiblesOnly || false,
      limit: limit || 100,
      offset: offset || 0,
    });
    return response.personales;
  }

  /**
   * Get personal by role
   */
  async getPersonalesByRol(rol: string): Promise<Personal[]> {
    return this.listPersonales(rol);
  }

  /**
   * Get available personal
   */
  async getAvailablePersonal(): Promise<Personal[]> {
    return this.listPersonales(undefined, 'disponible', true);
  }

  /**
   * Create new personal
   */
  async createPersonal(data: CreatePersonalInput): Promise<Personal> {
    const response: any = await this.client.request(CREATE_PERSONAL, {
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
    const response: any = await this.client.request(UPDATE_PERSONAL, {
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
    personalId: string,
    estado: 'disponible' | 'en_servicio' | 'descanso' | 'vacaciones'
  ): Promise<Personal> {
    const response: any = await this.client.request(CHANGE_PERSONAL_STATUS, {
      id: parseInt(personalId),
      estado,
    });
    return response.cambiarEstadoPersonal;
  }

  /**
   * Assign personal to dispatch
   */
  async assignPersonal(
    despachoId: string,
    personalId: string,
    rolAsignado: string,
    esResponsable?: boolean
  ): Promise<any> {
    const response: any = await this.client.request(ASSIGN_PERSONAL, {
      despacho_id: parseInt(despachoId),
      personal_id: parseInt(personalId),
      rol_asignado: rolAsignado,
      es_responsable: esResponsable ?? false,
    });
    return response.asignarPersonal;
  }

  /**
   * Unassign personal from dispatch
   */
  async unassignPersonal(despachoId: string, personalId: string): Promise<any> {
    const response: any = await this.client.request(UNASSIGN_PERSONAL, {
      despacho_id: parseInt(despachoId),
      personal_id: parseInt(personalId),
    });
    return response.desasignarPersonal;
  }
}

// Singleton instance
export const personalRepository = new PersonalRepository();
