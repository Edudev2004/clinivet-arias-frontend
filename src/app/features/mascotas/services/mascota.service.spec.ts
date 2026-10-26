import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MascotaService } from './mascota.service';
import { Mascota, MascotaCreateRequest, MascotaUpdateRequest } from '../models/mascota.model';
import { environment } from '../../../../environments/environment';

describe('MascotaService', () => {
  let service: MascotaService;
  let httpMock: HttpTestingController;

  const mockMascota: Mascota = {
    id: 'b0000000-0000-0000-0000-000000000001',
    propietarioId: 'p0000000-0000-0000-0000-000000000001',
    nombre: 'Bobby',
    especie: 'Canino',
    raza: 'Golden Retriever',
    sexo: 'M',
    pesoActualKg: 28.5,
    activo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MascotaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MascotaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente e inicializar el estado reactivo con mascotas', () => {
    expect(service).toBeTruthy();
    expect(service.mascotas().length).toBeGreaterThan(0);
    expect(service.cargando()).toBeFalse();
  });

  it('getMascotas debe retornar lista de mascotas desde la API', () => {
    const listado: Mascota[] = [mockMascota];

    service.getMascotas().subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data[0].nombre).toBe('Bobby');
      expect(service.mascotas().length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas`);
    expect(req.request.method).toBe('GET');
    req.flush(listado);
  });

  it('registrarMascota debe enviar payload POST y actualizar la señal reactiva', () => {
    const payload: MascotaCreateRequest = {
      propietarioId: 'p0000000-0000-0000-0000-000000000001',
      nombre: 'Rocky',
      especie: 'Canino',
      sexo: 'M',
      pesoActualKg: 15.0
    };

    const respuestaServidor: Mascota = {
      id: 'm-nuevo-123',
      ...payload,
      activo: true
    };

    service.registrarMascota(payload).subscribe((res) => {
      expect(res.id).toBe('m-nuevo-123');
      expect(service.mascotas()[0].nombre).toBe('Rocky');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas`);
    expect(req.request.method).toBe('POST');
    req.flush(respuestaServidor);
  });

  it('actualizarMascota debe enviar PUT y actualizar el registro local', () => {
    const updatePayload: MascotaUpdateRequest = {
      pesoActualKg: 30.0
    };

    const respuestaActualizada: Mascota = {
      ...mockMascota,
      pesoActualKg: 30.0
    };

    service.actualizarMascota(mockMascota.id, updatePayload).subscribe((res) => {
      expect(res.pesoActualKg).toBe(30.0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas/${mockMascota.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(respuestaActualizada);
  });

  it('eliminarMascota debe llamar a DELETE y remover la mascota del estado reactivo', () => {
    service.eliminarMascota(mockMascota.id).subscribe(() => {
      const encontrada = service.mascotas().find((m) => m.id === mockMascota.id);
      expect(encontrada).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/mascotas/${mockMascota.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('buscarPropietarios debe filtrar propietarios de muestra cuando no hay red', () => {
    service.buscarPropietarios('Carlos').subscribe((res) => {
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].nombre).toBe('Carlos');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios/buscar?q=carlos`);
    req.error(new ProgressEvent('Network error'));
  });
});
