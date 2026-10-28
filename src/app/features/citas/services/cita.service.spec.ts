import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CitaService } from './cita.service';
import { environment } from '../../../../environments/environment';
import { Cita, CitaCreateRequest, DisponibilidadResponse } from '../models/cita.model';

describe('CitaService (RF-13, RF-14, RF-15, RF-18)', () => {
  let service: CitaService;
  let httpMock: HttpTestingController;

  const mockCita: Cita = {
    id: 'c0000000-0000-0000-0000-000000000001',
    mascotaId: 'f0000000-0000-0000-0000-000000000001',
    nombreMascota: 'Bobby',
    especieMascota: 'Canino',
    propietarioId: 'e0000000-0000-0000-0000-000000000001',
    nombrePropietario: 'Carlos Mendoza',
    dniPropietario: '45892314',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    nombreVeterinario: 'Dr. Beckhan Elias',
    fecha: '2026-11-02',
    hora: '10:00',
    fechaHora: '2026-11-02T10:00:00',
    estado: 'PROGRAMADA',
    motivo: 'Control general y chequeo'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitaService]
    });

    service = TestBed.inject(CitaService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debe crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
    expect(service.veterinarios().length).toBeGreaterThan(0);
  });

  it('debe consultar disponibilidad del veterinario vía GET (RF-14)', (done) => {
    const mockDisp: DisponibilidadResponse = {
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      veterinarioNombre: 'Dr. Beckhan Elias',
      fecha: '2026-11-02',
      hora: '10:00:00',
      disponible: true,
      mensaje: 'Horario disponible para agendar',
      turnosDelDia: ['09:00 - 13:00']
    };

    service.consultarDisponibilidad('d0000000-0000-0000-0000-000000000001', '2026-11-02', '10:00').subscribe({
      next: (res) => {
        expect(res.disponible).toBeTrue();
        expect(res.veterinarioNombre).toBe('Dr. Beckhan Elias');
        done();
      }
    });

    const req = httpMock.expectOne((r) =>
      r.url === `${environment.apiUrl}/veterinarios/d0000000-0000-0000-0000-000000000001/disponibilidad` &&
      r.params.get('fecha') === '2026-11-02' &&
      r.params.get('hora') === '10:00:00'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockDisp);
  });

  it('debe registrar una nueva cita vía POST /api/citas (RF-13)', (done) => {
    const payload: CitaCreateRequest = {
      mascotaId: 'f0000000-0000-0000-0000-000000000001',
      propietarioId: 'e0000000-0000-0000-0000-000000000001',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      fecha: '2026-11-02',
      hora: '10:00',
      motivo: 'Vacunación anual'
    };

    service.crearCita(payload).subscribe({
      next: (cita) => {
        expect(cita.id).toBe(mockCita.id);
        expect(cita.estado).toBe('PROGRAMADA');
        expect(service.citas().some((c) => c.id === mockCita.id)).toBeTrue();
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/citas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCita);
  });

  it('debe propagar error 409 cuando el backend rechaza cruce de citas (RF-15 / RN-03)', (done) => {
    const payload: CitaCreateRequest = {
      mascotaId: 'f0000000-0000-0000-0000-000000000001',
      propietarioId: 'e0000000-0000-0000-0000-000000000001',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      fecha: '2026-11-02',
      hora: '10:00',
      motivo: 'Vacunación'
    };

    service.crearCita(payload).subscribe({
      next: () => fail('Debió fallar con 409'),
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.error.mensaje).toContain('conflicto');
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/citas`);
    req.flush(
      { mensaje: 'conflicto de horario: el veterinario ya cuenta con una cita' },
      { status: 409, statusText: 'Conflict' }
    );
  });

  it('debe listar citas paginadas con filtros (RF-18)', (done) => {
    const mockPage = {
      content: [mockCita],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    };

    service.listarCitas({ estado: 'PROGRAMADA', page: 0, size: 10 }).subscribe({
      next: (res) => {
        expect(res.content.length).toBe(1);
        expect(service.totalElementos()).toBe(1);
        done();
      }
    });

    const req = httpMock.expectOne((r) =>
      r.url === `${environment.apiUrl}/citas` &&
      r.params.get('estado') === 'PROGRAMADA' &&
      r.params.get('page') === '0'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });
});
