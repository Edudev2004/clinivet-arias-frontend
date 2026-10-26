import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-module-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 animate-in fade-in duration-200">
      <div class="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-inner">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83M3 3l18 18M10.5 6.75A6.75 6.75 0 0117.25 13.5"/>
        </svg>
      </div>

      <h2 class="text-2xl font-black text-slate-900 font-outfit mb-2">
        {{ tituloModulo }}
      </h2>
      <p class="text-sm text-slate-500 mb-6 max-w-md leading-relaxed">
        Este módulo se encuentra actualmente en desarrollo por los demás miembros del equipo de acuerdo con el backlog del sprint.
      </p>

      <div class="flex items-center gap-3">
        <a
          routerLink="/mascotas"
          class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-700/20 active:scale-95 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
          </svg>
          <span>Volver a Gestión de Mascotas</span>
        </a>
      </div>
    </div>
  `
})
export class ModulePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  get tituloModulo(): string {
    const data = this.route.snapshot.data;
    return data['title'] || 'Módulo en Desarrollo';
  }
}
