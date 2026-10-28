import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type UserRole = 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Barra Lateral Desktop (Collapsible on hover / expand) -->
    <aside
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
      class="hidden md:flex fixed top-0 left-0 h-screen bg-[#edf2fa] border-r border-slate-200/80 z-40 transition-all duration-300 ease-in-out flex-col justify-between p-4 shadow-xs"
      [ngClass]="isHovered ? 'w-64' : 'w-20'"
    >
      <!-- Sección Superior: Marca y Enlaces de Navegación -->
      <div class="flex flex-col gap-6">
        <!-- Logotipo y Nombre de la Clínica -->
        <a routerLink="/mascotas" class="flex items-center justify-center w-full px-1 pt-1 overflow-hidden cursor-pointer group h-12">
          @if (!isHovered) {
            <!-- Modo Colapsado: Solo Isotipo cuadrado centrado -->
            <div class="w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:border-brand-300 transition-all duration-200">
              <img src="assets/img/logo.png" alt="Clinivet Arias" class="w-8 h-8 object-contain" />
            </div>
          } @else {
            <!-- Modo Desplegado: Solo Logotipo Horizontal Completo Centrado -->
            <div class="flex items-center justify-center w-full px-1 animate-in fade-in duration-200">
              <img src="assets/img/logo-horizontal.png" alt="Clinivet Arias" class="h-9 max-w-full object-contain mx-auto" />
            </div>
          }
          <span class="sr-only">Clinivet Arias</span>
        </a>

        <!-- Lista de Navegación por Módulos filtrada reactivamente por rol -->
        <nav class="flex flex-col gap-1.5">
          @for (item of filteredNavItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-white text-brand-700 shadow-xs border border-brand-100"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-brand-700 hover:bg-white/80 transition-all group overflow-hidden"
              [title]="!isHovered ? item.name : ''"
            >
              <div class="flex-shrink-0 text-slate-500 group-hover:text-brand-600 transition-colors">
                <!-- Iconos SVG según el nombre -->
                @if (item.icon === 'dashboard') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
                  </svg>
                } @else if (item.icon === 'pets') {
                  <svg class="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
                  </svg>
                } @else if (item.icon === 'users') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                  </svg>
                } @else if (item.icon === 'calendar') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                } @else if (item.icon === 'inventory') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                  </svg>
                } @else if (item.icon === 'reports') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.25 2.25L18 6.75"/>
                  </svg>
                }
              </div>
              <span
                class="text-xs font-bold whitespace-nowrap transition-opacity duration-200"
                [ngClass]="isHovered ? 'opacity-100' : 'opacity-0'"
              >
                {{ item.name }}
              </span>
            </a>
          }
        </nav>
      </div>

      <!-- Sección Inferior: Usuario y Salida -->
      <div class="border-t border-slate-200/80 pt-4 flex flex-col gap-2">
        <button
          type="button"
          (click)="solicitarLogout.emit()"
          class="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors w-full group overflow-hidden"
          [title]="!isHovered ? 'Cerrar Sesión' : ''"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
          </svg>
          <span
            class="text-xs font-bold whitespace-nowrap transition-opacity duration-200"
            [ngClass]="isHovered ? 'opacity-100' : 'opacity-0'"
          >
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activeRole: UserRole = 'ADMIN';
  @Output() solicitarLogout = new EventEmitter<void>();

  isHovered = false;

  private readonly navItems: NavItem[] = [
    {
      name: 'Panel Principal',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA']
    },
    {
      name: 'Mascotas y Pacientes',
      path: '/mascotas',
      icon: 'pets',
      roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA']
    },
    {
      name: 'Propietarios y Clientes',
      path: '/propietarios',
      icon: 'users',
      roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA']
    },
    {
      name: 'Agenda de Citas',
      path: '/citas',
      icon: 'calendar',
      roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA']
    },
    {
      name: 'Inventario de Insumos',
      path: '/inventario',
      icon: 'inventory',
      roles: ['ADMIN']
    },
    {
      name: 'Reportes y Analíticas',
      path: '/reportes',
      icon: 'reports',
      roles: ['ADMIN', 'RECEPCIONISTA']
    }
  ];

  get filteredNavItems(): NavItem[] {
    return this.navItems.filter((item) => item.roles.includes(this.activeRole));
  }
}
