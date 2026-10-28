import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CitaDetailModalComponent } from './cita-detail-modal.component';
import { CitaService } from '../../services/cita.service';
import { Cita, DisponibilidadResponse } from '../../models/cita.model';

describe('CitaDetailModalComponent (RF-16, RF-17, RF-19)', () => {
  let component: CitaDetailModalComponent;
  let fixture: ComponentFixture<CitaDetailModalComponent>;
  let citaService: jasmine.SpyObj<CitaService>;

  const mockCitaProgramada: Cita = {
    id: 'c0000000-0000-0000-0000-000000000001',
    mascotaId: 'f0000000-0000-0000-0000-000000000001',
    nombreMascota: 'Bobby',
    especieMascota: 'Canino',
    propietarioId: 'e0000000-0000-0000-0000-000000000001',
    nombrePropietario: 'Carlos Mendoza',
    dniPropietario: '45892314',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    nombreVeterinario: 'Dr. Beckhan Elias',
    especialidadVeterinario: 'Medicina General',
    fecha: '2026-11-02',
    hora: '10:00',
    fechaHora: '2026-11-02T10:00:00',
    estado: 'PROGRAMADA',
    motivo: 'Vacunación y chequeo'
  };

  beforeEach(async () => {
    const citaSpy = jasmine.createSpyObj('CitaService', [
      'consultarDisponibilidad',
      'reprogramarCita',
      'cancelarCita',
      'actualizarEstadoCita'
    ]);

    await TestBed.configureTestingModule({
      imports: [CitaDetailModalComponent, HttpClientTestingModule],
      providers: [{ provide: CitaService, useValue: citaSpy }]
    }).compileComponents();

    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;
    fixture = TestBed.createComponent(CitaDetailModalComponent);
    component = fixture.componentInstance;
    component.cita = { ...mockCitaProgramada };
    fixture.detectChanges();
  });

  it('debe crearse el componente de detalle de cita', () => {
    expect(component).toBeTruthy();
  });

  it('debe abrir y verificar disponibilidad en modo reprogramar (RF-16)', () => {
    const mockDisp: DisponibilidadResponse = {
      veterinarioId: 'd0000000-0000-0000-0000-000000000001',
      veterinarioNombre: 'Dr. Beckhan Elias',
      fecha: '2026-11-05',
      hora: '11:00:00',
      disponible: true,
      mensaje: 'Horario libre para reprogramar'
    };
    citaService.consultarDisponibilidad.and.returnValue(of(mockDisp));

    component.activarReprogramacion();
    expect(component.modoReprogramar()).toBeTrue();

    component.nuevaFecha = '2026-11-05';
    component.nuevaHora = '11:00';
    component.verificarNuevaDisponibilidad();

    expect(citaService.consultarDisponibilidad).toHaveBeenCalledWith(
      component.cita.veterinarioId,
      '2026-11-05',
      '11:00'
    );
    expect(component.dispReprogramacion()?.disponible).toBeTrue();
  });

  it('debe ejecutar reprogramación y emitir citaActualizada (RF-16)', () => {
    spyOn(component.citaActualizada, 'emit');
    const reprogramada: Cita = {
      ...mockCitaProgramada,
      fecha: '2026-11-05',
      hora: '11:00',
      fechaHora: '2026-11-05T11:00:00'
    };
    citaService.reprogramarCita.and.returnValue(of(reprogramada));

    component.activarReprogramacion();
    component.nuevaFecha = '2026-11-05';
    component.nuevaHora = '11:00';
    component.ejecutarReprogramacion();

    expect(citaService.reprogramarCita).toHaveBeenCalledWith(mockCitaProgramada.id, {
      fecha: '2026-11-05',
      hora: '11:00'
    });
    expect(component.citaActualizada.emit).toHaveBeenCalledWith(reprogramada);
    expect(component.modoReprogramar()).toBeFalse();
  });

  it('debe ejecutar cancelación lógica y emitir citaActualizada (RF-17 / RN-07)', () => {
    spyOn(component.citaActualizada, 'emit');
    const cancelada: Cita = {
      ...mockCitaProgramada,
      estado: 'CANCELADA'
    };
    citaService.cancelarCita.and.returnValue(of(cancelada));

    component.modoConfirmarCancelar.set(true);
    component.ejecutarCancelacion();

    expect(citaService.cancelarCita).toHaveBeenCalledWith(mockCitaProgramada.id);
    expect(component.citaActualizada.emit).toHaveBeenCalledWith(cancelada);
    expect(component.modoConfirmarCancelar()).toBeFalse();
  });

  it('debe marcar como atendida la cita y emitir iniciarConsulta (RF-19)', () => {
    spyOn(component.citaActualizada, 'emit');
    spyOn(component.iniciarConsulta, 'emit');
    const atendida: Cita = {
      ...mockCitaProgramada,
      estado: 'ATENDIDA'
    };
    citaService.actualizarEstadoCita.and.returnValue(of(atendida));

    component.onMarcarAtendida();

    expect(citaService.actualizarEstadoCita).toHaveBeenCalledWith(mockCitaProgramada.id, {
      estado: 'ATENDIDA'
    });
    expect(component.citaActualizada.emit).toHaveBeenCalledWith(atendida);
    expect(component.iniciarConsulta.emit).toHaveBeenCalledWith(atendida);
  });

  it('debe mostrar error si la reprogramación falla por conflicto (RF-16 / 409)', () => {
    citaService.reprogramarCita.and.returnValue(throwError(() => ({
      status: 409,
      error: { mensaje: 'El veterinario ya cuenta con una cita en ese horario' }
    })));

    component.nuevaFecha = '2026-11-05';
    component.nuevaHora = '11:00';
    component.ejecutarReprogramacion();

    expect(component.mensajeError()).toContain('El veterinario ya cuenta');
    expect(component.ejecutando()).toBeFalse();
  });

  it('debe emitir evento cerrar al presionar cerrar', () => {
    spyOn(component.cerrar, 'emit');
    component.onCerrar();
    expect(component.cerrar.emit).toHaveBeenCalled();
  });
});
