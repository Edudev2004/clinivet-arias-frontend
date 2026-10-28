import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VacunaService } from './vacuna.service';
import {
  VacunaAplicada,
  VacunaAplicadaRequest,
  evaluarVigenciaVacuna
} from '../models/vacuna.model';
import { environment } from '../../../../environments/environment';

describe('VacunaService (RF-24 / Issue #44)', () => {
  let service: VacunaService;
  let httpMock: HttpTestingController;

  const mockMascotaId = 'f0000000-0000-0000-0000-000000000001';
  const mockVacuna: VacunaAplicada = {
    id: 'vac-101',
    mascotaId: mockMascotaId,
    nombreVacuna: 'Séxtuple Canina',
    fechaAplicacion: '2026-10-01',
    proximaFecha: '2027-10-01',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    veterinarioNombre: 'Dr. Beckhan Elias',
    lote: 'LOT-99',
    createdAt: '2026-10-01T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VacunaService]
    });
    service = TestBed.inject(VacunaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el servicio de vacunas', () => {
    expect(service).toBeTruthy();
  });

  it('debe listar vacunas aplicadas de una mascota (GET /api/mascotas/{id}/vacunas)', () => {
    service.listarPorMascota(mockMascotaId).subscribe((vacunas) => {
      expect(vacunas.length).toBe(1);
      expect(vacunas[0].nombreVacuna).toBe('Séxtuple Canina');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas/${mockMascotaId}/vacunas`);
    expect(req.request.method).toBe('GET');
    req.flush([mockVacuna]);

    expect(service.vacunas().length).toBe(1);
    expect(service.cargando()).toBeFalse();
  });

  it('debe registrar una nueva vacuna aplicada (POST /api/mascotas/{id}/vacunas)', () => {
    const payload: VacunaAplicadaRequest = {
      nombreVacuna: 'Antirrábica',
      fechaAplicacion: '2026-10-28',
      proximaFecha: '2027-10-28',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      lote: 'LOT-RAB-2026'
    };

    const responseEsperada: VacunaAplicada = {
      id: 'vac-102',
      mascotaId: mockMascotaId,
      ...payload,
      veterinarioNombre: 'Dr. Beckhan Elias',
      createdAt: '2026-10-28T15:00:00'
    };

    service.registrarVacuna(mockMascotaId, payload).subscribe((resp) => {
      expect(resp.id).toBe('vac-102');
      expect(resp.nombreVacuna).toBe('Antirrábica');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas/${mockMascotaId}/vacunas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(responseEsperada);

    expect(service.vacunas().some((v) => v.nombreVacuna === 'Antirrábica')).toBeTrue();
  });

  describe('evaluarVigenciaVacuna (RF-24 Indicador de Vencimiento)', () => {
    it('debe marcar PROXIMA_VENCER si la fecha es menor o igual a 30 días', () => {
      const hoy = new Date();
      const en15Dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const evaluacion = evaluarVigenciaVacuna(en15Dias);
      expect(evaluacion.estado).toBe('PROXIMA_VENCER');
      expect(evaluacion.badgeClass).toContain('amber');
    });

    it('debe marcar VENCIDA si la fecha de refuerzo ya pasó', () => {
      const pasada = '2020-01-01';
      const evaluacion = evaluarVigenciaVacuna(pasada);
      expect(evaluacion.estado).toBe('VENCIDA');
      expect(evaluacion.badgeClass).toContain('rose');
    });

    it('debe marcar VIGENTE si la fecha es mayor a 30 días en el futuro', () => {
      const hoy = new Date();
      const en6Meses = new Date(hoy.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const evaluacion = evaluarVigenciaVacuna(en6Meses);
      expect(evaluacion.estado).toBe('VIGENTE');
      expect(evaluacion.badgeClass).toContain('emerald');
    });

    it('debe marcar SIN_REFUERZO si no se especificó próxima fecha', () => {
      const evaluacion = evaluarVigenciaVacuna(null);
      expect(evaluacion.estado).toBe('SIN_REFUERZO');
    });
  });
});
