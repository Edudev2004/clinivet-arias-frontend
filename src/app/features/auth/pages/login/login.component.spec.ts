import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginComponent (RF-01, RF-02, RF-04)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: {
    login: jasmine.Spy;
    sessionExpiredMessage: ReturnType<typeof signal<string | null>>;
  };
  let mockActivatedRoute: {
    snapshot: {
      queryParamMap: {
        get: jasmine.Spy;
      };
    };
  };

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({})),
      sessionExpiredMessage: signal<string | null>(null)
    };

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente con formulario inicializado', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('detecta queryParam expirado=true y activa alerta de sesión expirada (RF-04)', () => {
    mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('true');
    component.ngOnInit();

    expect(component.sessionExpired()).toBeTrue();
  });

  it('handleQuickFill rellena el email y contraseña predeterminada de la BD', () => {
    component.handleQuickFill('veterinario@clinivet.pe');

    expect(component.loginForm.value.email).toBe('veterinario@clinivet.pe');
    expect(component.loginForm.value.password).toBe('Admin123!');
    expect(component.errorMessage()).toBeNull();
    expect(component.sessionExpired()).toBeFalse();
  });

  it('onSubmit no envía credenciales si el formulario es inválido', () => {
    component.loginForm.setValue({
      email: '',
      password: '',
      rememberMe: false
    });

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('onSubmit envía credenciales a AuthService cuando el formulario es válido', () => {
    component.loginForm.setValue({
      email: 'admin@clinivet.pe',
      password: 'Admin123!',
      rememberMe: true
    });

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith(
      jasmine.objectContaining({
        email: 'admin@clinivet.pe',
        password: 'Admin123!'
      })
    );
  });

  it('muestra mensaje de error si el servidor rechaza las credenciales con 401', () => {
    mockAuthService.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.loginForm.setValue({
      email: 'admin@clinivet.pe',
      password: 'PasswordInvalido!',
      rememberMe: false
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Credenciales incorrectas. Verifica tu correo y contraseña.');
    expect(component.isLoading()).toBeFalse();
  });
});
