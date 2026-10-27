import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional para control de acceso basado en roles (RF-03).
 * Redirige a /no-autorizado si el rol no tiene permisos, o a /login si no hay sesión.
 */
export const roleGuard = (allowedRoles?: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const roles = allowedRoles || (route.data?.['roles'] as string[]) || [];
    if (roles.length === 0) {
      return true;
    }

    const currentRole = authService.userRole();
    if (!currentRole) {
      router.navigate(['/no-autorizado']);
      return false;
    }

    // Normalización: ADMIN y ADMINISTRADOR se consideran equivalentes
    const isAuthorized = roles.some((role) => {
      if (role === 'ADMIN' || role === 'ADMINISTRADOR') {
        return currentRole === 'ADMIN' || currentRole === 'ADMINISTRADOR';
      }
      return role === currentRole;
    });

    if (isAuthorized) {
      return true;
    }

    router.navigate(['/no-autorizado']);
    return false;
  };
};