/**
 * Modelos de datos para el módulo de gestión de mascotas (RF-09 a RF-12 / APF2 Tabla 29).
 */

export type SexoMascota = 'M' | 'H';

export interface Mascota {
  id: string;
  propietarioId: string;
  propietarioNombre?: string;
  propietarioDni?: string;
  propietarioTelefono?: string;
  nombre: string;
  especie: string;
  raza?: string;
  color?: string;
  sexo: SexoMascota;
  fechaNacimiento?: string;
  pesoActualKg?: number;
  fotoUrl?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MascotaCreateRequest {
  propietarioId: string;
  nombre: string;
  especie: string;
  raza?: string;
  color?: string;
  sexo: SexoMascota;
  fechaNacimiento?: string;
  pesoActualKg?: number;
  fotoUrl?: string;
}

export interface MascotaUpdateRequest {
  propietarioId?: string;
  nombre?: string;
  especie?: string;
  raza?: string;
  color?: string;
  sexo?: SexoMascota;
  fechaNacimiento?: string;
  pesoActualKg?: number;
  fotoUrl?: string;
  activo?: boolean;
}

export interface PropietarioResumen {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion?: string;
}
