import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Consulta,
  ConsultaCreateRequest,
  Tratamiento,
  TratamientoCreateRequest,
  CalculoDosisRequest,
  CalculoDosisResponse,
  MedicamentoCatalogo
} from '../models/consulta.model';

/**
 * Servicio reactivo para consultas clínicas veterinarias y cálculo de dosificación (RF-20, RF-21, RF-22, RF-23).
 * Cumple con SRP (comunicación HTTP y dosificación) y DIP (Signals de Angular 17).
 */
@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/consultas`;
  private readonly tratamientosUrl = `${environment.apiUrl}/tratamientos`;

  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Catálogo base de medicamentos de prescripción común
  readonly medicamentosCatalogo = signal<MedicamentoCatalogo[]>([
    {
      id: 'm0000000-0000-0000-0000-000000000001',
      nombre: 'Amoxicilina + Ácido Clavulánico',
      principioActivo: 'Amoxicilina / Clavulanato',
      presentacion: 'Comprimidos 250mg',
      unidadMedida: 'mg'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000002',
      nombre: 'Meloxicam 0.2%',
      principioActivo: 'Meloxicam',
      presentacion: 'Suspensión Oral 10ml',
      unidadMedida: 'mg'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000003',
      nombre: 'Doxiciclina 100mg',
      principioActivo: 'Doxiciclina Hiclato',
      presentacion: 'Blíster 10 tabletas',
      unidadMedida: 'mg'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000004',
      nombre: 'Prednisona 20mg',
      principioActivo: 'Prednisona',
      presentacion: 'Tabletas',
      unidadMedida: 'mg'
    },
    {
      id: 'm0000000-0000-0000-0000-000000000005',
      nombre: 'Tramadol Clorhidrato 50mg',
      principioActivo: 'Tramadol',
      presentacion: 'Gotero 10ml',
      unidadMedida: 'mg'
    }
  ]);

  /**
   * Registra una consulta médica completa vinculada a una cita (RF-20 / RN-04).
   * Actualiza el peso de la mascota (RF-12) y marca la cita como ATENDIDA.
   * Endpoint Spring Boot: POST /api/consultas
   */
  registrarConsulta(payload: ConsultaCreateRequest): Observable<Consulta> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http.post<Consulta>(this.baseUrl, payload).pipe(
      tap(() => this.cargando.set(false)),
      catchError((err) => {
        // Fallback offline para pruebas
        if (err.status === 0 || !err.status) {
          const mockConsulta: Consulta = {
            id: 'con-' + Math.random().toString(36).substring(2, 9),
            citaId: payload.citaId,
            veterinarioId: payload.veterinarioId,
            fecha: payload.fecha,
            motivo: payload.motivo,
            diagnostico: payload.diagnostico,
            pesoKg: payload.peso,
            temperaturaC: payload.temperatura,
            observaciones: payload.observaciones,
            createdAt: new Date().toISOString()
          };
          this.cargando.set(false);
          return of(mockConsulta);
        }
        this.cargando.set(false);
        throw err;
      })
    );
  }

  /**
   * Calcula matemáticamente la dosis total de medicamento (RF-23 / RN-12):
   * DosisTotal (mg) = Peso (kg) * Dosis (mg/kg).
   * Endpoint Spring Boot: POST /api/tratamientos/calcular-dosis
   */
  calcularDosis(pesoKg: number, dosisMgPorKg: number): Observable<CalculoDosisResponse> {
    const payload: CalculoDosisRequest = { pesoKg, dosisMgPorKg };

    return this.http
      .post<CalculoDosisResponse>(`${this.tratamientosUrl}/calcular-dosis`, payload)
      .pipe(
        catchError(() => {
          // Cálculo reactivo local en caso de desconexión
          const total = Math.round(pesoKg * dosisMgPorKg * 100) / 100;
          const mockResp: CalculoDosisResponse = {
            pesoKg,
            dosisMgPorKg,
            dosisTotalMg: total,
            unidadMedida: 'mg',
            formula: 'DosisTotal (mg) = Peso (kg) * Dosis (mg/kg)'
          };
          return of(mockResp);
        })
      );
  }

  /**
   * Prescribe un tratamiento vinculado a una consulta registrada (RF-22 / RF-23).
   * Endpoint Spring Boot: POST /api/consultas/{consultaId}/tratamientos
   */
  prescribirTratamiento(consultaId: string, payload: TratamientoCreateRequest): Observable<Tratamiento> {
    return this.http
      .post<Tratamiento>(`${this.baseUrl}/${consultaId}/tratamientos`, payload)
      .pipe(
        catchError((err) => {
          if (err.status === 0 || !err.status) {
            const med = this.medicamentosCatalogo().find((m) => m.id === payload.medicamentoId);
            const mockTrat: Tratamiento = {
              id: 'trat-' + Math.random().toString(36).substring(2, 9),
              consultaId,
              medicamentoId: payload.medicamentoId,
              nombreMedicamento: med?.nombre || 'Medicamento',
              dosisMgPorKg: payload.dosisMgPorKg,
              dosisTotalMg: Math.round(payload.dosisMgPorKg * 10 * 100) / 100,
              duracionDias: payload.duracionDias,
              indicaciones: payload.indicaciones,
              createdAt: new Date().toISOString()
            };
            return of(mockTrat);
          }
          throw err;
        })
      );
  }

  /**
   * Lista los tratamientos prescritos en una consulta (RF-22).
   * Endpoint Spring Boot: GET /api/consultas/{consultaId}/tratamientos
   */
  listarTratamientos(consultaId: string): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.baseUrl}/${consultaId}/tratamientos`).pipe(
      catchError(() => of([]))
    );
  }
}
