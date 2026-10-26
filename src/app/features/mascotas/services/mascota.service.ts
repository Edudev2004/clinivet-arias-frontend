import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Mascota,
  MascotaCreateRequest,
  MascotaUpdateRequest,
  PropietarioResumen
} from '../models/mascota.model';

/**
 * Servicio reactivo para la gestión de mascotas y consulta de propietarios (RF-09 a RF-12).
 * Aplica principios SOLID:
 * - SRP: Encapsula la comunicación HTTP y el estado reactivo con Signals.
 * - DIP: Inyecta dependencias mediante inject(HttpClient).
 */
@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/mascotas`;
  private readonly propietariosUrl = `${environment.apiUrl}/propietarios`;

  // Estado reactivo con Signals de Angular 17
  readonly mascotas = signal<Mascota[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Propietarios precargados de referencia según seed_data.sql (APF2)
  private propietariosMock: PropietarioResumen[] = [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      nombre: 'Carlos',
      apellido: 'Mendoza Ramos',
      dni: '45892314',
      telefono: '987123456',
      email: 'carlos.mendoza@gmail.com',
      direccion: 'Av. Larco 456, Miraflores'
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      nombre: 'María',
      apellido: 'Flores Valdivia',
      dni: '72345678',
      telefono: '912345678',
      email: 'maria.flores@hotmail.com',
      direccion: 'Jr. Huancavelica 230, Lima'
    },
    {
      id: 'p0000000-0000-0000-0000-000000000003',
      nombre: 'Jorge',
      apellido: 'Salazar Castro',
      dni: '09876543',
      telefono: '998877665',
      email: 'jorge.salazar@outlook.com',
      direccion: 'Calle Los Sauces 142, San Isidro'
    }
  ];

  // Mascotas iniciales según seed_data.sql (APF2)
  private mascotasLocales: Mascota[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      propietarioId: 'p0000000-0000-0000-0000-000000000001',
      propietarioNombre: 'Carlos Mendoza Ramos',
      propietarioDni: '45892314',
      propietarioTelefono: '987123456',
      nombre: 'Bobby',
      especie: 'Canino',
      raza: 'Golden Retriever',
      color: 'Dorado',
      sexo: 'M',
      fechaNacimiento: '2022-04-10',
      pesoActualKg: 28.50,
      fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      activo: true,
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      propietarioId: 'p0000000-0000-0000-0000-000000000002',
      propietarioNombre: 'María Flores Valdivia',
      propietarioDni: '72345678',
      propietarioTelefono: '912345678',
      nombre: 'Luna',
      especie: 'Felino',
      raza: 'Siamés',
      color: 'Crema y Chocolate',
      sexo: 'H',
      fechaNacimiento: '2023-08-15',
      pesoActualKg: 4.20,
      fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      activo: true,
      createdAt: '2026-02-01T14:20:00Z'
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      propietarioId: 'p0000000-0000-0000-0000-000000000001',
      propietarioNombre: 'Carlos Mendoza Ramos',
      propietarioDni: '45892314',
      propietarioTelefono: '987123456',
      nombre: 'Thor',
      especie: 'Canino',
      raza: 'Husky Siberiano',
      color: 'Gris y Blanco',
      sexo: 'M',
      fechaNacimiento: '2021-11-20',
      pesoActualKg: 24.00,
      fotoUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
      activo: true,
      createdAt: '2026-02-10T11:00:00Z'
    }
  ];

  private readonly STORAGE_KEY = 'clinivet_mascotas_db';
  private readonly PROPIETARIOS_KEY = 'clinivet_propietarios_db';

  constructor() {
    this.cargarDeStorage();
    this.cargarPropietarios();
    this.mascotas.set([...this.mascotasLocales]);
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mascotasLocales));
    } catch {}
  }

  private cargarDeStorage(): void {
    try {
      const guardadas = localStorage.getItem(this.STORAGE_KEY);
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.mascotasLocales = parsed;
        }
      }
    } catch {}
  }

  private guardarPropietarios(): void {
    try {
      localStorage.setItem(this.PROPIETARIOS_KEY, JSON.stringify(this.propietariosMock));
    } catch {}
  }

  private cargarPropietarios(): void {
    try {
      const guardados = localStorage.getItem(this.PROPIETARIOS_KEY);
      if (guardados) {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.propietariosMock = parsed;
        }
      }
    } catch {}
  }

  agregarPropietarioLocal(prop: PropietarioResumen): void {
    if (!this.propietariosMock.some((p) => p.id === prop.id)) {
      this.propietariosMock.unshift(prop);
      this.guardarPropietarios();
    }
  }

  /**
   * Obtiene la lista completa de mascotas activas (RF-10).
   */
  getMascotas(): Observable<Mascota[]> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.get<Mascota[]>(this.apiUrl).pipe(
      tap((res) => {
        this.mascotasLocales = res;
        this.guardarEnStorage();
        this.mascotas.set(res);
        this.cargando.set(false);
      }),
      catchError(() => {
        // Fallback resiliente con datos de muestra locales si el backend no responde
        this.cargando.set(false);
        this.mascotas.set([...this.mascotasLocales]);
        return of([...this.mascotasLocales]);
      })
    );
  }

  /**
   * Obtiene el detalle de una mascota por su ID único (RF-10).
   */
  getMascotaPorId(id: string): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const encontrada = this.mascotasLocales.find((m) => m.id === id);
        if (encontrada) {
          return of(encontrada);
        }
        return throwError(() => new Error('Mascota no encontrada'));
      })
    );
  }

  /**
   * Registra una nueva mascota vinculándola obligatoriamente a un propietario (RN-01 / RF-09).
   */
  registrarMascota(payload: MascotaCreateRequest): Observable<Mascota> {
    this.cargando.set(true);

    return this.http.post<Mascota>(this.apiUrl, payload).pipe(
      tap((nueva) => {
        this.mascotasLocales.unshift(nueva);
        this.guardarEnStorage();
        this.mascotas.set([...this.mascotasLocales]);
        this.cargando.set(false);
      }),
      catchError(() => {
        // Simulación local reactiva en frontend con persistencia
        const prop = this.propietariosMock.find((p) => p.id === payload.propietarioId);
        const nuevaMascota: Mascota = {
          id: `m-${Date.now()}`,
          propietarioId: payload.propietarioId,
          propietarioNombre: prop ? `${prop.nombre} ${prop.apellido}`.trim() : 'Propietario Asignado',
          propietarioDni: prop ? prop.dni : '',
          propietarioTelefono: prop ? prop.telefono : '',
          nombre: payload.nombre,
          especie: payload.especie,
          raza: payload.raza,
          color: payload.color,
          sexo: payload.sexo,
          fechaNacimiento: payload.fechaNacimiento,
          pesoActualKg: payload.pesoActualKg,
          fotoUrl: payload.fotoUrl || '',
          activo: true,
          createdAt: new Date().toISOString()
        };

        this.mascotasLocales.unshift(nuevaMascota);
        this.guardarEnStorage();
        this.mascotas.set([...this.mascotasLocales]);
        this.cargando.set(false);
        return of(nuevaMascota);
      })
    );
  }

  /**
   * Actualiza los datos o el peso de una mascota existente (RF-11 / RF-12).
   */
  actualizarMascota(id: string, payload: MascotaUpdateRequest): Observable<Mascota> {
    this.cargando.set(true);

    return this.http.put<Mascota>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((actualizada) => {
        const index = this.mascotasLocales.findIndex((m) => m.id === id);
        if (index !== -1) {
          this.mascotasLocales[index] = actualizada;
          this.guardarEnStorage();
          this.mascotas.set([...this.mascotasLocales]);
        }
        this.cargando.set(false);
      }),
      catchError(() => {
        const index = this.mascotasLocales.findIndex((m) => m.id === id);
        if (index !== -1) {
          const prop = payload.propietarioId
            ? this.propietariosMock.find((p) => p.id === payload.propietarioId)
            : undefined;

          const mascotaActualizada: Mascota = {
            ...this.mascotasLocales[index],
            ...payload,
            propietarioNombre: prop
              ? `${prop.nombre} ${prop.apellido}`.trim()
              : this.mascotasLocales[index].propietarioNombre,
            propietarioDni: prop ? prop.dni : this.mascotasLocales[index].propietarioDni,
            updatedAt: new Date().toISOString()
          };

          this.mascotasLocales[index] = mascotaActualizada;
          this.guardarEnStorage();
          this.mascotas.set([...this.mascotasLocales]);
          this.cargando.set(false);
          return of(mascotaActualizada);
        }
        this.cargando.set(false);
        return throwError(() => new Error('Mascota no encontrada para actualizar'));
      })
    );
  }

  /**
   * Realiza borrado lógico de una mascota (RN-07).
   */
  eliminarMascota(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.mascotasLocales = this.mascotasLocales.filter((m) => m.id !== id);
        this.guardarEnStorage();
        this.mascotas.set([...this.mascotasLocales]);
      }),
      catchError(() => {
        this.mascotasLocales = this.mascotasLocales.filter((m) => m.id !== id);
        this.guardarEnStorage();
        this.mascotas.set([...this.mascotasLocales]);
        return of(void 0);
      })
    );
  }

  /**
   * Búsqueda en tiempo real de propietarios para el autocomplete reactivo (RN-01).
   */
  buscarPropietarios(filtro: string): Observable<PropietarioResumen[]> {
    if (!filtro || filtro.trim().length === 0) {
      return of(this.propietariosMock);
    }

    const termino = filtro.toLowerCase().trim();
    return this.http.get<PropietarioResumen[]>(`${this.propietariosUrl}/buscar?q=${termino}`).pipe(
      catchError(() => {
        const filtrados = this.propietariosMock.filter(
          (p) =>
            p.dni.includes(termino) ||
            p.nombre.toLowerCase().includes(termino) ||
            p.apellido.toLowerCase().includes(termino)
        );
        return of(filtrados);
      })
    );
  }
}
