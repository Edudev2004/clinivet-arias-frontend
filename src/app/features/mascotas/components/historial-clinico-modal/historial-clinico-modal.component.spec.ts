import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialClinicoModalComponent } from './historial-clinico-modal.component';

describe('HistorialClinicoModalComponent', () => {
  let component: HistorialClinicoModalComponent;
  let fixture: ComponentFixture<HistorialClinicoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialClinicoModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialClinicoModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.mascotaNombre = 'Bobby';
    fixture.detectChanges();
  });

  it('debe crearse y mostrar el nombre de la mascota y sus consultas', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bobby');
    expect(component.entradas.length).toBeGreaterThan(0);
  });

  it('debe filtrar atenciones medicas por término de búsqueda', () => {
    component.filtroTermino = 'Dermatitis';
    expect(component.entradasFiltradas.length).toBe(1);
    expect(component.entradasFiltradas[0].motivoConsulta).toContain('Dermatitis');
  });

  it('toggleAcordeon debe alternar el estado de expansion de un registro', () => {
    const primerId = component.entradas[0].id;
    component.acordeonesAbiertos[primerId] = true;
    component.toggleAcordeon(primerId);
    expect(component.acordeonesAbiertos[primerId]).toBeFalse();
  });

  it('onClose debe emitir evento close', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.isOpen).toBeFalse();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
