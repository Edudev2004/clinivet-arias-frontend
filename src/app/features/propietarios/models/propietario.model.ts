/**
 * Modelos de datos para el módulo de gestión de propietarios (RF-05 a RF-08).
 */

export interface Propietario {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  createdAt?: string;
  cantidadMascotas?: number;
}

export interface PropietarioCreateRequest {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

export interface PropietarioUpdateRequest {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}

export interface PropietarioPage {
  content: Propietario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MascotaResumen {
  id: string;
  nombre: string;
  especie: string;
  raza?: string;
  color?: string;
  sexo: string;
  fechaNacimiento?: string;
  edad?: string;
  pesoActualKg?: number;
  fotoUrl?: string;
  activo: boolean;
  propietarioId: string;
  propietarioNombre?: string;
}
