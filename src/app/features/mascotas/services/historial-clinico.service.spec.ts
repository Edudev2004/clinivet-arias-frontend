import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HistorialClinicoService } from './historial-clinico.service';
import { EntradaHistorialClinico, HistorialClinicoPaginado } from '../models/historial-clinico.model';
import { environment } from '../../../../environments/environment';

describe('HistorialClinicoService (RF-25, RF-26 / Issue #45)', () => {
  let service: HistorialClinicoService;
  let httpMock: HttpTestingController;

  const mockMascotaId = 'f0000000-0000-0000-0000-000000000001';
  const mockEntrada: EntradaHistorialClinico = {
    id: 'hist-1',
    fecha: '2026-10-15',
    motivoConsulta: 'Control de rutina',
    diagnostico: 'Paciente en perfecto estado',
    veterinario: {
      id: 'd0000000-0000-0000-0000-000000000001',
      nombre: 'Dr. Beckhan Elias',
      especialidad: 'Medicina General'
    },
    triaje: {
      pesoKg: 28.5,
      temperaturaC: 38.5
    },
    tratamientos: [],
    vacunasAplicadas: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HistorialClinicoService]
    });
    service = TestBed.inject(HistorialClinicoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el servicio de historial clínico', () => {
    expect(service).toBeTruthy();
  });

  it('debe consultar el historial clínico con filtros de fecha y veterinario (RF-25 / RF-26)', () => {
    const mockPaginado: HistorialClinicoPaginado = {
      content: [mockEntrada],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20
    };

    service
      .consultarHistorial(mockMascotaId, {
        fechaInicio: '2026-10-01',
        fechaFin: '2026-10-31',
        veterinarioId: 'd0000000-0000-0000-0000-000000000001',
        page: 0,
        size: 20
      })
      .subscribe((res) => {
        expect(res.content.length).toBe(1);
        expect(res.content[0].id).toBe('hist-1');
      });

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/mascotas/${mockMascotaId}/historial` &&
        request.params.get('fechaInicio') === '2026-10-01' &&
        request.params.get('fechaFin') === '2026-10-31' &&
        request.params.get('veterinarioId') === 'd0000000-0000-0000-0000-000000000001'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockPaginado);

    expect(service.entradas().length).toBe(1);
    expect(service.totalElementos()).toBe(1);
  });

  it('debe aplicar fallback local y filtrar por veterinario y rango de fechas', () => {
    // Forzar fallback de error HTTP
    service
      .consultarHistorial(mockMascotaId, {
        fechaInicio: '2026-06-01',
        fechaFin: '2026-11-01',
        veterinarioId: 'd0000000-0000-0000-0000-000000000001'
      })
      .subscribe((res) => {
        expect(res.content.length).toBeGreaterThanOrEqual(1);
        expect(
          res.content.every(
            (e) => e.veterinario.id === 'd0000000-0000-0000-0000-000000000001'
          )
        ).toBeTrue();
      });

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/mascotas/${mockMascotaId}/historial`
    );
    req.error(new ProgressEvent('Network error'));
  });
});
