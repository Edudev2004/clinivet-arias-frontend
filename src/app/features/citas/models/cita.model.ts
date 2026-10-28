/**
 * Modelos de datos para el módulo de Gestión de Citas Médicas (RF-13 a RF-19 / APF2 Tabla 38).
 */

export type EstadoCita = 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Cita {
  id: string;
  mascotaId: string;
  nombreMascota: string;
  especieMascota: string;
  propietarioId: string;
  nombrePropietario: string;
  dniPropietario: string;
  telefonoPropietario?: string;
  veterinarioId: string;
  nombreVeterinario: string;
  especialidadVeterinario?: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  fechaHora: string; // ISO string
  estado: EstadoCita;
  motivo: string;
  creadoPorId?: string;
  creadoPorEmail?: string;
  createdAt?: string;
}

export interface CitaCreateRequest {
  mascotaId: string;
  propietarioId: string;
  veterinarioId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  motivo: string;
}

export interface CitaReprogramarRequest {
  fecha: string;
  hora: string;
  motivo?: string;
}

export interface CitaEstadoRequest {
  estado: EstadoCita;
  motivoCancelacion?: string;
}

export interface DisponibilidadResponse {
  veterinarioId: string;
  veterinarioNombre: string;
  numeroColegiatura?: string;
  especialidad?: string;
  fecha: string;
  hora: string;
  disponible: boolean;
  mensaje: string;
  turnosDelDia?: string[];
}

export interface VeterinarioResumen {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  numeroColegiatura: string;
  activo: boolean;
}

export interface CitaFiltros {
  veterinarioId?: string;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoCita;
  page?: number;
  size?: number;
}

export interface CitaPage {
  content: Cita[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
