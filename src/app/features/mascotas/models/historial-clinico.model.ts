/**
 * Modelos de datos para el historial clínico de mascotas (RF-25, RF-26 / APF2).
 */

export interface EntradaHistorialClinico {
  id: string;
  consultaId?: string;
  fecha: string;
  motivoConsulta: string;
  diagnostico: string;
  observaciones?: string;
  veterinario: {
    id?: string;
    nombre: string;
    especialidad: string;
    colegiatura?: string;
  };
  triaje: {
    pesoKg: number;
    temperaturaC: number;
    frecuenciaCardiacaBpm?: number;
  };
  tratamientos: {
    id?: string;
    medicamento: string;
    dosisMgKg?: number;
    dosisTotalMg?: number;
    frecuencia?: string;
    duracion: string;
    indicaciones?: string;
  }[];
  vacunasAplicadas: {
    id?: string;
    nombreVacuna: string;
    fechaAplicacion: string;
    proximaFecha?: string | null;
    lote?: string | null;
  }[];
}

export interface HistorialFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  veterinarioId?: string;
  termino?: string;
  page?: number;
  size?: number;
}

export interface HistorialClinicoPaginado {
  content: EntradaHistorialClinico[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
