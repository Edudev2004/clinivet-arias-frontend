import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.userRole();

    // Si el rol del usuario coincide con los permitidos para la ruta
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Si no tiene permisos, redirige al login
    router.navigate(['/login']);
    return false;
  };
};