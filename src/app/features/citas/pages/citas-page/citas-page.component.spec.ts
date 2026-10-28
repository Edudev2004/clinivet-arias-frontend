import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CitasPageComponent } from './citas-page.component';
import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';

describe('CitasPageComponent (RF-13 a RF-19 / Issue #35)', () => {
  let component: CitasPageComponent;
  let fixture: ComponentFixture<CitasPageComponent>;
  let citaService: jasmine.SpyObj<CitaService>;

  const mockCita1: Cita = {
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

  const mockCita2: Cita = {
    id: 'c0000000-0000-0000-0000-000000000002',
    mascotaId: 'f0000000-0000-0000-0000-000000000002',
    nombreMascota: 'Michi',
    especieMascota: 'Felino',
    propietarioId: 'e0000000-0000-0000-0000-000000000002',
    nombrePropietario: 'María Flores',
    dniPropietario: '72345678',
    veterinarioId: 'd0000000-0000-0000-0000-000000000002',
    nombreVeterinario: 'Dra. Lucero Pérez',
    fecha: '2026-11-02',
    hora: '11:00',
    fechaHora: '2026-11-02T11:00:00',
    estado: 'ATENDIDA',
    motivo: 'Desparasitación'
  };

  beforeEach(async () => {
    const citaSpy = jasmine.createSpyObj('CitaService', [
      'listarCitas',
      'listarVeterinarios',
      'consultarDisponibilidad',
      'reprogramarCita',
      'cancelarCita',
      'actualizarEstadoCita'
    ], {
      citas: jasmine.createSpy('citas').and.returnValue([mockCita1, mockCita2]),
      totalElementos: jasmine.createSpy('totalElementos').and.returnValue(2),
      totalPaginas: jasmine.createSpy('totalPaginas').and.returnValue(1),
      paginaActual: jasmine.createSpy('paginaActual').and.returnValue(0),
      cargando: jasmine.createSpy('cargando').and.returnValue(false),
      veterinarios: jasmine.createSpy('veterinarios').and.returnValue([
        {
          id: 'd0000000-0000-0000-0000-000000000001',
          nombreCompleto: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General',
          numeroColegiatura: 'CMVP-14892',
          activo: true
        }
      ])
    });

    await TestBed.configureTestingModule({
      imports: [CitasPageComponent, HttpClientTestingModule],
      providers: [{ provide: CitaService, useValue: citaSpy }]
    }).compileComponents();

    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;
    citaService.listarCitas.and.returnValue(of({
      content: [mockCita1, mockCita2],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10
    }));
    citaService.listarVeterinarios.and.returnValue(of([]));

    fixture = TestBed.createComponent(CitasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de página de citas', () => {
    expect(component).toBeTruthy();
  });

  it('debe alternar entre Modo Vista Tabla y Modo Vista Calendario (RF-18)', () => {
    expect(component.modoVista()).toBe('tabla');
    component.modoVista.set('calendario');
    expect(component.modoVista()).toBe('calendario');
  });

  it('debe agrupar las citas por veterinario para la vista calendario (RF-18)', () => {
    const agrupadas = component.citasAgrupadasPorVet();
    expect(agrupadas.length).toBe(2);
    expect(agrupadas.some((g) => g.veterinarioNombre === 'Dr. Beckhan Elias')).toBeTrue();
    expect(agrupadas.some((g) => g.veterinarioNombre === 'Dra. Lucero Pérez')).toBeTrue();
  });

  it('debe aplicar filtros por veterinario, fecha y estado dinámicamente (RF-18)', () => {
    component.filtroVeterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.filtroFecha = '2026-11-02';
    component.filtroEstado = 'PROGRAMADA';

    component.aplicarFiltros();

    expect(citaService.listarCitas).toHaveBeenCalledWith({
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      fecha: '2026-11-02',
      estado: 'PROGRAMADA',
      page: 0,
      size: 10
    });
  });

  it('debe limpiar filtros y recargar las citas completas', () => {
    component.filtroVeterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.filtroFecha = '2026-11-02';
    component.filtroEstado = 'PROGRAMADA';

    component.limpiarFiltros();

    expect(component.filtroVeterinarioId).toBe('');
    expect(component.filtroFecha).toBe('');
    expect(component.filtroEstado).toBeUndefined();
    expect(citaService.listarCitas).toHaveBeenCalled();
  });

  it('debe abrir y cerrar formulario de nueva cita', () => {
    component.abrirFormularioNuevaCita();
    expect(component.mostrarFormulario()).toBeTrue();
    component.cerrarFormulario();
    expect(component.mostrarFormulario()).toBeFalse();
  });

  it('debe abrir modal de detalle al seleccionar una cita', () => {
    component.verDetalleCita(mockCita1);
    expect(component.citaSeleccionada()).toEqual(mockCita1);
  });
});
