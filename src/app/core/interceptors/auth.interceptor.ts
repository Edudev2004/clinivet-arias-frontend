import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para autenticación y expiración de sesión (RF-04 / RNF-04).
 * 1. Agrega el encabezado Authorization con token JWT a las peticiones salientes.
 * 2. Detecta respuestas 401 (token expirado o en lista negra) y redirige a login con aviso.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token() || sessionStorage.getItem('jwt_token');

  let authReq = req;
  // Solo inyectar token si existe y la petición no lleva ya un encabezado Authorization
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // No interceptar como sesión expirada si el 401 proviene del formulario de login
        const isLoginRequest = req.url.includes('/auth/login');
        if (!isLoginRequest) {
          authService.handleSessionExpired();
        }
      }
      return throwError(() => error);
    })
  );
};
