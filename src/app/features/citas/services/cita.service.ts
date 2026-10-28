import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Cita,
  CitaCreateRequest,
  CitaPage,
  CitaFiltros,
  DisponibilidadResponse,
  VeterinarioResumen
} from '../models/cita.model';

/**
 * Servicio reactivo para la gestión integral de citas médicas (RF-13 a RF-19).
 * Se comunica con los endpoints Spring Boot /api/citas y /api/veterinarios,
 * incorporando Signals de Angular 17 y fallback offline para pruebas.
 */
@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/citas`;
  private readonly veterinariosUrl = `${environment.apiUrl}/veterinarios`;

  // Signals reactivos para el estado del módulo
  readonly citas = signal<Cita[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly totalPaginas = signal<number>(0);
  readonly paginaActual = signal<number>(0);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Lista de especialistas veterinarios
  readonly veterinarios = signal<VeterinarioResumen[]>([
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      nombreCompleto: 'Dr. Beckhan Elias',
      especialidad: 'Medicina General y Cirugía Menor',
      numeroColegiatura: 'CMVP-14892',
      activo: true
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      nombreCompleto: 'Dra. Lucero Pérez',
      especialidad: 'Dermatología y Nutrición',
      numeroColegiatura: 'CMVP-15201',
      activo: true
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      nombreCompleto: 'Dr. Rommel Navarro',
      especialidad: 'Cirugía y Traumatología',
      numeroColegiatura: 'CMVP-16045',
      activo: true
    }
  ]);

  private readonly LOCAL_STORAGE_KEY = 'clinivet_citas_db';

  private citasCache: Cita[] = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      mascotaId: 'f0000000-0000-0000-0000-000000000001',
      nombreMascota: 'Bobby',
      especieMascota: 'Canino',
      propietarioId: 'e0000000-0000-0000-0000-000000000001',
      nombrePropietario: 'Carlos Mendoza Ramos',
      dniPropietario: '45892314',
      telefonoPropietario: '987123456',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      nombreVeterinario: 'Dr. Beckhan Elias',
      especialidadVeterinario: 'Medicina General y Cirugía Menor',
      fecha: '2026-11-02',
      hora: '10:00',
      fechaHora: '2026-11-02T10:00:00',
      estado: 'PROGRAMADA',
      motivo: 'Control de vacunas y desparasitación periódica',
      createdAt: '2026-10-27T10:00:00'
    }
  ];

  constructor() {
    this.cargarCacheLocal();
  }

  private cargarCacheLocal(): void {
    try {
      const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (raw) {
        this.citasCache = JSON.parse(raw);
      }
    } catch {
      // Ignorar fallo en entornos sin localStorage
    }
  }

  private guardarCacheLocal(): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.citasCache));
    } catch {
      // Ignorar error de cuota
    }
  }

  /**
   * Obtiene la lista de especialistas veterinarios activos.
   */
  listarVeterinarios(): Observable<VeterinarioResumen[]> {
    return this.http.get<VeterinarioResumen[]>(this.veterinariosUrl).pipe(
      tap((vets) => {
        if (vets && vets.length > 0) {
          this.veterinarios.set(vets.filter((v) => v.activo));
        }
      }),
      catchError(() => of(this.veterinarios()))
    );
  }

  /**
   * Consulta la disponibilidad de un veterinario en fecha y hora específicas (RF-14).
   * Endpoint Spring Boot: GET /api/veterinarios/{id}/disponibilidad?fecha=YYYY-MM-DD&hora=HH:mm:ss
   */
  consultarDisponibilidad(
    veterinarioId: string,
    fecha: string,
    hora: string
  ): Observable<DisponibilidadResponse> {
    const formattedHora = hora.length === 5 ? `${hora}:00` : hora;
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('hora', formattedHora);

    return this.http
      .get<DisponibilidadResponse>(`${this.veterinariosUrl}/${veterinarioId}/disponibilidad`, {
        params
      })
      .pipe(
        catchError(() => {
          // Fallback offline evaluando contra la caché local de citas
          const fechaHoraKey = `${fecha}T${hora.substring(0, 5)}`;
          const hayConflicto = this.citasCache.some(
            (c) =>
              c.veterinarioId === veterinarioId &&
              c.estado === 'PROGRAMADA' &&
              c.fechaHora.startsWith(fechaHoraKey)
          );

          const vet = this.veterinarios().find((v) => v.id === veterinarioId);
          const mockResponse: DisponibilidadResponse = {
            veterinarioId,
            veterinarioNombre: vet?.nombreCompleto || 'Médico Veterinario',
            numeroColegiatura: vet?.numeroColegiatura || 'CMVP-14892',
            especialidad: vet?.especialidad || 'Medicina General',
            fecha,
            hora: formattedHora,
            disponible: !hayConflicto,
            mensaje: !hayConflicto
              ? 'Horario disponible para agendar'
              : 'El especialista ya cuenta con una cita programada a esa hora (RF-15 / RN-03)',
            turnosDelDia: ['09:00 - 13:00', '14:00 - 18:00']
          };
          return of(mockResponse);
        })
      );
  }

  /**
   * Registra una nueva cita médica en el sistema (RF-13, RF-15).
   * Endpoint Spring Boot: POST /api/citas
   */
  crearCita(payload: CitaCreateRequest): Observable<Cita> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.post<Cita>(this.baseUrl, payload).pipe(
      tap((nuevaCita) => {
        this.citasCache.unshift(nuevaCita);
        this.guardarCacheLocal();
        this.citas.update((actuales) => [nuevaCita, ...actuales]);
        this.totalElementos.update((t) => t + 1);
        this.cargando.set(false);
      }),
      catchError((err) => {
        // En simulación local offline si el backend no responde
        if (err.status === 0 || !err.status) {
          const fechaHoraKey = `${payload.fecha}T${payload.hora.substring(0, 5)}`;
          const conflicto = this.citasCache.some(
            (c) =>
              c.veterinarioId === payload.veterinarioId &&
              c.estado === 'PROGRAMADA' &&
              c.fechaHora.startsWith(fechaHoraKey)
          );

          if (conflicto) {
            this.cargando.set(false);
            const errConflicto = {
              status: 409,
              error: {
                mensaje:
                  'Conflicto de horario: El veterinario ya cuenta con una cita programada en la fecha y hora seleccionadas (RF-15 / RN-03)'
              }
            };
            throw errConflicto;
          }

          const vet = this.veterinarios().find((v) => v.id === payload.veterinarioId);
          const mockCita: Cita = {
            id: 'c-' + Math.random().toString(36).substring(2, 9),
            mascotaId: payload.mascotaId,
            nombreMascota: 'Mascota Demo',
            especieMascota: 'Canino',
            propietarioId: payload.propietarioId,
            nombrePropietario: 'Propietario Demo',
            dniPropietario: '45892314',
            veterinarioId: payload.veterinarioId,
            nombreVeterinario: vet?.nombreCompleto || 'Dr. Beckhan Elias',
            especialidadVeterinario: vet?.especialidad || 'Medicina General',
            fecha: payload.fecha,
            hora: payload.hora,
            fechaHora: `${payload.fecha}T${payload.hora}:00`,
            estado: 'PROGRAMADA',
            motivo: payload.motivo.trim(),
            createdAt: new Date().toISOString()
          };

          this.citasCache.unshift(mockCita);
          this.guardarCacheLocal();
          this.citas.update((actuales) => [mockCita, ...actuales]);
          this.totalElementos.update((t) => t + 1);
          this.cargando.set(false);
          return of(mockCita);
        }

        this.cargando.set(false);
        throw err;
      })
    );
  }

  /**
   * Consulta paginada y filtrada de citas (RF-18).
   * Endpoint Spring Boot: GET /api/citas
   */
  listarCitas(filtros?: CitaFiltros): Observable<CitaPage> {
    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams();
    const page = filtros?.page ?? 0;
    const size = filtros?.size ?? 10;
    params = params.set('page', page.toString()).set('size', size.toString());

    if (filtros?.veterinarioId) {
      params = params.set('veterinarioId', filtros.veterinarioId);
    }
    if (filtros?.fecha) {
      params = params.set('fecha', filtros.fecha);
    }
    if (filtros?.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    if (filtros?.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<CitaPage>(this.baseUrl, { params }).pipe(
      tap((res) => {
        this.citas.set(res.content);
        this.totalElementos.set(res.totalElements);
        this.totalPaginas.set(res.totalPages);
        this.paginaActual.set(res.number);
        this.cargando.set(false);
      }),
      catchError(() => {
        // Fallback local
        let filtradas = [...this.citasCache];
        if (filtros?.veterinarioId) {
          filtradas = filtradas.filter((c) => c.veterinarioId === filtros.veterinarioId);
        }
        if (filtros?.estado) {
          filtradas = filtradas.filter((c) => c.estado === filtros.estado);
        }
        if (filtros?.fecha) {
          filtradas = filtradas.filter((c) => c.fecha === filtros.fecha);
        }

        const start = page * size;
        const paged = filtradas.slice(start, start + size);
        const totalPag = Math.ceil(filtradas.length / size) || 1;

        const mockPage: CitaPage = {
          content: paged,
          totalElements: filtradas.length,
          totalPages: totalPag,
          number: page,
          size
        };

        this.citas.set(paged);
        this.totalElementos.set(filtradas.length);
        this.totalPaginas.set(totalPag);
        this.paginaActual.set(page);
        this.cargando.set(false);
        return of(mockPage);
      })
    );
  }
}
