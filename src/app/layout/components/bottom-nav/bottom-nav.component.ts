import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Barra de Navegación Flotante Inferior (Solo Móvil - Estilo VetHD) -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-3 px-4 pointer-events-none">
      <div class="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl px-3 py-2 flex items-center justify-around">
        <!-- Inicio -->
        <a
          routerLink="/dashboard"
          routerLinkActive="text-teal-700 font-bold bg-teal-50"
          class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-teal-700 transition-all text-[11px]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
          </svg>
          <span>Inicio</span>
        </a>

        <!-- Mascotas (Elevado con indicador activo) -->
        <a
          routerLink="/mascotas"
          routerLinkActive="text-teal-700 font-bold bg-teal-50"
          class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-teal-700 transition-all text-[11px]"
        >
          <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
          </svg>
          <span>Mascotas</span>
        </a>

        <!-- Citas -->
        <a
          routerLink="/citas"
          routerLinkActive="text-teal-700 font-bold bg-teal-50"
          class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-teal-700 transition-all text-[11px]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
          </svg>
          <span>Citas</span>
        </a>

        <!-- Reportes -->
        <a
          routerLink="/reportes"
          routerLinkActive="text-teal-700 font-bold bg-teal-50"
          class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-teal-700 transition-all text-[11px]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.25 2.25L18 6.75"/>
          </svg>
          <span>Reportes</span>
        </a>
      </div>
    </nav>
  `
})
export class BottomNavComponent {}
