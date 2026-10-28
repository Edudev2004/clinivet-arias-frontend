/**
 * Modelos de datos para el módulo de Consultas Médicas y Prescripciones (RF-20 a RF-23 / APF2 Tabla 38 Anexo E).
 */

export interface Consulta {
  id: string;
  citaId: string;
  mascotaId?: string;
  nombreMascota?: string;
  veterinarioId: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  pesoKg: number;
  temperaturaC: number;
  observaciones?: string;
  createdAt?: string;
  tratamientos?: Tratamiento[];
}

export interface ConsultaCreateRequest {
  citaId: string;
  veterinarioId: string;
  fecha: string; // YYYY-MM-DD
  motivo: string;
  diagnostico: string;
  peso: number;
  temperatura: number;
  observaciones?: string;
}

export interface Tratamiento {
  id: string;
  consultaId: string;
  medicamentoId: string;
  nombreMedicamento?: string;
  dosisMgPorKg: number;
  dosisTotalMg: number;
  duracionDias: number;
  indicaciones?: string;
  createdAt?: string;
}

export interface TratamientoCreateRequest {
  medicamentoId: string;
  dosisMgPorKg: number;
  duracionDias: number;
  indicaciones?: string;
}

export interface CalculoDosisRequest {
  pesoKg: number;
  dosisMgPorKg: number;
}

export interface CalculoDosisResponse {
  pesoKg: number;
  dosisMgPorKg: number;
  dosisTotalMg: number;
  unidadMedida: string;
  formula: string;
}

export interface MedicamentoCatalogo {
  id: string;
  nombre: string;
  principioActivo?: string;
  presentacion?: string;
  unidadMedida: string;
}
