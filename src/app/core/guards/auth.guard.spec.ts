import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard (RF-03)', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthService: { isAuthenticated: jasmine.Spy };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = {
      isAuthenticated: jasmine.createSpy('isAuthenticated')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('permite el acceso si el usuario está autenticado con token activo', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('bloquea el acceso y redirige a /login si no hay token activo', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
