import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_info';

  currentUser = signal<LoginResponse['usuario'] | null>(this.getUserFromStorage());
  token = signal<string | null>(sessionStorage.getItem(this.TOKEN_KEY));

  isAuthenticated = computed(() => !!this.token());
  userRole = computed(() => this.currentUser()?.rol || null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
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
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  redirectByRole(rol: string): void {
    switch (rol) {
      case 'ADMIN':
      case 'RECEPCIONISTA':
        this.router.navigate(['/dashboard/admin']);
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