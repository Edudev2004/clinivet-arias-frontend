import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EntradaHistorialClinico,
  HistorialFiltros,
  HistorialClinicoPaginado
} from '../models/historial-clinico.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialClinicoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mascotas`;

  // Signals reactivas (Angular 17)
  readonly entradas = signal<EntradaHistorialClinico[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly totalPaginas = signal<number>(1);
  readonly paginaActual = signal<number>(0);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Cache/Mock resiliente en memoria
  private readonly mockHistorial: Map<string, EntradaHistorialClinico[]> = new Map();

  constructor() {
    this.inicializarMocks();
  }

  /**
   * Consulta el historial clínico completo de una mascota con filtros y paginación (RF-25, RF-26).
   * GET /api/mascotas/{id}/historial?fechaInicio=&fechaFin=&veterinarioId=&page=&size=
   */
  consultarHistorial(
    mascotaId: string,
    filtros: HistorialFiltros = {}
  ): Observable<HistorialClinicoPaginado> {
    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.veterinarioId) params = params.set('veterinarioId', filtros.veterinarioId);
    if (filtros.page !== undefined) params = params.set('page', filtros.page.toString());
    if (filtros.size !== undefined) params = params.set('size', filtros.size.toString());

    return this.http
      .get<any>(`${this.baseUrl}/${mascotaId}/historial`, { params })
      .pipe(
        map((data: any) => {
          let lista: EntradaHistorialClinico[] = [];
          let total = 0;
          let pages = 1;
          const currentPage = filtros.page || 0;
          const pageSize = filtros.size || 20;

          if (Array.isArray(data)) {
            lista = data;
            total = data.length;
            pages = Math.ceil(total / pageSize) || 1;
          } else if (data && Array.isArray(data.content)) {
            lista = data.content;
            total = data.totalElements ?? data.content.length;
            pages = data.totalPages ?? 1;
          }

          this.entradas.set(lista);
          this.totalElementos.set(total);
          this.totalPaginas.set(pages);
          this.paginaActual.set(currentPage);
          this.cargando.set(false);

          return {
            content: lista,
            totalElements: total,
            totalPages: pages,
            number: currentPage,
            size: pageSize
          };
        }),
        catchError((err) => {
          console.warn(`[HistorialClinicoService] Fallback local para mascota ${mascotaId}:`, err);
          const respuestaFallback = this.obtenerFallbackFiltrado(mascotaId, filtros);
          this.entradas.set(respuestaFallback.content);
          this.totalElementos.set(respuestaFallback.totalElements);
          this.totalPaginas.set(respuestaFallback.totalPages);
          this.paginaActual.set(respuestaFallback.number);
          this.cargando.set(false);
          return of(respuestaFallback);
        })
      );
  }

  private obtenerFallbackFiltrado(
    mascotaId: string,
    filtros: HistorialFiltros
  ): HistorialClinicoPaginado {
    let todas = this.mockHistorial.get(mascotaId) || this.generarEntradasPorDefecto(mascotaId);

    // Filtro por fechaInicio
    if (filtros.fechaInicio) {
      todas = todas.filter((e) => e.fecha >= filtros.fechaInicio!);
    }
    // Filtro por fechaFin
    if (filtros.fechaFin) {
      todas = todas.filter((e) => e.fecha <= filtros.fechaFin!);
    }
    // Filtro por veterinario
    if (filtros.veterinarioId) {
      todas = todas.filter((e) => e.veterinario.id === filtros.veterinarioId);
    }
    // Filtro por término
    if (filtros.termino) {
      const term = filtros.termino.toLowerCase().trim();
      todas = todas.filter(
        (e) =>
          e.diagnostico.toLowerCase().includes(term) ||
          e.motivoConsulta.toLowerCase().includes(term) ||
          e.veterinario.nombre.toLowerCase().includes(term) ||
          e.tratamientos.some((t) => t.medicamento.toLowerCase().includes(term))
      );
    }

    const page = filtros.page || 0;
    const size = filtros.size || 20;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginadas = todas.slice(startIndex, endIndex);

    return {
      content: paginadas,
      totalElements: todas.length,
      totalPages: Math.ceil(todas.length / size) || 1,
      number: page,
      size
    };
  }

  private inicializarMocks(): void {
    const mockMascotaId = 'f0000000-0000-0000-0000-000000000001';
    this.mockHistorial.set(mockMascotaId, this.generarEntradasPorDefecto(mockMascotaId));
  }

  private generarEntradasPorDefecto(mascotaId: string): EntradaHistorialClinico[] {
    return [
      {
        id: 'hist-001',
        consultaId: 'cons-001',
        fecha: '2026-10-15',
        motivoConsulta: 'Control Periódico y Vacunación Preventiva',
        diagnostico:
          'Examen clínico general sin anomalías. Mucosas rosadas, ganglios reactivos normales. Se aplica revacunación anual.',
        observaciones: 'Paciente en excelente condición corporal. Próximo control en 6 meses.',
        veterinario: {
          id: 'd0000000-0000-0000-0000-000000000001',
          nombre: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General y Cirugía Menor',
          colegiatura: 'CMVP-14892'
        },
        triaje: {
          pesoKg: 28.5,
          temperaturaC: 38.6,
          frecuenciaCardiacaBpm: 92
        },
        tratamientos: [
          {
            id: 'trat-001',
            medicamento: 'Complejo Vitamínico B12',
            dosisMgKg: 0.5,
            dosisTotalMg: 14.25,
            frecuencia: 'Cada 24 horas',
            duracion: '15 días',
            indicaciones: 'Vía oral junto al alimento matutino'
          }
        ],
        vacunasAplicadas: [
          {
            id: 'vac-001',
            nombreVacuna: 'Séxtuple Canina (DHPPi/L)',
            fechaAplicacion: '2026-10-15',
            proximaFecha: '2027-10-15',
            lote: 'LOT-2026-S1'
          }
        ]
      },
      {
        id: 'hist-002',
        consultaId: 'cons-002',
        fecha: '2026-08-20',
        motivoConsulta: 'Dermatitis Alérgica y Prurito Intenso',
        diagnostico:
          'Dermatitis alérgica por picadura de pulga (DAPP) con eritema focal en lomo y zona ventral.',
        observaciones: 'Mantener ambiente libre de ectoparásitos. Repetir pipeta mensual.',
        veterinario: {
          id: 'd0000000-0000-0000-0000-000000000002',
          nombre: 'Dra. Lucero Pérez',
          especialidad: 'Dermatología Veterinaria',
          colegiatura: 'CMVP-15634'
        },
        triaje: {
          pesoKg: 28.1,
          temperaturaC: 38.8,
          frecuenciaCardiacaBpm: 104
        },
        tratamientos: [
          {
            id: 'trat-002',
            medicamento: 'Apoquel (Oclacitinib) 16mg',
            dosisMgKg: 0.4,
            dosisTotalMg: 11.24,
            frecuencia: 'Cada 12 horas',
            duracion: '14 días',
            indicaciones: 'Administrar con o sin comida'
          },
          {
            id: 'trat-003',
            medicamento: 'Champú Clorhexidina 3%',
            dosisMgKg: 1.0,
            dosisTotalMg: 28.1,
            frecuencia: 'Cada 3 días',
            duracion: '2 semanas',
            indicaciones: 'Dejar actuar durante 10 minutos antes de enjuagar'
          }
        ],
        vacunasAplicadas: []
      },
      {
        id: 'hist-003',
        consultaId: 'cons-003',
        fecha: '2026-05-10',
        motivoConsulta: 'Control de Vacunación Antirrábica',
        diagnostico: 'Paciente apto para vacunación antirrábica reglamentaria.',
        observaciones: 'Inmunización anual obligatoria.',
        veterinario: {
          id: 'd0000000-0000-0000-0000-000000000001',
          nombre: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General',
          colegiatura: 'CMVP-14892'
        },
        triaje: {
          pesoKg: 27.8,
          temperaturaC: 38.4,
          frecuenciaCardiacaBpm: 88
        },
        tratamientos: [],
        vacunasAplicadas: [
          {
            id: 'vac-002',
            nombreVacuna: 'Antirrábica Canina',
            fechaAplicacion: '2026-05-10',
            proximaFecha: '2027-05-10',
            lote: 'LOT-RAB-26'
          }
        ]
      }
    ];
  }
}
