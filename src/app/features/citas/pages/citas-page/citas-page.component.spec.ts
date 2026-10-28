import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CitasPageComponent } from './citas-page.component';
import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';

describe('CitasPageComponent (RF-13, RF-16, RF-17, RF-18, RF-19)', () => {
  let component: CitasPageComponent;
  let fixture: ComponentFixture<CitasPageComponent>;
  let citaService: jasmine.SpyObj<CitaService>;

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

  beforeEach(async () => {
    const citaSpy = jasmine.createSpyObj('CitaService', [
      'listarCitas',
      'listarVeterinarios',
      'consultarDisponibilidad',
      'reprogramarCita',
      'cancelarCita',
      'actualizarEstadoCita'
    ], {
      citas: jasmine.createSpy('citas').and.returnValue([mockCita]),
      totalElementos: jasmine.createSpy('totalElementos').and.returnValue(1),
      cargando: jasmine.createSpy('cargando').and.returnValue(false),
      veterinarios: jasmine.createSpy('veterinarios').and.returnValue([])
    });

    await TestBed.configureTestingModule({
      imports: [CitasPageComponent, HttpClientTestingModule],
      providers: [{ provide: CitaService, useValue: citaSpy }]
    }).compileComponents();

    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;
    citaService.listarCitas.and.returnValue(of({
      content: [mockCita],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    }));

    fixture = TestBed.createComponent(CitasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de página de citas', () => {
    expect(component).toBeTruthy();
  });

  it('debe alternar la visualización del formulario de nueva cita', () => {
    expect(component.mostrarFormulario()).toBeFalse();
    component.abrirFormularioNuevaCita();
    expect(component.mostrarFormulario()).toBeTrue();
    component.cerrarFormulario();
    expect(component.mostrarFormulario()).toBeFalse();
  });

  it('debe filtrar citas por estado al hacer clic en los filtros rápidos (RF-18)', () => {
    component.filtrarPorEstado('PROGRAMADA');
    expect(component.filtroEstado()).toBe('PROGRAMADA');
    expect(citaService.listarCitas).toHaveBeenCalledWith({ estado: 'PROGRAMADA' });
  });

  it('debe mostrar mensaje de confirmación y recargar la lista cuando una cita es agendada (RF-13)', () => {
    component.mostrarFormulario.set(true);
    component.onCitaGuardada(mockCita);

    expect(component.mostrarFormulario()).toBeFalse();
    expect(component.mensajeExito()).toContain('Bobby');
    expect(component.mensajeExito()).toContain('Dr. Beckhan Elias');
    expect(citaService.listarCitas).toHaveBeenCalled();
  });

  it('debe abrir modal de detalle al seleccionar una cita (RF-16, RF-17, RF-19)', () => {
    component.verDetalleCita(mockCita);
    expect(component.citaSeleccionada()).toEqual(mockCita);

    const citaActualizada = { ...mockCita, estado: 'ATENDIDA' as const };
    component.onCitaActualizada(citaActualizada);
    expect(component.citaSeleccionada()).toBeNull();
    expect(component.mensajeExito()).toContain('actualizada exitosamente');
  });
});
