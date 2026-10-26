import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-3 group relative cursor-pointer"
      (click)="onVerFicha()"
    >
      <!-- Cabecera de la Tarjeta -->
      <div>
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs">
            @if (mascota.fotoUrl && !imgError) {
              <img
                [src]="mascota.fotoUrl"
                [alt]="mascota.nombre"
                class="w-full h-full object-cover"
                (error)="imgError = true"
              />
            } @else {
              <svg class="w-7 h-7 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
              </svg>
            }
          </div>

          <!-- Badges de Estado y Sexo -->
          <div class="flex flex-col items-end gap-1.5">
            <span
              class="px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider"
              [ngClass]="mascota.sexo === 'M' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
            >
              {{ mascota.sexo === 'M' ? 'Macho' : 'Hembra' }}
            </span>

            @if (mascota.pesoActualKg) {
              <span class="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {{ mascota.pesoActualKg }} kg
              </span>
            }
          </div>
        </div>

        <!-- Nombre y Raza -->
        <h3 class="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
          {{ mascota.nombre }}
        </h3>
        <p class="text-xs text-slate-500 font-medium capitalize">
          {{ mascota.especie }} · {{ mascota.raza || 'Mestizo / Sin raza' }}
        </p>

        <!-- Propietario vinculado (RN-01) -->
        @if (mascota.propietarioNombre) {
          <div class="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
            <svg class="w-3.5 h-3.5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="truncate font-semibold">{{ mascota.propietarioNombre }}</span>
          </div>
        }
      </div>

      <!-- Acciones de la Tarjeta -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          (click)="onVerFicha(); $event.stopPropagation()"
          class="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1 py-1 focus:outline-none"
        >
          <span>Ficha Técnica</span>
          <svg class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <button
          type="button"
          (click)="onVerHistorialClick($event)"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-600 border border-teal-200 hover:border-teal-600 rounded-xl transition-all shadow-xs active:scale-95"
          title="Consultar historial clínico"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span>Historial</span>
        </button>
      </div>
    </div>
  `
})
export class PetCardComponent {
  @Input({ required: true }) mascota!: Mascota;
  @Output() verFicha = new EventEmitter<Mascota>();
  @Output() verHistorial = new EventEmitter<Mascota>();

  imgError = false;

  onVerFicha(): void {
    this.verFicha.emit(this.mascota);
  }

  onVerHistorialClick(event: MouseEvent): void {
    event.stopPropagation();
    this.verHistorial.emit(this.mascota);
  }
}
