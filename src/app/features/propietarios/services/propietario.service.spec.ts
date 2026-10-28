import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PropietarioService } from './propietario.service';
import {
  Propietario,
  PropietarioCreateRequest,
  PropietarioUpdateRequest,
  PropietarioPage,
  MascotaResumen
} from '../models/propietario.model';
import { environment } from '../../../../environments/environment';

describe('PropietarioService', () => {
  let service: PropietarioService;
  let httpMock: HttpTestingController;

  const mockPropietario: Propietario = {
    id: 'e0000000-0000-0000-0000-000000000001',
    nombre: 'Carlos',
    apellido: 'Mendoza Ramos',
    nombreCompleto: 'Carlos Mendoza Ramos',
    dni: '45871236',
    telefono: '987654321',
    email: 'carlos.mendoza@gmail.com',
    direccion: 'Av. Universitaria 1240',
    activo: true,
    createdAt: '2026-10-27T10:00:00',
    cantidadMascotas: 1
  };

  const mockPage: PropietarioPage = {
    content: [mockPropietario],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  };

  const mockMascota: MascotaResumen = {
    id: 'f0000000-0000-0000-0000-000000000001',
    nombre: 'Firulais',
    especie: 'Canino',
    raza: 'Golden Retriever',
    sexo: 'Macho',
    fechaNacimiento: '2022-03-10',
    pesoActualKg: 28.5,
    activo: true,
    propietarioId: 'e0000000-0000-0000-0000-000000000001'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropietarioService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PropietarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
    expect(service.cargando()).toBeFalse();
    expect(service.propietarioSeleccionado()).toBeNull();
  });

  it('buscar debe enviar GET /api/propietarios con paginación y actualizar señales (RF-06)', () => {
    service.buscar(undefined, 0, 10).subscribe((page) => {
      expect(page.content.length).toBe(1);
      expect(page.totalElements).toBe(1);
      expect(service.propietarios().length).toBe(1);
      expect(service.propietarios()[0].nombre).toBe('Carlos');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios?page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('buscar con término debe incluir parámetro q (RF-06)', () => {
    service.buscar('Mendoza', 0, 10).subscribe((page) => {
      expect(page.content.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios?page=0&size=10&q=Mendoza`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('obtenerPorId debe enviar GET /api/propietarios/{id}', () => {
    service.obtenerPorId('e0000000-0000-0000-0000-000000000001').subscribe((res) => {
      expect(res.id).toBe('e0000000-0000-0000-0000-000000000001');
      expect(res.dni).toBe('45871236');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios/e0000000-0000-0000-0000-000000000001`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPropietario);
  });

  it('registrar debe enviar POST /api/propietarios y añadir a la señal (RF-05)', () => {
    const payload: PropietarioCreateRequest = {
      nombre: 'Carlos',
      apellido: 'Mendoza Ramos',
      dni: '45871236',
      telefono: '987654321',
      email: 'carlos.mendoza@gmail.com',
      direccion: 'Av. Universitaria 1240'
    };

    service.registrar(payload).subscribe((res) => {
      expect(res.id).toBe('e0000000-0000-0000-0000-000000000001');
      expect(service.propietarios()[0].dni).toBe('45871236');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockPropietario);
  });

  it('actualizar debe enviar PUT /api/propietarios/{id} y actualizar señales (RF-07)', () => {
    const payload: PropietarioUpdateRequest = {
      nombre: 'Carlos Alberto',
      apellido: 'Mendoza Ramos',
      dni: '45871236',
      telefono: '999888777',
      email: 'carlos.nuevo@gmail.com',
      direccion: 'Nueva Direccion 123',
      activo: true
    };

    const actualizado: Propietario = {
      ...mockPropietario,
      nombre: 'Carlos Alberto',
      telefono: '999888777'
    };

    service.actualizar('e0000000-0000-0000-0000-000000000001', payload).subscribe((res) => {
      expect(res.nombre).toBe('Carlos Alberto');
      expect(res.telefono).toBe('999888777');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios/e0000000-0000-0000-0000-000000000001`);
    expect(req.request.method).toBe('PUT');
    req.flush(actualizado);
  });

  it('listarMascotas debe enviar GET /api/propietarios/{id}/mascotas y actualizar mascotasDelPropietario (RF-08)', () => {
    service.listarMascotas('e0000000-0000-0000-0000-000000000001').subscribe((mascotas) => {
      expect(mascotas.length).toBe(1);
      expect(mascotas[0].nombre).toBe('Firulais');
      expect(service.mascotasDelPropietario().length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios/e0000000-0000-0000-0000-000000000001/mascotas`);
    expect(req.request.method).toBe('GET');
    req.flush([mockMascota]);
  });

  it('seleccionarPropietario debe actualizar la señal y cargar sus mascotas', () => {
    service.seleccionarPropietario(mockPropietario);
    expect(service.propietarioSeleccionado()).toEqual(mockPropietario);

    const req = httpMock.expectOne(`${environment.apiUrl}/propietarios/e0000000-0000-0000-0000-000000000001/mascotas`);
    expect(req.request.method).toBe('GET');
    req.flush([mockMascota]);
  });
});
