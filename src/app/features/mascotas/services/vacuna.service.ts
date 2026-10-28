import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VacunaAplicada, VacunaAplicadaRequest } from '../models/vacuna.model';

@Injectable({
  providedIn: 'root'
})
export class VacunaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mascotas`;

  // Signals para gestión reactiva de estado (Angular 17)
  readonly vacunas = signal<VacunaAplicada[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Fallback en memoria resiliente para pruebas y modo offline
  private readonly mockVacunas: Map<string, VacunaAplicada[]> = new Map();

  constructor() {
    this.inicializarMocks();
  }

  /**
   * Obtiene el listado de vacunas aplicadas a una mascota (RF-24).
   * GET /api/mascotas/{id}/vacunas
   */
  listarPorMascota(mascotaId: string): Observable<VacunaAplicada[]> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.get<VacunaAplicada[]>(`${this.baseUrl}/${mascotaId}/vacunas`).pipe(
      tap((data) => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.fechaAplicacion).getTime() - new Date(a.fechaAplicacion).getTime()
        );
        this.vacunas.set(ordenadas);
        this.cargando.set(false);
      }),
      catchError((err) => {
        console.warn(`[VacunaService] Fallback local para mascota ${mascotaId}:`, err);
        const fallback = this.mockVacunas.get(mascotaId) || [];
        this.vacunas.set(fallback);
        this.cargando.set(false);
        return of(fallback);
      })
    );
  }

  /**
   * Registra una nueva vacuna aplicada a una mascota (RF-24).
   * POST /api/mascotas/{id}/vacunas
   */
  registrarVacuna(mascotaId: string, request: VacunaAplicadaRequest): Observable<VacunaAplicada> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.post<VacunaAplicada>(`${this.baseUrl}/${mascotaId}/vacunas`, request).pipe(
      tap((nueva) => {
        this.vacunas.update((actuales) => [nueva, ...actuales]);
        // Sincronizar mock local
        const listaMock = this.mockVacunas.get(mascotaId) || [];
        this.mockVacunas.set(mascotaId, [nueva, ...listaMock]);
        this.cargando.set(false);
      }),
      catchError((err) => {
        // Fallback para crear en memoria
        const mockResponse: VacunaAplicada = {
          id: 'vac-' + Math.random().toString(36).substring(2, 9),
          mascotaId,
          nombreVacuna: request.nombreVacuna,
          fechaAplicacion: request.fechaAplicacion,
          proximaFecha: request.proximaFecha || null,
          veterinarioId: request.veterinarioId,
          veterinarioNombre: 'Dr. Beckhan Elias (Médico Veterinario)',
          lote: request.lote || null,
          consultaId: request.consultaId || null,
          createdAt: new Date().toISOString()
        };

        this.vacunas.update((actuales) => [mockResponse, ...actuales]);
        const listaMock = this.mockVacunas.get(mascotaId) || [];
        this.mockVacunas.set(mascotaId, [mockResponse, ...listaMock]);
        this.cargando.set(false);
        return of(mockResponse);
      })
    );
  }

  private inicializarMocks(): void {
    const mockMascotaId = 'f0000000-0000-0000-0000-000000000001';
    const hoy = new Date();
    
    // Vacuna próxima a vencer (en 15 días)
    const fechaProxima = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // Vacuna aplicada hace 1 año
    const fechaPasada = new Date(hoy.getTime() - 350 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.mockVacunas.set(mockMascotaId, [
      {
        id: 'vac-001',
        mascotaId: mockMascotaId,
        nombreVacuna: 'Séxtuple Canina (DHPPi/L)',
        fechaAplicacion: fechaPasada,
        proximaFecha: fechaProxima,
        veterinarioId: 'd0000000-0000-0000-0000-000000000001',
        veterinarioNombre: 'Dr. Beckhan Elias',
        lote: 'LOT-2025-V01',
        createdAt: '2025-11-15T10:00:00'
      },
      {
        id: 'vac-002',
        mascotaId: mockMascotaId,
        nombreVacuna: 'Antirrábica Canina',
        fechaAplicacion: '2025-08-10',
        proximaFecha: '2026-08-10',
        veterinarioId: 'd0000000-0000-0000-0000-000000000001',
        veterinarioNombre: 'Dr. Beckhan Elias',
        lote: 'LOT-2025-R09',
        createdAt: '2025-08-10T11:30:00'
      }
    ]);
  }
}
