import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si está autenticado con token activo, permite el acceso
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no hay token, redirige al login
  router.navigate(['/login']);
  return false;
};