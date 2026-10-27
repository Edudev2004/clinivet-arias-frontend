import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard (RF-03)', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthService: {
    isAuthenticated: jasmine.Spy;
    userRole: jasmine.Spy;
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = {
      isAuthenticated: jasmine.createSpy('isAuthenticated'),
      userRole: jasmine.createSpy('userRole')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('bloquea y redirige a /login si no hay token de autenticación activo', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);

    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() =>
      guardFn({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('permite el acceso si el rol del usuario coincide con los roles permitidos', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.userRole.and.returnValue('VETERINARIO');

    const guardFn = roleGuard(['ADMIN', 'VETERINARIO']);
    const result = TestBed.runInInjectionContext(() =>
      guardFn({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('permite el acceso considerando ADMINISTRADOR equivalente a ADMIN', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.userRole.and.returnValue('ADMINISTRADOR');

    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() =>
      guardFn({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
  });

  it('bloquea y redirige a /no-autorizado si el rol no tiene permisos', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.userRole.and.returnValue('RECEPCIONISTA');

    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() =>
      guardFn({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/no-autorizado']);
  });

  it('obtiene los roles permitidos desde route.data si no se pasan como argumento', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.userRole.and.returnValue('ENCARGADO_INVENTARIO');

    const routeMock = {
      data: { roles: ['ENCARGADO_INVENTARIO', 'ADMIN'] }
    } as unknown as ActivatedRouteSnapshot;

    const guardFn = roleGuard();
    const result = TestBed.runInInjectionContext(() =>
      guardFn(routeMock, {} as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
  });

  it('bloquea y redirige a /no-autorizado si el usuario no tiene ningún rol asignado', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.userRole.and.returnValue(null);

    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() =>
      guardFn({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/no-autorizado']);
  });
});
