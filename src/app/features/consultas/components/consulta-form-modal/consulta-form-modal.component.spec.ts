import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ConsultaFormModalComponent } from './consulta-form-modal.component';
import { ConsultaService } from '../../services/consulta.service';
import { Consulta } from '../../models/consulta.model';
import { Cita } from '../../../citas/models/cita.model';

describe('ConsultaFormModalComponent (RF-20, RF-21, RF-22, RF-23)', () => {
  let component: ConsultaFormModalComponent;
  let fixture: ComponentFixture<ConsultaFormModalComponent>;
  let consultaService: jasmine.SpyObj<ConsultaService>;

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
    motivo: 'Decaimiento general'
  };

  const mockConsultaCreada: Consulta = {
    id: 'e0000000-0000-0000-0000-000000000001',
    citaId: mockCita.id,
    veterinarioId: mockCita.veterinarioId,
    fecha: mockCita.fecha,
    motivo: mockCita.motivo,
    diagnostico: 'Gastroenteritis bacteriana',
    pesoKg: 20.0,
    temperaturaC: 38.5
  };

  beforeEach(async () => {
    const consultaSpy = jasmine.createSpyObj('ConsultaService', [
      'registrarConsulta',
      'calcularDosis',
      'prescribirTratamiento'
    ], {
      medicamentosCatalogo: jasmine.createSpy('medicamentosCatalogo').and.returnValue([
        {
          id: 'm0000000-0000-0000-0000-000000000001',
          nombre: 'Amoxicilina 250mg',
          unidadMedida: 'mg'
        }
      ])
    });

    await TestBed.configureTestingModule({
      imports: [ConsultaFormModalComponent, HttpClientTestingModule],
      providers: [{ provide: ConsultaService, useValue: consultaSpy }]
    }).compileComponents();

    consultaService = TestBed.inject(ConsultaService) as jasmine.SpyObj<ConsultaService>;
    fixture = TestBed.createComponent(ConsultaFormModalComponent);
    component = fixture.componentInstance;
    component.cita = { ...mockCita };
    fixture.detectChanges();
  });

  it('debe crearse el componente de consulta médica', () => {
    expect(component).toBeTruthy();
    expect(component.motivo).toBe(mockCita.motivo);
  });

  it('debe calcular la dosis total en tiempo real usando peso * dosisMgPorKg (RF-23 / RN-12)', () => {
    component.peso = 25.0;
    component.nuevaDosisMgPorKg = 10.0;
    const preview = component.calcularDosisTotalPreview();
    expect(preview).toBe(250.0);
  });

  it('debe agregar y eliminar prescripciones de tratamiento dinámicamente (RF-22)', () => {
    component.peso = 20.0;
    component.nuevoMedicamentoId = 'm0000000-0000-0000-0000-000000000001';
    component.nuevaDosisMgPorKg = 15.0;
    component.nuevaDuracionDias = 5;
    component.nuevasIndicaciones = 'Cada 12 horas';

    component.agregarTratamiento();

    expect(component.listaTratamientos().length).toBe(1);
    expect(component.listaTratamientos()[0].dosisTotalMg).toBe(300.0);

    component.eliminarTratamiento(0);
    expect(component.listaTratamientos().length).toBe(0);
  });

  it('debe validar que los campos clínicos sean obligatorios antes del envío', () => {
    expect(component.esFormularioValido()).toBeFalse();

    component.peso = 20.0;
    component.temperatura = 38.5;
    component.motivo = 'Decaimiento';
    component.diagnostico = 'Infección respiratoria';

    expect(component.esFormularioValido()).toBeTrue();
  });

  it('debe registrar la consulta médica y prescribir tratamientos asociados (RF-20, RF-22)', () => {
    spyOn(component.consultaRegistrada, 'emit');
    consultaService.registrarConsulta.and.returnValue(of(mockConsultaCreada));
    consultaService.prescribirTratamiento.and.returnValue(of({
      id: 't0000000-0000-0000-0000-000000000001',
      consultaId: mockConsultaCreada.id,
      medicamentoId: 'm0000000-0000-0000-0000-000000000001',
      dosisMgPorKg: 10,
      dosisTotalMg: 200,
      duracionDias: 5
    }));

    component.peso = 20.0;
    component.temperatura = 38.5;
    component.motivo = 'Control';
    component.diagnostico = 'Gastroenteritis bacteriana';

    component.nuevoMedicamentoId = 'm0000000-0000-0000-0000-000000000001';
    component.nuevaDosisMgPorKg = 10;
    component.nuevaDuracionDias = 5;
    component.agregarTratamiento();

    component.onSubmit();

    expect(consultaService.registrarConsulta).toHaveBeenCalled();
    expect(consultaService.prescribirTratamiento).toHaveBeenCalled();
    expect(component.consultaGuardada()).toEqual(mockConsultaCreada);
    expect(component.consultaRegistrada.emit).toHaveBeenCalledWith(mockConsultaCreada);
  });

  it('debe mostrar mensaje de error si el guardado falla', () => {
    consultaService.registrarConsulta.and.returnValue(throwError(() => ({
      status: 403,
      error: { mensaje: 'Solo usuarios con rol VETERINARIO pueden registrar atenciones clínicas (RN-04)' }
    })));

    component.peso = 20.0;
    component.temperatura = 38.5;
    component.motivo = 'Control';
    component.diagnostico = 'Gastroenteritis';

    component.onSubmit();

    expect(component.mensajeError()).toContain('rol VETERINARIO');
    expect(component.guardando()).toBeFalse();
  });
});
