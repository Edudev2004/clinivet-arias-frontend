import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ConfirmModalComponent],
  template: `
    <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row">
      <!-- Barra lateral de navegación (Desktop hover expansible) -->
      <app-sidebar (solicitarLogout)="mostrarModalLogout = true"></app-sidebar>

      <!-- Área de contenido principal -->
      <div class="flex-1 flex flex-col pl-0 md:pl-20 transition-all duration-300 min-w-0 pb-16 md:pb-8">
        <app-header (solicitarLogout)="mostrarModalLogout = true"></app-header>

        <main class="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Modal de confirmación para cerrar sesión -->
      <app-confirm-modal
        [isOpen]="mostrarModalLogout"
        title="¿Cerrar Sesión?"
        description="¿Estás seguro de que deseas salir del sistema Clinivet Arias? Deberás ingresar tus credenciales nuevamente."
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
  mostrarModalLogout = false;

  confirmarLogout(): void {
    this.mostrarModalLogout = false;
    // Notificación en consola o redirección cuando el módulo de autenticación de Lucero esté integrado
    console.info('Cierre de sesión solicitado por el usuario.');
  }
}
