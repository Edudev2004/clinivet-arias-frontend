import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioAutenticado } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_info';

  currentUser = signal<UsuarioAutenticado | null>(this.getUserFromStorage());
  token = signal<string | null>(sessionStorage.getItem(this.TOKEN_KEY));
  sessionExpiredMessage = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.token());
  userRole = computed(() => this.currentUser()?.rol || null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.sessionExpiredMessage.set(null);
    const payload = {
      email: credentials.email,
      password: credentials.password || credentials.password_hash,
      password_hash: credentials.password_hash || credentials.password
    };

    return this.http.post<any>(`${environment.apiUrl}/auth/login`, payload).pipe(
      map((response: any) => {
        // Backend de Spring Boot retorna: { token, tipo, idUsuario, email, nombres, apellidos, rol, expiresIn }
        const rolRaw = response.rol || response.usuario?.rol || 'ADMIN';
        const rolNormalizado: UsuarioAutenticado['rol'] =
          rolRaw === 'ADMINISTRADOR' ? 'ADMIN' : (rolRaw as UsuarioAutenticado['rol']);

        const loginRes: LoginResponse = {
          token: response.token,
          usuario: response.usuario || {
            id: String(response.idUsuario || response.id || ''),
            nombre: response.nombres || response.nombre || '',
            apellido: response.apellidos || response.apellido || '',
            email: response.email || credentials.email,
            rol: rolNormalizado
          }
        };
        return loginRes;
      }),
      tap((response) => {
        sessionStorage.setItem(this.TOKEN_KEY, response.token);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));

        this.token.set(response.token);
        this.currentUser.set(response.usuario);

        this.redirectByRole(response.usuario.rol);
      })
    );
  }

  logout(): void {
    const currentToken = this.token();
    if (currentToken) {
      // Notifica al backend para invalidar en blacklist (RF-04)
      this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    }

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.sessionExpiredMessage.set(null);
    this.router.navigate(['/login']);
  }

  handleSessionExpired(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.sessionExpiredMessage.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    this.router.navigate(['/login'], { queryParams: { expirado: 'true' } });
  }

  redirectByRole(rol: string): void {
    switch (rol) {
      case 'ADMIN':
      case 'ADMINISTRADOR':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'RECEPCIONISTA':
        this.router.navigate(['/dashboard/recepcionista']);
        break;
      case 'VETERINARIO':
        this.router.navigate(['/dashboard/veterinario']);
        break;
      case 'ENCARGADO_INVENTARIO':
        this.router.navigate(['/dashboard/inventario']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  private getUserFromStorage(): LoginResponse['usuario'] | null {
    const userStr = sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}