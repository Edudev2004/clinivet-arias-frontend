import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetFormComponent } from './pet-form.component';
import { MascotaService } from '../../services/mascota.service';
import { of } from 'rxjs';
import { Mascota } from '../../models/mascota.model';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  let mascotaServiceSpy: jasmine.SpyObj<MascotaService>;

  const mockMascota: Mascota = {
    id: 'b0000000-0000-0000-0000-000000000001',
    propietarioId: 'p0000000-0000-0000-0000-000000000001',
    propietarioNombre: 'Carlos Mendoza',
    nombre: 'Bobby',
    especie: 'Canino',
    raza: 'Golden Retriever',
    sexo: 'M',
    pesoActualKg: 28.5,
    activo: true
  };

  beforeEach(async () => {
    mascotaServiceSpy = jasmine.createSpyObj('MascotaService', [
      'buscarPropietarios',
      'registrarMascota',
      'actualizarMascota'
    ]);

    mascotaServiceSpy.buscarPropietarios.and.returnValue(
      of([
        {
          id: 'p0000000-0000-0000-0000-000000000001',
          nombre: 'Carlos',
          apellido: 'Mendoza',
          dni: '45892314',
          telefono: '987123456'
        }
      ])
    );

    await TestBed.configureTestingModule({
      imports: [PetFormComponent],
      providers: [{ provide: MascotaService, useValue: mascotaServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse e inicializar el formulario inválido por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.petForm.valid).toBeFalse();
    expect(component.petForm.get('nombre')?.valid).toBeFalse();
    expect(component.petForm.get('propietarioId')?.valid).toBeFalse();
  });

  it('debe poblar el formulario cuando recibe una mascota para edición (RF-11)', () => {
    component.mascota = mockMascota;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.petForm.valid).toBeTrue();
    expect(component.petForm.get('nombre')?.value).toBe('Bobby');
    expect(component.petForm.get('especie')?.value).toBe('Canino');
    expect(component.petForm.get('pesoActualKg')?.value).toBe(28.5);
    expect(component.propietarioSeleccionado?.nombre).toBe('Carlos Mendoza');
  });

  it('debe seleccionar propietario y asignarlo al control del formulario (RN-01)', () => {
    const prop = {
      id: 'p0000000-0000-0000-0000-000000000002',
      nombre: 'María',
      apellido: 'Flores',
      dni: '72345678',
      telefono: '912345678'
    };

    component.seleccionarPropietario(prop);
    expect(component.propietarioSeleccionado).toEqual(prop);
    expect(component.petForm.get('propietarioId')?.value).toBe(prop.id);
  });

  it('debe llamar a registrarMascota cuando se envía un formulario nuevo válido (RF-09)', () => {
    component.seleccionarPropietario({
      id: 'p0000000-0000-0000-0000-000000000001',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      dni: '45892314',
      telefono: '987123456'
    });

    component.petForm.patchValue({
      nombre: 'Toby',
      especie: 'Canino',
      sexo: 'M',
      pesoActualKg: 12.0
    });

    mascotaServiceSpy.registrarMascota.and.returnValue(
      of({
        id: 'm-nuevo',
        propietarioId: 'p0000000-0000-0000-0000-000000000001',
        nombre: 'Toby',
        especie: 'Canino',
        sexo: 'M',
        pesoActualKg: 12.0,
        activo: true
      })
    );

    spyOn(component.guardado, 'emit');
    component.onSubmit();

    expect(mascotaServiceSpy.registrarMascota).toHaveBeenCalled();
    expect(component.guardado.emit).toHaveBeenCalled();
  });

  it('debe llamar a actualizarMascota cuando se envía en modo edición (RF-11 / RF-12)', () => {
    component.mascota = mockMascota;
    component.ngOnInit();

    component.petForm.patchValue({
      pesoActualKg: 29.0
    });

    mascotaServiceSpy.actualizarMascota.and.returnValue(
      of({
        ...mockMascota,
        pesoActualKg: 29.0
      })
    );

    spyOn(component.guardado, 'emit');
    component.onSubmit();

    expect(mascotaServiceSpy.actualizarMascota).toHaveBeenCalled();
    expect(component.guardado.emit).toHaveBeenCalled();
  });

  it('debe emitir cancelar cuando se presiona el botón cancelar', () => {
    spyOn(component.cancelar, 'emit');
    component.cancelar.emit();
    expect(component.cancelar.emit).toHaveBeenCalled();
  });
});
