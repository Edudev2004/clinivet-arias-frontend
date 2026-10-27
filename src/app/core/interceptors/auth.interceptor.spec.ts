import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor (RF-04)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: {
    token: ReturnType<typeof signal<string | null>>;
    handleSessionExpired: jasmine.Spy;
  };

  beforeEach(() => {
    mockAuthService = {
      token: signal<string | null>('fake-jwt-token-123'),
      handleSessionExpired: jasmine.createSpy('handleSessionExpired')
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega el encabezado Authorization con Bearer token cuando existe sesión', () => {
    http.get('/api/mascotas').subscribe();

    const req = httpMock.expectOne('/api/mascotas');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token-123');
    req.flush([]);
  });

  it('no agrega Authorization si no hay token disponible', () => {
    mockAuthService.token.set(null);
    sessionStorage.removeItem('jwt_token');

    http.get('/api/public-endpoint').subscribe();

    const req = httpMock.expectOne('/api/public-endpoint');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('detecta HTTP 401 en peticiones autenticadas y llama a handleSessionExpired', () => {
    http.get('/api/mascotas').subscribe({
      next: () => fail('debió fallar con 401'),
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/mascotas');
    req.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.handleSessionExpired).toHaveBeenCalled();
  });

  it('no llama a handleSessionExpired si el 401 proviene del formulario de login', () => {
    http.post('/api/auth/login', { email: 'bad@user.com' }).subscribe({
      next: () => fail('debió fallar'),
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.handleSessionExpired).not.toHaveBeenCalled();
  });
});
