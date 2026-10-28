import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PetVacunasComponent } from './pet-vacunas.component';
import { VacunaService } from '../../services/vacuna.service';
import { CitaService } from '../../../citas/services/cita.service';
import { VacunaAplicada } from '../../models/vacuna.model';

describe('PetVacunasComponent (RF-24 / Issue #44)', () => {
  let component: PetVacunasComponent;
  let fixture: ComponentFixture<PetVacunasComponent>;
  let vacunaService: jasmine.SpyObj<VacunaService>;
  let citaService: jasmine.SpyObj<CitaService>;

  const mockMascotaId = 'f0000000-0000-0000-0000-000000000001';
  const mockVacuna: VacunaAplicada = {
    id: 'vac-1',
    mascotaId: mockMascotaId,
    nombreVacuna: 'Séxtuple Canina',
    fechaAplicacion: '2026-10-01',
    proximaFecha: '2027-10-01',
    veterinarioId: 'd0000000-0000-0000-0000-000000000001',
    veterinarioNombre: 'Dr. Beckhan Elias',
    lote: 'LOT-99'
  };

  beforeEach(async () => {
    const vacSpy = jasmine.createSpyObj('VacunaService', ['listarPorMascota', 'registrarVacuna'], {
      vacunas: jasmine.createSpy('vacunas').and.returnValue([mockVacuna]),
      cargando: jasmine.createSpy('cargando').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null)
    });

    const citaSpy = jasmine.createSpyObj('CitaService', ['listarVeterinarios'], {
      veterinarios: jasmine.createSpy('veterinarios').and.returnValue([
        {
          id: 'd0000000-0000-0000-0000-000000000001',
          nombreCompleto: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General',
          numeroColegiatura: 'CMVP-123',
          activo: true
        }
      ])
    });

    vacSpy.listarPorMascota.and.returnValue(of([mockVacuna]));
    citaSpy.listarVeterinarios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PetVacunasComponent, HttpClientTestingModule],
      providers: [
        { provide: VacunaService, useValue: vacSpy },
        { provide: CitaService, useValue: citaSpy }
      ]
    }).compileComponents();

    vacunaService = TestBed.inject(VacunaService) as jasmine.SpyObj<VacunaService>;
    citaService = TestBed.inject(CitaService) as jasmine.SpyObj<CitaService>;

    fixture = TestBed.createComponent(PetVacunasComponent);
    component = fixture.componentInstance;
    component.mascotaId = mockMascotaId;
    component.especie = 'Canino';
    fixture.detectChanges();
  });

  it('debe crearse el componente de vacunas de la mascota', () => {
    expect(component).toBeTruthy();
  });

  it('debe listar las vacunas al inicializar (RF-24)', () => {
    expect(vacunaService.listarPorMascota).toHaveBeenCalledWith(mockMascotaId);
    expect(component.vacunas().length).toBe(1);
    expect(component.vacunas()[0].nombreVacuna).toBe('Séxtuple Canina');
  });

  it('debe definir sugerencias frecuentes según la especie (Canino vs Felino)', () => {
    component.especie = 'Felino';
    component.definirSugerenciasPorEspecie();
    expect(component.sugerenciasVacunas.some((s) => s.includes('Triple Felina'))).toBeTrue();

    component.especie = 'Canino';
    component.definirSugerenciasPorEspecie();
    expect(component.sugerenciasVacunas.some((s) => s.includes('Séxtuple Canina'))).toBeTrue();
  });

  it('debe alternar la visibilidad del formulario de nueva vacuna', () => {
    expect(component.mostrarFormulario()).toBeFalse();
    component.alternarFormulario();
    expect(component.mostrarFormulario()).toBeTrue();
    component.alternarFormulario();
    expect(component.mostrarFormulario()).toBeFalse();
  });

  it('debe calcular vigencia visual de las vacunas (RF-24)', () => {
    const vigente = component.evaluar('2099-01-01');
    expect(vigente.estado).toBe('VIGENTE');

    const vencida = component.evaluar('2020-01-01');
    expect(vencida.estado).toBe('VENCIDA');
  });

  it('debe registrar una nueva vacuna y mostrar mensaje de éxito (RF-24)', () => {
    const nueva: VacunaAplicada = {
      id: 'vac-2',
      mascotaId: mockMascotaId,
      nombreVacuna: 'Antirrábica Canina',
      fechaAplicacion: '2026-10-28',
      proximaFecha: '2027-10-28',
      veterinarioId: 'd0000000-0000-0000-0000-000000000001'
    };
    vacunaService.registrarVacuna.and.returnValue(of(nueva));

    component.mostrarFormulario.set(true);
    component.nombreVacuna = 'Antirrábica Canina';
    component.fechaAplicacion = '2026-10-28';
    component.proximaFecha = '2027-10-28';
    component.veterinarioId = 'd0000000-0000-0000-0000-000000000001';

    component.guardarVacuna();

    expect(vacunaService.registrarVacuna).toHaveBeenCalled();
    expect(component.mostrarFormulario()).toBeFalse();
    expect(component.mensajeExito()).toContain('registrada con éxito');
  });
});
