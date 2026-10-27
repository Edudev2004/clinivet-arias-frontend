import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    BottomNavComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row">
      <!-- Barra lateral de navegación (Desktop hover expansible) -->
      <app-sidebar [activeRole]="userRole" (solicitarLogout)="mostrarModalLogout = true"></app-sidebar>

      <!-- Área de contenido principal -->
      <div class="flex-1 flex flex-col pl-0 md:pl-20 transition-all duration-300 min-w-0 pb-20 md:pb-8">
        <app-header
          [userName]="userName"
          [userFullName]="userFullName"
          [role]="userRole"
          (solicitarLogout)="mostrarModalLogout = true"
        ></app-header>

        <main class="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Menú inferior flotante (Solo Móvil - Estilo VetHD) -->
      <app-bottom-nav></app-bottom-nav>

      <!-- Modal de confirmación para cerrar sesión (RN-07 / APF2) -->
      <app-confirm-modal
        [isOpen]="mostrarModalLogout"
        title="¿Cerrar Sesión?"
        description="¿Estás seguro de que deseas salir del sistema Clinivet Arias? Deberás ingresar tus credenciales nuevamente para acceder."
        confirmText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
        variant="danger"
        (confirm)="confirmarLogout()"
        (cancel)="mostrarModalLogout = false"
      ></app-confirm-modal>
    </div>
  `
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  mostrarModalLogout = false;

  get currentUser() {
    return this.authService.currentUser();
  }

  get userName(): string {
    return this.currentUser?.nombre?.split(' ')[0] || 'Rommel';
  }

  get userFullName(): string {
    return this.currentUser
      ? `${this.currentUser.nombre} ${this.currentUser.apellido}`
      : 'Rommel Navarro';
  }

  get userRole(): 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA' {
    const rol = this.currentUser?.rol;
    if (rol === 'VETERINARIO' || rol === 'RECEPCIONISTA') {
      return rol;
    }
    return 'ADMIN';
  }

  confirmarLogout(): void {
    this.mostrarModalLogout = false;
    this.authService.logout();
  }
}
