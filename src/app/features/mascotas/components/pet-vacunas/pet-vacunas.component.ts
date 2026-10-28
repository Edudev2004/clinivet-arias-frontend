import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VacunaService } from '../../services/vacuna.service';
import {
  VacunaAplicada,
  VacunaAplicadaRequest,
  evaluarVigenciaVacuna,
  EvaluacionVacuna
} from '../../models/vacuna.model';
import { CitaService } from '../../../citas/services/cita.service';

@Component({
  selector: 'app-pet-vacunas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-5">
      <!-- Encabezado de la Sección de Vacunas (RF-24) -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs">💉</span>
            <span>Historial y Plan de Vacunación (RF-24)</span>
          </h3>
          <p class="text-[11px] text-slate-400 font-medium mt-0.5">
            Registro de inmunizaciones aplicadas y alertas de refuerzo programado
          </p>
        </div>

        <button
          type="button"
          (click)="alternarFormulario()"
          class="px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border"
          [ngClass]="mostrarFormulario() ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700 shadow-2xs'"
        >
          @if (mostrarFormulario()) {
            <span>Cancelar</span>
          } @else {
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span>+ Registrar Vacuna</span>
          }
        </button>
      </div>

      <!-- Banner de Notificación de Éxito o Error -->
      @if (mensajeExito()) {
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div class="flex items-center gap-2">
            <span>✅</span>
            <span>{{ mensajeExito() }}</span>
          </div>
          <button type="button" (click)="mensajeExito.set(null)" class="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      }

      @if (mensajeError()) {
        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div class="flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ mensajeError() }}</span>
          </div>
          <button type="button" (click)="mensajeError.set(null)" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
        </div>
      }

      <!-- Formulario de Registro de Nueva Vacuna (RF-24) -->
      @if (mostrarFormulario()) {
        <div class="p-4 rounded-2xl border-2 border-teal-200 bg-teal-50/30 flex flex-col gap-4 animate-in fade-in duration-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase text-teal-950">Formulario de Aplicación de Vacuna</span>
            <span class="text-[10px] text-teal-700 font-medium">Campos con * son obligatorios</span>
          </div>

          <!-- Sugerencias Rápidas de Vacunas -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold text-slate-600">Sugerencias frecuentes:</label>
            <div class="flex flex-wrap gap-1.5">
              @for (sug of sugerenciasVacunas; track sug) {
                <button
                  type="button"
                  (click)="seleccionarSugerencia(sug)"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer"
                  [ngClass]="nombreVacuna === sug ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
                >
                  {{ sug }}
                </button>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Nombre de Vacuna -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-slate-700">
                Nombre de la Vacuna <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="nombreVacuna"
                placeholder="Ej. Séxtuple Canina / Triple Felina"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <!-- Veterinario Responsable -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-slate-700">
                Veterinario Responsable <span class="text-rose-500">*</span>
              </label>
              <select
                [(ngModel)]="veterinarioId"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">-- Seleccionar médico --</option>
                @for (v of veterinarios(); track v.id) {
                  <option [value]="v.id">{{ v.nombreCompleto }}</option>
                }
              </select>
            </div>

            <!-- Fecha de Aplicación -->
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-slate-700">
                Fecha de Aplicación <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                [(ngModel)]="fechaAplicacion"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <!-- Próxima Fecha (Refuerzo) -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-bold text-slate-700">Próxima Fecha (Refuerzo)</label>
                <button
                  type="button"
                  (click)="sumarAnioProximaFecha()"
                  class="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  +1 Año
                </button>
              </div>
              <input
                type="date"
                [(ngModel)]="proximaFecha"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <!-- Lote del Biológico (Opcional) -->
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-[11px] font-bold text-slate-700">Lote del Biológico (Opcional)</label>
              <input
                type="text"
                [(ngModel)]="lote"
                placeholder="Ej. LOT-2026-X88"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="alternarFormulario()"
              class="px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              (click)="guardarVacuna()"
              [disabled]="!nombreVacuna.trim() || !fechaAplicacion || !veterinarioId || guardando()"
              class="px-5 py-2 rounded-xl bg-teal-600 text-white font-black text-xs hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              @if (guardando()) {
                <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              } @else {
                <span>Registrar Aplicación</span>
              }
            </button>
          </div>
        </div>
      }

      <!-- Indicador de Carga -->
      @if (vacunaService.cargando()) {
        <div class="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div class="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-semibold">Cargando vacunas registradas...</span>
        </div>
      } @else if (vacunas().length === 0) {
        <div class="py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-2">
          <span class="text-2xl">🐾</span>
          <p class="text-xs font-bold text-slate-700">No hay vacunas registradas para esta mascota</p>
          <p class="text-[11px] text-slate-400">Utilice el botón "+ Registrar Vacuna" para iniciar su cartilla de inmunización.</p>
        </div>
      } @else {
        <!-- Listado de Vacunas Aplicadas con Indicador Visual (RF-24) -->
        <div class="flex flex-col gap-2.5">
          @for (v of vacunas(); track v.id) {
            <div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                  💉
                </div>
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-extrabold text-xs text-slate-900">{{ v.nombreVacuna }}</span>
                    <!-- Badge Indicador de Vencimiento (RF-24) -->
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border inline-flex items-center gap-1"
                      [ngClass]="evaluar(v.proximaFecha).badgeClass"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="{
                          'bg-emerald-500': evaluar(v.proximaFecha).estado === 'VIGENTE',
                          'bg-amber-500': evaluar(v.proximaFecha).estado === 'PROXIMA_VENCER',
                          'bg-rose-500': evaluar(v.proximaFecha).estado === 'VENCIDA',
                          'bg-slate-400': evaluar(v.proximaFecha).estado === 'SIN_REFUERZO'
                        }"
                      ></span>
                      {{ evaluar(v.proximaFecha).mensaje }}
                    </span>
                  </div>

                  <div class="text-[11px] text-slate-500 font-medium">
                    Aplicada el: <strong class="text-slate-700">{{ v.fechaAplicacion }}</strong>
                    @if (v.proximaFecha) {
                      · Próximo refuerzo: <strong class="text-slate-700">{{ v.proximaFecha }}</strong>
                    }
                  </div>

                  <div class="text-[10px] text-slate-400">
                    Veterinario: {{ v.veterinarioNombre || 'Especialista Clinivet' }}
                    @if (v.lote) {
                      · Lote: <span class="font-mono">{{ v.lote }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PetVacunasComponent implements OnInit {
  readonly vacunaService = inject(VacunaService);
  private readonly citaService = inject(CitaService);

  @Input({ required: true }) mascotaId!: string;
  @Input() especie = 'Canino';

  readonly vacunas = this.vacunaService.vacunas;
  readonly veterinarios = this.citaService.veterinarios;

  readonly mostrarFormulario = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  // Campos de formulario
  nombreVacuna = '';
  fechaAplicacion = new Date().toISOString().split('T')[0];
  proximaFecha = '';
  veterinarioId = '';
  lote = '';

  sugerenciasVacunas: string[] = [];

  ngOnInit(): void {
    this.definirSugerenciasPorEspecie();
    this.cargarVacunas();
    this.cargarVeterinarios();
  }

  definirSugerenciasPorEspecie(): void {
    const esp = this.especie?.toLowerCase() || '';
    if (esp.includes('fel') || esp.includes('gat')) {
      this.sugerenciasVacunas = [
        'Triple Felina (Panleucopenia, Calicivirus, Rinotraqueitis)',
        'Leucemia Felina (FeLV)',
        'Antirrábica Felina',
        'PIF (Peritonitis Infecciosa)'
      ];
    } else {
      this.sugerenciasVacunas = [
        'Séxtuple Canina (DHPPi/L)',
        'Antirrábica Canina',
        'Parvovirus Canino',
        'Tos de las Perreras (KC / Bordetella)',
        'Giardia'
      ];
    }
  }

  cargarVacunas(): void {
    if (this.mascotaId) {
      this.vacunaService.listarPorMascota(this.mascotaId).subscribe();
    }
  }

  cargarVeterinarios(): void {
    if (this.veterinarios().length === 0) {
      this.citaService.listarVeterinarios().subscribe({
        next: (vets) => {
          if (vets.length > 0 && !this.veterinarioId) {
            this.veterinarioId = vets[0].id;
          }
        }
      });
    } else if (!this.veterinarioId) {
      this.veterinarioId = this.veterinarios()[0].id;
    }
  }

  alternarFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
  }

  seleccionarSugerencia(sug: string): void {
    this.nombreVacuna = sug;
    if (!this.proximaFecha) {
      this.sumarAnioProximaFecha();
    }
  }

  sumarAnioProximaFecha(): void {
    const base = this.fechaAplicacion ? new Date(this.fechaAplicacion) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    this.proximaFecha = base.toISOString().split('T')[0];
  }

  evaluar(proximaFecha?: string | null): EvaluacionVacuna {
    return evaluarVigenciaVacuna(proximaFecha);
  }

  guardarVacuna(): void {
    if (!this.nombreVacuna.trim() || !this.fechaAplicacion || !this.veterinarioId) {
      this.mensajeError.set('Por favor complete los campos obligatorios (*).');
      return;
    }

    const payload: VacunaAplicadaRequest = {
      nombreVacuna: this.nombreVacuna.trim(),
      fechaAplicacion: this.fechaAplicacion,
      proximaFecha: this.proximaFecha || null,
      veterinarioId: this.veterinarioId,
      lote: this.lote.trim() || null
    };

    this.guardando.set(true);
    this.mensajeError.set(null);

    this.vacunaService.registrarVacuna(this.mascotaId, payload).subscribe({
      next: (vacunaCreada) => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.mensajeExito.set(`Vacuna "${vacunaCreada.nombreVacuna}" registrada con éxito en la cartilla.`);
        // Limpiar formulario
        this.nombreVacuna = '';
        this.proximaFecha = '';
        this.lote = '';
      },
      error: () => {
        this.guardando.set(false);
        this.mensajeError.set('No se pudo registrar la vacuna. Intente nuevamente.');
      }
    });
  }
}
