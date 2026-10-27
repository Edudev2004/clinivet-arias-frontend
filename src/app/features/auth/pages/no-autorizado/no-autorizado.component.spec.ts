import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { NoAutorizadoComponent } from './no-autorizado.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioAutenticado } from '../../../../core/models/auth.model';

describe('NoAutorizadoComponent (RF-03)', () => {
  let component: NoAutorizadoComponent;
  let fixture: ComponentFixture<NoAutorizadoComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<UsuarioAutenticado | null>>;
    redirectByRole: jasmine.Spy;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = {
      currentUser: signal<UsuarioAutenticado | null>({
        id: 'u-1',
        nombre: 'Lucero',
        apellido: 'Perez',
        email: 'recepcion@clinivet.pe',
        rol: 'RECEPCIONISTA'
      }),
      redirectByRole: jasmine.createSpy('redirectByRole'),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [NoAutorizadoComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NoAutorizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el nombre completo del usuario y etiqueta de rol', () => {
    expect(component.userFullName()).toBe('Lucero Perez');
    expect(component.roleLabel()).toBe('Recepcionista');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucero Perez');
    expect(compiled.textContent).toContain('Recepcionista');
  });

  it('irAlDashboard invoca redirectByRole con el rol del usuario', () => {
    component.irAlDashboard();
    expect(mockAuthService.redirectByRole).toHaveBeenCalledWith('RECEPCIONISTA');
  });

  it('cerrarSesion invoca logout en AuthService', () => {
    component.cerrarSesion();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
