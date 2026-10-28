import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConsultaService } from './consulta.service';
import { environment } from '../../../../environments/environment';
import { Consulta, ConsultaCreateRequest, CalculoDosisResponse } from '../models/consulta.model';

describe('ConsultaService (RF-20, RF-22, RF-23)', () => {
  let service: ConsultaService;
  let httpMock: HttpTestingController;

  const mockConsulta: Consulta = {
    id: 'e0000000-0000-0000-0000-000000000001',
    citaId: 'c0000000-0000-0000-0000-000000000001',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    fecha: '2026-11-02',
    motivo: 'Decaimiento e inapetencia',
    diagnostico: 'Gastroenteritis bacteriana leve',
    pesoKg: 28.5,
    temperaturaC: 38.6,
    observaciones: 'Hidratación moderada'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConsultaService]
    });

    service = TestBed.inject(ConsultaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el servicio', () => {
    expect(service).toBeTruthy();
    expect(service.medicamentosCatalogo().length).toBeGreaterThan(0);
  });

  it('debe registrar una consulta médica vía POST /api/consultas (RF-20)', (done) => {
    const payload: ConsultaCreateRequest = {
      citaId: 'c0000000-0000-0000-0000-000000000001',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      fecha: '2026-11-02',
      motivo: 'Decaimiento e inapetencia',
      diagnostico: 'Gastroenteritis bacteriana leve',
      peso: 28.5,
      temperatura: 38.6
    };

    service.registrarConsulta(payload).subscribe({
      next: (res) => {
        expect(res.id).toBe(mockConsulta.id);
        expect(res.diagnostico).toContain('Gastroenteritis');
        expect(res.pesoKg).toBe(28.5);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/consultas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockConsulta);
  });

  it('debe calcular dosis total vía POST /api/tratamientos/calcular-dosis (RF-23 / RN-12)', (done) => {
    const mockCalc: CalculoDosisResponse = {
      pesoKg: 20.0,
      dosisMgPorKg: 12.5,
      dosisTotalMg: 250.0,
      unidadMedida: 'mg',
      formula: 'DosisTotal (mg) = Peso (kg) * Dosis (mg/kg)'
    };

    service.calcularDosis(20.0, 12.5).subscribe({
      next: (res) => {
        expect(res.dosisTotalMg).toBe(250.0);
        expect(res.unidadMedida).toBe('mg');
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tratamientos/calcular-dosis`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pesoKg: 20.0, dosisMgPorKg: 12.5 });
    req.flush(mockCalc);
  });

  it('debe prescribir tratamiento en consulta vía POST /api/consultas/{id}/tratamientos (RF-22)', (done) => {
    const tratPayload = {
      medicamentoId: 'm0000000-0000-0000-0000-000000000001',
      dosisMgPorKg: 15.0,
      duracionDias: 7,
      indicaciones: 'Cada 12 horas con alimento'
    };

    service.prescribirTratamiento('e0000000-0000-0000-0000-000000000001', tratPayload).subscribe({
      next: (trat) => {
        expect(trat.id).toBeTruthy();
        expect(trat.dosisMgPorKg).toBe(15.0);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/consultas/e0000000-0000-0000-0000-000000000001/tratamientos`);
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 't0000000-0000-0000-0000-000000000001',
      consultaId: 'e0000000-0000-0000-0000-000000000001',
      medicamentoId: tratPayload.medicamentoId,
      dosisMgPorKg: 15.0,
      dosisTotalMg: 427.5,
      duracionDias: 7,
      indicaciones: tratPayload.indicaciones
    });
  });
});
