import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CitaFormComponent } from './cita-form.component';
import { CitaService } from '../../services/cita.service';
import { PropietarioService } from '../../../propietarios/services/propietario.service';
import { Cita, DisponibilidadResponse } from '../../models/cita.model';
import { Propietario, MascotaResumen } from '../../../propietarios/models/propietario.model';

describe('CitaFormComponent (RF-13, RF-14, RF-15)', () => {
  let component: CitaFormComponent;
  let fixture: ComponentFixture<CitaFormComponent>;
  let citaService: jasmine.SpyObj<CitaService>;
  let propietarioService: jasmine.SpyObj<PropietarioService>;

  const mockProp: Propietario = {
    id: 'p0000000-0000-0000-0000-000000000001',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    dni: '45892314',
    telefono: '987123456',
    activo: true,
    cantidadMascotas: 1
  };

  const mockMascota: MascotaResumen = {
    id: 'f0000000-0000-0000-0000-000000000001',
    nombre: 'Bobby',
    especie: 'Canino',
    sexo: 'M',
    activo: true,
    propietarioId: 'p0000000-0000-0000-0000-000000000001'
  };

  const mockCitaCreada: Cita = {
    id: 'c0000000-0000-0000-0000-000000000001',
    mascotaId: 'f0000000-0000-0000-0000-000000000001',
    nombreMascota: 'Bobby',
    especieMascota: 'Canino',
    propietarioId: 'p0000000-0000-0000-0000-000000000001',
    nombrePropietario: 'Carlos Mendoza',
    dniPropietario: '45892314',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    nombreVeterinario: 'Dr. Beckhan Elias',
    fecha: '2026-11-02',
    hora: '10:00',
    fechaHora: '2026-11-02T10:00:00',
    estado: 'PROGRAMADA',
    motivo: 'Vacunación periódica'
  };

  beforeEach(async () => {
    const citaSpy = jasmine.createSpyObj('CitaService', [
      'listarVeterinarios',
      'consultarDisponibilidad',
      'crearCita'
    ], {
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

    const propSpy = jasmine.createSpyObj('PropietarioService', ['buscar', 'listarMascotas']);
    propSpy.buscar.and.returnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 8 }));
    propSpy.listarMascotas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CitaFormComponent, HttpClientTestingModule],
      providers: [
        { provide: CitaService, useValue: citaSpy },
        { provide: PropietarioService, useValue: propSpy }
      ]
    }).compileComponents();

    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;
    propietarioService = TestBed.inject(PropietarioService) as jasmine.SpyObj<PropietarioService>;

    citaService.listarVeterinarios.and.returnValue(of([]));
    fixture = TestBed.createComponent(CitaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe buscar propietarios y mostrar resultados', () => {
    propietarioService.buscar.and.returnValue(of({
      content: [mockProp],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 8
    }));

    component.busquedaPropietario = 'Carlos';
    component.buscarPropietarios();

    expect(propietarioService.buscar).toHaveBeenCalledWith('Carlos', 0, 8);
    expect(component.listaPropietariosFiltrados().length).toBe(1);
    expect(component.mostrarResultadosPropietarios()).toBeTrue();
  });

  it('debe seleccionar propietario y cargar automáticamente sus mascotas', () => {
    propietarioService.listarMascotas.and.returnValue(of([mockMascota]));

    component.seleccionarPropietario(mockProp);

    expect(component.propietarioSeleccionado()).toEqual(mockProp);
    expect(component.mascotasDisponibles().length).toBe(1);
    expect(component.mascotaId).toBe(mockMascota.id);
  });

  it('debe consultar disponibilidad reactiva al cambiar veterinario, fecha y hora (RF-14)', () => {
    const mockDisp: DisponibilidadResponse = {
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      veterinarioNombre: 'Dr. Beckhan Elias',
      fecha: '2026-11-02',
      hora: '10:00:00',
      disponible: true,
      mensaje: 'Horario disponible para agendar'
    };
    citaService.consultarDisponibilidad.and.returnValue(of(mockDisp));

    component.veterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.fecha = '2026-11-02';
    component.hora = '10:00';
    component.verificarDisponibilidad();

    expect(citaService.consultarDisponibilidad).toHaveBeenCalledWith(
      'd0000000-0000-0000-0000-000000000001',
      '2026-11-02',
      '10:00'
    );
    expect(component.disponibilidadInfo()?.disponible).toBeTrue();
  });

  it('debe validar los campos requeridos antes de permitir submit', () => {
    propietarioService.listarMascotas.and.returnValue(of([mockMascota]));
    expect(component.esFormularioValido()).toBeFalse();

    component.seleccionarPropietario(mockProp);
    component.mascotaId = mockMascota.id;
    component.veterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.fecha = '2026-11-02';
    component.hora = '10:00';
    component.motivo = 'Control médico';

    expect(component.esFormularioValido()).toBeTrue();
  });

  it('debe emitir guardado al registrar exitosamente una cita (RF-13)', () => {
    spyOn(component.guardado, 'emit');
    propietarioService.listarMascotas.and.returnValue(of([mockMascota]));
    citaService.crearCita.and.returnValue(of(mockCitaCreada));

    component.seleccionarPropietario(mockProp);
    component.mascotaId = mockMascota.id;
    component.veterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.fecha = '2026-11-02';
    component.hora = '10:00';
    component.motivo = 'Vacunación periódica';

    component.onSubmit();

    expect(citaService.crearCita).toHaveBeenCalled();
    expect(component.guardado.emit).toHaveBeenCalledWith(mockCitaCreada);
    expect(component.guardando()).toBeFalse();
  });

  it('debe mostrar mensaje de error si el backend responde con conflicto de horario 409 (RF-15)', () => {
    propietarioService.listarMascotas.and.returnValue(of([mockMascota]));
    citaService.crearCita.and.returnValue(throwError(() => ({
      status: 409,
      error: { mensaje: 'Conflicto: ya existe una cita para el especialista a esa hora (RN-03)' }
    })));

    component.seleccionarPropietario(mockProp);
    component.mascotaId = mockMascota.id;
    component.veterinarioId = 'd0000000-0000-0000-0000-000000000001';
    component.fecha = '2026-11-02';
    component.hora = '10:00';
    component.motivo = 'Vacunación periódica';

    component.onSubmit();

    expect(component.mensajeError()).toContain('Conflicto');
    expect(component.guardando()).toBeFalse();
  });

  it('debe emitir cancelar al presionar cancelar', () => {
    spyOn(component.cancelar, 'emit');
    component.onCancelar();
    expect(component.cancelar.emit).toHaveBeenCalled();
  });
});
