import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetCardComponent } from './pet-card.component';
import { Mascota } from '../../models/mascota.model';

describe('PetCardComponent', () => {
  let component: PetCardComponent;
  let fixture: ComponentFixture<PetCardComponent>;

  const mockMascota: Mascota = {
    id: 'b0000000-0000-0000-0000-000000000001',
    propietarioId: 'p0000000-0000-0000-0000-000000000001',
    propietarioNombre: 'Carlos Mendoza',
    nombre: 'Bobby',
    especie: 'Canino',
    raza: 'Golden Retriever',
    sexo: 'M',
    pesoActualKg: 28.5,
    fotoUrl: '',
    activo: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PetCardComponent);
    component = fixture.componentInstance;
    component.mascota = mockMascota;
    fixture.detectChanges();
  });

  it('debe crearse y renderizar el nombre de la mascota', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bobby');
    expect(compiled.textContent).toContain('Canino');
    expect(compiled.textContent).toContain('28.5 kg');
    expect(compiled.textContent).toContain('Carlos Mendoza');
  });

  it('debe emitir verFicha al hacer click en la tarjeta', () => {
    spyOn(component.verFicha, 'emit');
    component.onVerFicha();
    expect(component.verFicha.emit).toHaveBeenCalledWith(mockMascota);
  });

  it('debe emitir verHistorial sin propagar click al presionar el botón de historial', () => {
    spyOn(component.verHistorial, 'emit');
    const dummyEvent = new MouseEvent('click');
    spyOn(dummyEvent, 'stopPropagation');

    component.onVerHistorialClick(dummyEvent);
    expect(dummyEvent.stopPropagation).toHaveBeenCalled();
    expect(component.verHistorial.emit).toHaveBeenCalledWith(mockMascota);
  });
});
