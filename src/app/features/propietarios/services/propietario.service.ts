import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Propietario,
  PropietarioCreateRequest,
  PropietarioUpdateRequest,
  PropietarioPage,
  MascotaResumen
} from '../models/propietario.model';

/**
 * Servicio reactivo para la gestión integral de propietarios (RF-05, RF-06, RF-07, RF-08).
 * Comunica con el backend Spring Boot e integra Signals de Angular 17 para reactividad.
 */
@Injectable({
  providedIn: 'root'
})
export class PropietarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/propietarios`;

  // Signals reactivos para el estado del módulo
  readonly propietarios = signal<Propietario[]>([]);
  readonly totalElementos = signal<number>(0);
  readonly totalPaginas = signal<number>(0);
  readonly paginaActual = signal<number>(0);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Propietario en foco y sus mascotas asociadas (RF-08)
  readonly propietarioSeleccionado = signal<Propietario | null>(null);
  readonly mascotasDelPropietario = signal<MascotaResumen[]>([]);
  readonly cargandoMascotas = signal<boolean>(false);

  private readonly LOCAL_STORAGE_KEY = 'clinivet_propietarios_cache';

  // Propietarios mock iniciales basados en seed_data.sql para fallback offline
  private propietariosCache: Propietario[] = [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      nombre: 'Carlos',
      apellido: 'Mendoza Ramos',
      nombreCompleto: 'Carlos Mendoza Ramos',
      dni: '45892314',
      telefono: '987123456',
      email: 'carlos.mendoza@gmail.com',
      direccion: 'Av. Larco 456, Miraflores',
      activo: true,
      createdAt: '2026-10-27T10:00:00',
      cantidadMascotas: 2
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      nombre: 'María',
      apellido: 'Flores Valdivia',
      nombreCompleto: 'María Flores Valdivia',
      dni: '72345678',
      telefono: '912345678',
      email: 'maria.flores@hotmail.com',
      direccion: 'Jr. Huancavelica 230, Lima',
      activo: true,
      createdAt: '2026-10-27T11:00:00',
      cantidadMascotas: 1
    },
    {
      id: 'p0000000-0000-0000-0000-000000000003',
      nombre: 'Jorge',
      apellido: 'Salazar Castro',
      nombreCompleto: 'Jorge Salazar Castro',
      dni: '09876543',
      telefono: '998877665',
      email: 'jorge.salazar@outlook.com',
      direccion: 'Av. Brasil 1234, Jesús María',
      activo: true,
      createdAt: '2026-10-27T12:00:00',
      cantidadMascotas: 1
    }
  ];

  constructor() {
    this.cargarCacheLocal();
  }

  private cargarCacheLocal(): void {
    try {
      const guardados = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (guardados) {
        this.propietariosCache = JSON.parse(guardados);
      }
    } catch {
      // Ignorar error si localStorage no está disponible
    }
  }

  private guardarCacheLocal(): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.propietariosCache));
    } catch {
      // Ignorar error de cuota
    }
  }

  /**
   * Búsqueda paginada de propietarios con término opcional (RF-06).
   */
  buscar(termino?: string, page = 0, size = 10): Observable<PropietarioPage> {
    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (termino && termino.trim() !== '') {
      params = params.set('q', termino.trim());
    }

    return this.http.get<PropietarioPage>(this.baseUrl, { params }).pipe(
      tap((res) => {
        this.propietarios.set(res.content);
        this.totalElementos.set(res.totalElements);
        this.totalPaginas.set(res.totalPages);
        this.paginaActual.set(res.number);
        this.cargando.set(false);
      }),
      catchError(() => {
        // Fallback local en caso de desconexión
        let filtrados = [...this.propietariosCache];
        if (termino && termino.trim() !== '') {
          const t = termino.trim().toLowerCase();
          filtrados = filtrados.filter(
            (p) =>
              p.nombre.toLowerCase().includes(t) ||
              p.apellido.toLowerCase().includes(t) ||
              p.dni.toLowerCase().includes(t) ||
              p.telefono.toLowerCase().includes(t)
          );
        }

        const start = page * size;
        const paged = filtrados.slice(start, start + size);
        const totalPag = Math.ceil(filtrados.length / size) || 1;

        const mockPage: PropietarioPage = {
          content: paged,
          totalElements: filtrados.length,
          totalPages: totalPag,
          number: page,
          size: size
        };

        this.propietarios.set(mockPage.content);
        this.totalElementos.set(mockPage.totalElements);
        this.totalPaginas.set(mockPage.totalPages);
        this.paginaActual.set(mockPage.number);
        this.cargando.set(false);

        return of(mockPage);
      })
    );
  }

  /**
   * Obtiene la información detallada de un propietario por UUID.
   */
  obtenerPorId(id: string): Observable<Propietario> {
    return this.http.get<Propietario>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const encontrado = this.propietariosCache.find((p) => p.id === id);
        if (encontrado) {
          return of(encontrado);
        }
        throw new Error('Propietario no encontrado');
      })
    );
  }

  /**
   * Registra un nuevo propietario en la base de datos (RF-05).
   */
  registrar(payload: PropietarioCreateRequest): Observable<Propietario> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.post<Propietario>(this.baseUrl, payload).pipe(
      tap((nuevo) => {
        this.propietariosCache.unshift(nuevo);
        this.guardarCacheLocal();
        this.propietarios.update((actuales) => [nuevo, ...actuales]);
        this.totalElementos.update((total) => total + 1);
        this.cargando.set(false);
      }),
      catchError((err) => {
        // En simulación local offline si no hay backend activo
        if (err.status === 0 || !err.status) {
          const nuevoSimulado: Propietario = {
            id: 'p-' + Math.random().toString(36).substring(2, 9),
            nombre: payload.nombre.trim(),
            apellido: payload.apellido.trim(),
            nombreCompleto: `${payload.nombre.trim()} ${payload.apellido.trim()}`,
            dni: payload.dni.trim(),
            telefono: payload.telefono.trim(),
            email: payload.email?.trim(),
            direccion: payload.direccion?.trim(),
            activo: true,
            createdAt: new Date().toISOString(),
            cantidadMascotas: 0
          };
          this.propietariosCache.unshift(nuevoSimulado);
          this.guardarCacheLocal();
          this.propietarios.update((actuales) => [nuevoSimulado, ...actuales]);
          this.totalElementos.update((total) => total + 1);
          this.cargando.set(false);
          return of(nuevoSimulado);
        }
        this.cargando.set(false);
        throw err;
      })
    );
  }

  /**
   * Actualiza los datos de un propietario existente (RF-07).
   */
  actualizar(id: string, payload: PropietarioUpdateRequest): Observable<Propietario> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.put<Propietario>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((actualizado) => {
        const index = this.propietariosCache.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.propietariosCache[index] = actualizado;
          this.guardarCacheLocal();
        }
        this.propietarios.update((actuales) =>
          actuales.map((p) => (p.id === id ? actualizado : p))
        );
        if (this.propietarioSeleccionado()?.id === id) {
          this.propietarioSeleccionado.set(actualizado);
        }
        this.cargando.set(false);
      }),
      catchError((err) => {
        if (err.status === 0 || !err.status) {
          const index = this.propietariosCache.findIndex((p) => p.id === id);
          if (index !== -1) {
            const actualizadoSim: Propietario = {
              ...this.propietariosCache[index],
              nombre: payload.nombre.trim(),
              apellido: payload.apellido.trim(),
              nombreCompleto: `${payload.nombre.trim()} ${payload.apellido.trim()}`,
              dni: payload.dni.trim(),
              telefono: payload.telefono.trim(),
              email: payload.email?.trim(),
              direccion: payload.direccion?.trim(),
              activo: payload.activo !== undefined ? payload.activo : this.propietariosCache[index].activo
            };
            this.propietariosCache[index] = actualizadoSim;
            this.guardarCacheLocal();
            this.propietarios.update((actuales) =>
              actuales.map((p) => (p.id === id ? actualizadoSim : p))
            );
            if (this.propietarioSeleccionado()?.id === id) {
              this.propietarioSeleccionado.set(actualizadoSim);
            }
            this.cargando.set(false);
            return of(actualizadoSim);
          }
        }
        this.cargando.set(false);
        throw err;
      })
    );
  }

  /**
   * Consulta las mascotas asociadas a un propietario específico (RF-08).
   */
  listarMascotas(propietarioId: string): Observable<MascotaResumen[]> {
    this.cargandoMascotas.set(true);

    return this.http.get<MascotaResumen[]>(`${this.baseUrl}/${propietarioId}/mascotas`).pipe(
      tap((mascotas) => {
        this.mascotasDelPropietario.set(mascotas);
        this.cargandoMascotas.set(false);
      }),
      catchError(() => {
        // Fallback local: busca mascotas en localStorage o mock
        try {
          const rawMascotas = localStorage.getItem('clinivet_mascotas_db');
          if (rawMascotas) {
            const todas = JSON.parse(rawMascotas);
            const filtradas = todas.filter((m: any) => m.propietarioId === propietarioId);
            this.mascotasDelPropietario.set(filtradas);
            this.cargandoMascotas.set(false);
            return of(filtradas);
          }
        } catch {
          // ignore
        }
        this.mascotasDelPropietario.set([]);
        this.cargandoMascotas.set(false);
        return of([]);
      })
    );
  }

  /**
   * Selecciona un propietario y carga reactivamente sus mascotas vinculadas (RF-08).
   */
  seleccionarPropietario(propietario: Propietario | null): void {
    this.propietarioSeleccionado.set(propietario);
    if (propietario) {
      this.listarMascotas(propietario.id).subscribe();
    } else {
      this.mascotasDelPropietario.set([]);
    }
  }
}
