import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HistorialClinicoModalComponent } from './historial-clinico-modal.component';
import { HistorialClinicoService } from '../../services/historial-clinico.service';
import { CitaService } from '../../../citas/services/cita.service';
import { EntradaHistorialClinico } from '../../models/historial-clinico.model';

describe('HistorialClinicoModalComponent (RF-25, RF-26 / Issue #45)', () => {
  let component: HistorialClinicoModalComponent;
  let fixture: ComponentFixture<HistorialClinicoModalComponent>;
  let historialService: jasmine.SpyObj<HistorialClinicoService>;
  let citaService: jasmine.SpyObj<CitaService>;

  const mockEntrada1: EntradaHistorialClinico = {
    id: 'hist-1',
    fecha: '2026-10-15',
    motivoConsulta: 'Control Periódico y Vacunación Preventiva',
    diagnostico: 'Examen clínico general sin anomalías',
    observaciones: 'Paciente en excelente condición',
    veterinario: {
      id: 'd0000000-0000-0000-0000-000000000001',
      nombre: 'Dr. Beckhan Elias',
      especialidad: 'Medicina General'
    },
    triaje: {
      pesoKg: 28.5,
      temperaturaC: 38.6
    },
    tratamientos: [
      {
        medicamento: 'Complejo Vitamínico',
        duracion: '15 días'
      }
    ],
    vacunasAplicadas: [
      {
        nombreVacuna: 'Séxtuple Canina',
        fechaAplicacion: '2026-10-15',
        proximaFecha: '2027-10-15'
      }
    ]
  };

  const mockEntrada2: EntradaHistorialClinico = {
    id: 'hist-2',
    fecha: '2026-08-20',
    motivoConsulta: 'Dermatitis Alérgica y Prurito',
    diagnostico: 'Dermatitis por picadura de pulga',
    veterinario: {
      id: 'd0000000-0000-0000-0000-000000000002',
      nombre: 'Dra. Lucero Pérez',
      especialidad: 'Dermatología'
    },
    triaje: {
      pesoKg: 28.1,
      temperaturaC: 38.8
    },
    tratamientos: [
      {
        medicamento: 'Apoquel 16mg',
        duracion: '14 días'
      }
    ],
    vacunasAplicadas: []
  };

  beforeEach(async () => {
    const histSpy = jasmine.createSpyObj('HistorialClinicoService', ['consultarHistorial'], {
      entradas: jasmine.createSpy('entradas').and.returnValue([mockEntrada1, mockEntrada2]),
      totalElementos: jasmine.createSpy('totalElementos').and.returnValue(2),
      totalPaginas: jasmine.createSpy('totalPaginas').and.returnValue(1),
      paginaActual: jasmine.createSpy('paginaActual').and.returnValue(0),
      cargando: jasmine.createSpy('cargando').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null)
    });

    const citaSpy = jasmine.createSpyObj('CitaService', ['listarVeterinarios'], {
      veterinarios: jasmine.createSpy('veterinarios').and.returnValue([
        {
          id: 'd0000000-0000-0000-0000-000000000001',
          nombreCompleto: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General'
        },
        {
          id: 'd0000000-0000-0000-0000-000000000002',
          nombreCompleto: 'Dra. Lucero Pérez',
          especialidad: 'Dermatología'
        }
      ])
    });

    histSpy.consultarHistorial.and.returnValue(
      of({
        content: [mockEntrada1, mockEntrada2],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 20
      })
    );
    citaSpy.listarVeterinarios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HistorialClinicoModalComponent, HttpClientTestingModule],
      providers: [
        { provide: HistorialClinicoService, useValue: histSpy },
        { provide: CitaService, useValue: citaSpy }
      ]
    }).compileComponents();

    historialService = TestBed.inject(HistorialClinicoService) as jasmine.SpyObj<HistorialClinicoService>;
    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;

    fixture = TestBed.createComponent(HistorialClinicoModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.mascotaId = 'f0000000-0000-0000-0000-000000000001';
    component.mascotaNombre = 'Bobby';
    fixture.detectChanges();
  });

  it('debe crearse y mostrar el nombre de la mascota y sus atenciones (RF-25)', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bobby');
    expect(historialService.consultarHistorial).toHaveBeenCalled();
  });

  it('debe aplicar filtros combinados de fecha y veterinario (RF-26)', () => {
    component.fechaInicio = '2026-08-01';
    component.fechaFin = '2026-08-31';
    component.filtroVeterinarioId = 'd0000000-0000-0000-0000-000000000002';

    component.aplicarFiltros();

    expect(historialService.consultarHistorial).toHaveBeenCalledWith(
      component.mascotaId,
      jasmine.objectContaining({
        fechaInicio: '2026-08-01',
        fechaFin: '2026-08-31',
        veterinarioId: 'd0000000-0000-0000-0000-000000000002',
        page: 0
      })
    );
  });

  it('debe limpiar filtros y restablecer la vista completa', () => {
    component.fechaInicio = '2026-08-01';
    component.filtroVeterinarioId = 'vet-1';
    component.filtroTermino = 'Apoquel';

    component.limpiarFiltros();

    expect(component.fechaInicio).toBe('');
    expect(component.filtroVeterinarioId).toBe('');
    expect(component.filtroTermino).toBe('');
    expect(historialService.consultarHistorial).toHaveBeenCalled();
  });

  it('toggleAcordeon debe alternar el estado de expansión de un registro', () => {
    component.acordeonesAbiertos['hist-1'] = true;
    component.toggleAcordeon('hist-1');
    expect(component.acordeonesAbiertos['hist-1']).toBeFalse();
    component.toggleAcordeon('hist-1');
    expect(component.acordeonesAbiertos['hist-1']).toBeTrue();
  });

  it('alternarTodosLosAcordeones debe expandir y colapsar todas las entradas', () => {
    component.todosExpandidos = true;
    component.alternarTodosLosAcordeones();
    expect(component.todosExpandidos).toBeFalse();
    expect(component.acordeonesAbiertos['hist-1']).toBeFalse();
  });

  it('onClose debe emitir evento close', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.isOpen).toBeFalse();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
