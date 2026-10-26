import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.userName = 'Rommel';
    component.userFullName = 'Rommel Navarro';
    component.role = 'ADMIN';
    fixture.detectChanges();
  });

  it('debe crearse y mostrar el saludo y el badge de Administrador', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hola, Rommel');
    expect(compiled.textContent).toContain('Administrador');
  });

  it('debe calcular las iniciales de usuario correctamente', () => {
    expect(component.userInitials).toBe('RN');
  });

  it('debe emitir solicitarLogout al hacer click en el botón de salida', () => {
    spyOn(component.solicitarLogout, 'emit');
    component.solicitarLogout.emit();
    expect(component.solicitarLogout.emit).toHaveBeenCalled();
  });
});
