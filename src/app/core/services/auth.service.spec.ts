import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService (RF-01, RF-03, RF-04)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('inicia sesión con éxito, almacena token/usuario en sessionStorage y actualiza signals', () => {
    const mockBackendResponse = {
      token: 'jwt-xyz-123',
      idUsuario: 'b0000000-0000-0000-0000-000000000001',
      email: 'admin@clinivet.pe',
      nombres: 'Rommel',
      apellidos: 'Navarro',
      rol: 'ADMINISTRADOR',
      expiresIn: 86400000
    };

    service.login({ email: 'admin@clinivet.pe', password: 'Admin123!' }).subscribe((res) => {
      expect(res.token).toBe('jwt-xyz-123');
      expect(res.usuario.nombre).toBe('Rommel');
      expect(res.usuario.rol).toBe('ADMIN');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('admin@clinivet.pe');
    expect(req.request.body.password).toBe('Admin123!');
    req.flush(mockBackendResponse);

    expect(sessionStorage.getItem('jwt_token')).toBe('jwt-xyz-123');
    expect(service.token()).toBe('jwt-xyz-123');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.userRole()).toBe('ADMIN');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin']);
  });

  it('logout() limpia almacenamiento, resetea estado y redirige a /login (RF-04)', () => {
    sessionStorage.setItem('jwt_token', 'test-token');
    sessionStorage.setItem('user_info', JSON.stringify({ nombre: 'Test' }));
    service.token.set('test-token');

    service.logout();

    // Petición de revocación en backend
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Sesión cerrada exitosamente' });

    expect(sessionStorage.getItem('jwt_token')).toBeNull();
    expect(sessionStorage.getItem('user_info')).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('handleSessionExpired() limpia tokens, establece mensaje y redirige con queryParam (RF-04)', () => {
    sessionStorage.setItem('jwt_token', 'expired-token');
    service.token.set('expired-token');

    service.handleSessionExpired();

    expect(sessionStorage.getItem('jwt_token')).toBeNull();
    expect(service.token()).toBeNull();
    expect(service.sessionExpiredMessage()).toContain('expirado');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expirado: 'true' } });
  });

  it('redirectByRole() navega al dashboard correcto según cada rol (RF-03)', () => {
    service.redirectByRole('ADMIN');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/admin']);

    service.redirectByRole('VETERINARIO');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/veterinario']);

    service.redirectByRole('ENCARGADO_INVENTARIO');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/inventario']);

    service.redirectByRole('RECEPCIONISTA');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/citas']);
  });
});
