import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/60 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      <!-- Saludo y Rol del Usuario -->
      <div class="flex items-center gap-3">
        <!-- Logo en dispositivos móviles (donde el sidebar está oculto) -->
        <a routerLink="/mascotas" class="md:hidden flex items-center flex-shrink-0 p-1 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
          <img src="assets/img/logo.png" alt="Clinivet Arias" class="w-7 h-7 object-contain" />
        </a>

        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-outfit">
            Hola, {{ userName }}
          </h2>

          <!-- Badge Semántico del Rol -->
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
            [ngClass]="{
              'bg-amber-50 text-amber-700 border border-amber-300': role === 'ADMIN',
              'bg-blue-50 text-brand-700 border border-brand-200': role === 'VETERINARIO',
              'bg-sky-50 text-sky-700 border border-sky-300': role === 'RECEPCIONISTA'
            }"
          >
            @if (role === 'ADMIN') {
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              <span>Administrador</span>
            } @else if (role === 'VETERINARIO') {
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5v3a7.5 7.5 0 0015 0v-3m-15 0h3m12 0h-3m-7.5 7.5v3.75a3.75 3.75 0 007.5 0v-1.5m0 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
              </svg>
              <span>Médico Veterinario</span>
            } @else {
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              </svg>
              <span>Recepcionista</span>
            }
          </span>
        </div>
      </div>

      <!-- Controles de la Derecha: Notificaciones, Avatar y Cerrar Sesión -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Botón de Notificaciones -->
        <button
          type="button"
          class="relative p-2 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
          title="Notificaciones"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
        </button>

        <!-- Información de Usuario -->
        <div class="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {{ userInitials }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-bold text-slate-800 leading-tight">{{ userFullName }}</p>
            <p class="text-[10px] text-slate-400 font-medium">Clinivet Arias</p>
          </div>
        </div>

        <!-- Botón de Cierre de Sesión Rápido -->
        <button
          type="button"
          (click)="solicitarLogout.emit()"
          class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          title="Cerrar sesión"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
          </svg>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() userName = 'Rommel';
  @Input() userFullName = 'Rommel Navarro';
  @Input() role: 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA' = 'ADMIN';

  @Output() solicitarLogout = new EventEmitter<void>();

  get userInitials(): string {
    const parts = this.userFullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.userName.slice(0, 2).toUpperCase();
  }
}
