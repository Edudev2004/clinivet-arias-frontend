import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        
        <!-- Icono de Seguridad / Acceso Denegado -->
        <div class="w-20 h-20 mx-auto rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zM12 16.5h.008v.008H12v-.008z" />
          </svg>
        </div>

        <!-- Encabezado -->
        <div class="space-y-2">
          <span class="inline-block text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Error 403 · Acceso Restringido
          </span>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Zona No Autorizada</h1>
          <p class="text-sm text-slate-500">
            No tienes privilegios suficientes para ingresar a este módulo del sistema.
          </p>
        </div>

        <!-- Tarjeta de Identidad y Rol Actual -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-1.5 text-xs text-slate-600">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-slate-500">Usuario:</span>
            <span class="font-bold text-slate-800">{{ userFullName() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-slate-500">Rol Activo:</span>
            <span class="font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px]">
              {{ roleLabel() }}
            </span>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="space-y-3 pt-2">
          <button
            type="button"
            (click)="irAlDashboard()"
            class="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#0D7C84] hover:bg-[#0b686f] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a mi Área Asignada
          </button>

          <button
            type="button"
            (click)="cerrarSesion()"
            class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Iniciar sesión con otra cuenta
          </button>
        </div>

      </div>
    </div>
  `
})
export class NoAutorizadoComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  userFullName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Usuario no identificado';
    return `${user.nombre} ${user.apellido}`.trim() || user.email;
  });

  roleLabel = computed(() => {
    const rol = this.currentUser()?.rol;
    switch (rol) {
      case 'ADMIN':
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'VETERINARIO':
        return 'Médico Veterinario';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      case 'ENCARGADO_INVENTARIO':
        return 'Encargado de Inventario';
      default:
        return rol || 'Sin Rol';
    }
  });

  irAlDashboard(): void {
    const rol = this.currentUser()?.rol;
    if (rol) {
      this.authService.redirectByRole(rol);
    } else {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
