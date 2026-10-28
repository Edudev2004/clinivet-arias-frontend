import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PetDetailModalComponent } from './pet-detail-modal.component';
import { Mascota } from '../../models/mascota.model';

describe('PetDetailModalComponent (RF-10 / RF-24)', () => {
  let component: PetDetailModalComponent;
  let fixture: ComponentFixture<PetDetailModalComponent>;

  const mockMascota: Mascota = {
    id: 'b0000000-0000-0000-0000-000000000001',
    propietarioId: 'p0000000-0000-0000-0000-000000000001',
    propietarioNombre: 'Carlos Mendoza',
    propietarioDni: '45892314',
    propietarioTelefono: '987123456',
    nombre: 'Bobby',
    especie: 'Canino',
    raza: 'Golden Retriever',
    color: 'Dorado',
    sexo: 'M',
    pesoActualKg: 28.5,
    activo: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetDetailModalComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PetDetailModalComponent);
    component = fixture.componentInstance;
    component.mascota = mockMascota;
    fixture.detectChanges();
  });

  it('debe crearse y renderizar la información biométrica y del propietario', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bobby');
    expect(compiled.textContent).toContain('28.5 kg');
    expect(compiled.textContent).toContain('Dorado');
    expect(compiled.textContent).toContain('Carlos Mendoza');
    expect(compiled.textContent).toContain('45892314');
  });

  it('debe alternar entre pestaña general y pestaña de vacunas (RF-24)', () => {
    expect(component.tabActiva).toBe('general');
    component.tabActiva = 'vacunas';
    fixture.detectChanges();
    expect(component.tabActiva).toBe('vacunas');
  });

  it('debe calcular iniciales del propietario correctamente', () => {
    expect(component.getInitials('Carlos Mendoza')).toBe('CM');
    expect(component.getInitials('Luna')).toBe('LU');
  });

  it('debe emitir cerrar al invocar cerrar', () => {
    spyOn(component.cerrar, 'emit');
    component.cerrar.emit();
    expect(component.cerrar.emit).toHaveBeenCalled();
  });

  it('debe emitir editar con la mascota actual', () => {
    spyOn(component.editar, 'emit');
    component.editar.emit(mockMascota);
    expect(component.editar.emit).toHaveBeenCalledWith(mockMascota);
  });
});
