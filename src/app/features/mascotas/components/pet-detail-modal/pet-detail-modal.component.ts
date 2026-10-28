import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../models/mascota.model';
import { PetVacunasComponent } from '../pet-vacunas/pet-vacunas.component';

export type TabFichaMascota = 'general' | 'vacunas';

@Component({
  selector: 'app-pet-detail-modal',
  standalone: true,
  imports: [CommonModule, PetVacunasComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <!-- Backdrop translúcido -->
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        (click)="cerrar.emit()"
      ></div>

      <!-- Contenedor del Modal -->
      <div
        class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Cabecera con degradado sutil -->
        <div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 overflow-hidden flex items-center justify-center shadow-md">
              @if (mascota.fotoUrl && !imgError) {
                <img
                  [src]="mascota.fotoUrl"
                  [alt]="mascota.nombre"
                  class="w-full h-full object-cover"
                  (error)="imgError = true"
                />
              } @else {
                <svg class="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
                </svg>
              }
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-black font-outfit">{{ mascota.nombre }}</h2>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-white/25 text-white border border-white/30"
                >
                  {{ mascota.sexo === 'M' ? 'Macho' : 'Hembra' }}
                </span>
              </div>
              <p class="text-xs text-blue-100 font-medium">
                {{ mascota.especie }} · {{ mascota.raza || 'Mestizo / Sin raza' }}
              </p>
            </div>
          </div>

          <!-- Botón de Cerrar -->
          <button
            type="button"
            (click)="cerrar.emit()"
            class="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none"
            title="Cerrar ventana"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Pestañas de Navegación de la Ficha (RF-10 / RF-24) -->
        <div class="flex items-center px-6 pt-3 border-b border-slate-100 bg-slate-50/50 gap-2">
          <button
            type="button"
            (click)="tabActiva = 'general'"
            class="pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            [ngClass]="tabActiva === 'general' ? 'border-[#1e6ff9] text-[#1e6ff9]' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            <span>📋 Datos Generales</span>
          </button>

          <button
            type="button"
            (click)="tabActiva = 'vacunas'"
            class="pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5"
            [ngClass]="tabActiva === 'vacunas' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            <span>💉 Vacunación (RF-24)</span>
          </button>
        </div>

        <!-- Cuerpo de la Ficha Técnica (RF-10 / RF-24) -->
        <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          @if (tabActiva === 'general') {
            <!-- Datos Biométricos -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Datos Biométricos y Registro
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span class="text-[11px] font-medium text-slate-400 block">Peso Actual</span>
                  <span class="text-base font-bold text-slate-800">
                    {{ mascota.pesoActualKg ? mascota.pesoActualKg + ' kg' : 'Sin registrar' }}
                  </span>
                </div>

                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span class="text-[11px] font-medium text-slate-400 block">Color de Pelaje</span>
                  <span class="text-sm font-bold text-slate-800">{{ mascota.color || 'No especificado' }}</span>
                </div>

                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span class="text-[11px] font-medium text-slate-400 block">Nacimiento</span>
                  <span class="text-sm font-bold text-slate-800">{{ mascota.fechaNacimiento || 'Desconocido' }}</span>
                </div>
              </div>
            </div>

            <!-- Información del Propietario (RN-01) -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Propietario Responsable (RN-01)
              </h3>
              <div class="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    {{ getInitials(mascota.propietarioNombre || 'Cliente') }}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-sm font-bold text-slate-900 truncate">
                      {{ mascota.propietarioNombre || 'Propietario no asignado' }}
                    </h4>
                    <p class="text-xs text-slate-500 font-medium">
                      DNI: <span class="font-bold text-slate-700">{{ mascota.propietarioDni || '---' }}</span>
                      @if (mascota.propietarioTelefono) {
                        · Tel: <span class="font-bold text-slate-700">{{ mascota.propietarioTelefono }}</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <!-- Sección Integrada de Vacunas (RF-24) -->
            <app-pet-vacunas
              [mascotaId]="mascota.id"
              [especie]="mascota.especie"
            ></app-pet-vacunas>
          }

          <!-- Acciones de la Ficha -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              (click)="verHistorial.emit(mascota)"
              class="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Ver Historial Clínico</span>
            </button>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                (click)="cerrar.emit()"
                class="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                (click)="editar.emit(mascota)"
                class="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-[#1e6ff9] hover:bg-[#1858c7] rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
                <span>Editar Mascota</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PetDetailModalComponent {
  @Input({ required: true }) mascota!: Mascota;
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Mascota>();
  @Output() verHistorial = new EventEmitter<Mascota>();

  tabActiva: TabFichaMascota = 'general';
  imgError = false;

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
