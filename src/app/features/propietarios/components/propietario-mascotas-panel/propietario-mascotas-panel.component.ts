import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Propietario, MascotaResumen } from '../../models/propietario.model';

@Component({
  selector: 'app-propietario-mascotas-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Panel Lateral Deslizante / Drawer de Mascotas (RF-08) -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden animate-in slide-in-from-right-4 duration-300">
      <!-- Encabezado del Panel -->
      <div class="px-6 py-4 bg-gradient-to-r from-brand-50 to-blue-50/50 border-b border-slate-200/80 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-brand-200 p-2 flex items-center justify-center text-brand-600 shadow-2xs">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-800 font-outfit leading-tight">
              Mascotas de {{ propietario.nombre }} {{ propietario.apellido }}
            </h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">
              DNI: {{ propietario.dni }} &bull; Tel: {{ propietario.telefono }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="cerrar.emit()"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors shadow-2xs"
          title="Cerrar panel de mascotas"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Contenido: Lista de Mascotas vinculadas -->
      <div class="p-6">
        @if (cargando) {
          <!-- Skeleton Loading -->
          <div class="space-y-3">
            <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        } @else if (mascotas.length === 0) {
          <!-- Estado Vacío: Propietario sin mascotas -->
          <div class="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div class="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-3">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
              </svg>
            </div>
            <h4 class="text-sm font-bold text-slate-700">Sin mascotas registradas</h4>
            <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Este cliente aún no tiene pacientes vinculados a su expediente.
            </p>
            <a
              routerLink="/mascotas"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              <span>Registrar Mascota para este Propietario</span>
            </a>
          </div>
        } @else {
          <!-- Cuadrícula / Tarjetas de Mascotas Asociadas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            @for (m of mascotas; track m.id) {
              <div class="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-brand-300 hover:shadow-xs transition-all flex items-start gap-3.5 group">
                <!-- Avatar / Foto -->
                <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  @if (m.fotoUrl) {
                    <img [src]="m.fotoUrl" [alt]="m.nombre" class="w-full h-full object-cover" />
                  } @else {
                    <span class="text-lg font-bold text-brand-600 uppercase">
                      {{ m.nombre.charAt(0) }}
                    </span>
                  }
                </div>

                <!-- Datos de la Mascota -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1 mb-0.5">
                    <h4 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {{ m.nombre }}
                    </h4>
                    <!-- Badge Especie -->
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="m.especie.toLowerCase().includes('canino') || m.especie.toLowerCase().includes('perro') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
                    >
                      {{ m.especie }}
                    </span>
                  </div>

                  <p class="text-xs text-slate-500 truncate mb-1.5">
                    {{ m.raza || 'Mestizo' }} &bull; Sexo: {{ m.sexo === 'M' || m.sexo === 'Macho' ? 'Macho' : 'Hembra' }}
                  </p>

                  <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    @if (m.pesoActualKg) {
                      <span class="inline-flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                        ⚖️ {{ m.pesoActualKg }} kg
                      </span>
                    }
                    @if (m.fechaNacimiento) {
                      <span class="inline-flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                        🎂 {{ m.fechaNacimiento }}
                      </span>
                    }
                    @if (m.edad) {
                      <span class="inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/70">
                        {{ m.edad }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PropietarioMascotasPanelComponent {
  @Input({ required: true }) propietario!: Propietario;
  @Input() mascotas: MascotaResumen[] = [];
  @Input() cargando = false;

  @Output() cerrar = new EventEmitter<void>();
}
