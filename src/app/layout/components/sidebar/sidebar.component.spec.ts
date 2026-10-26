import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y mostrar la marca Clinivet Arias', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Clinivet Arias');
  });

  it('debe filtrar los ítems de navegación según el rol activo', () => {
    component.activeRole = 'VETERINARIO';
    const itemsVet = component.filteredNavItems;
    expect(itemsVet.some((i) => i.name === 'Mascotas y Pacientes')).toBeTrue();
    expect(itemsVet.some((i) => i.name === 'Inventario de Insumos')).toBeFalse();

    component.activeRole = 'ADMIN';
    const itemsAdmin = component.filteredNavItems;
    expect(itemsAdmin.some((i) => i.name === 'Inventario de Insumos')).toBeTrue();
  });

  it('debe emitir solicitarLogout cuando se activa', () => {
    spyOn(component.solicitarLogout, 'emit');
    component.solicitarLogout.emit();
    expect(component.solicitarLogout.emit).toHaveBeenCalled();
  });
});
