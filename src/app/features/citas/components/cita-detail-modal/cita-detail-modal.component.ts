import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { Cita, CitaReprogramarRequest, DisponibilidadResponse } from '../../models/cita.model';

@Component({
  selector: 'app-cita-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">

        <!-- Encabezado con Estado -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight">
                Detalle de la Cita Médica
              </h2>
              <!-- Badge Semántico Oficial -->
              <span
                class="px-3 py-1 rounded-full text-xs font-black tracking-wide border inline-flex items-center gap-1.5"
                [ngClass]="{
                  'bg-sky-50 text-sky-800 border-sky-300': cita.estado === 'PROGRAMADA',
                  'bg-emerald-50 text-emerald-800 border-emerald-300': cita.estado === 'ATENDIDA',
                  'bg-rose-50 text-rose-800 border-rose-300': cita.estado === 'CANCELADA'
                }"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  [ngClass]="{
                    'bg-sky-500': cita.estado === 'PROGRAMADA',
                    'bg-emerald-500': cita.estado === 'ATENDIDA',
                    'bg-rose-500': cita.estado === 'CANCELADA'
                  }"
                ></span>
                {{ cita.estado }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono">ID: {{ cita.id }}</p>
          </div>

          <button
            type="button"
            (click)="onCerrar()"
            class="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Banner de Error / Conflicto -->
        @if (mensajeError()) {
          <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200">
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <div class="flex-1 font-semibold leading-relaxed">{{ mensajeError() }}</div>
            <button type="button" (click)="mensajeError.set(null)" class="text-rose-500 hover:text-rose-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }

        <!-- Grid de Información de la Cita -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Paciente y Propietario -->
          <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paciente y Titular</div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-100 text-[#1e6ff9] flex items-center justify-center font-black text-sm">
                🐾
              </div>
              <div>
                <div class="font-extrabold text-slate-900 text-sm">{{ cita.nombreMascota }}</div>
                <div class="text-xs text-slate-500">{{ cita.especieMascota }}</div>
              </div>
            </div>
            <div class="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex flex-col gap-0.5">
              <div><strong class="text-slate-800">Propietario:</strong> {{ cita.nombrePropietario }}</div>
              <div><strong class="text-slate-800">DNI:</strong> {{ cita.dniPropietario }}</div>
              @if (cita.telefonoPropietario) {
                <div><strong class="text-slate-800">Teléfono:</strong> {{ cita.telefonoPropietario }}</div>
              }
            </div>
          </div>

          <!-- Especialista y Horario -->
          <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Especialista y Turno</div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm">
                🩺
              </div>
              <div>
                <div class="font-extrabold text-slate-900 text-sm">{{ cita.nombreVeterinario }}</div>
                <div class="text-xs text-slate-500">{{ cita.especialidadVeterinario || 'Medicina General' }}</div>
              </div>
            </div>
            <div class="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex flex-col gap-0.5">
              <div><strong class="text-slate-800">Fecha:</strong> {{ cita.fecha }}</div>
              <div><strong class="text-slate-800">Hora:</strong> {{ cita.hora }} hrs</div>
            </div>
          </div>
        </div>

        <!-- Motivo de la Cita -->
        <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Motivo de Consulta</div>
          <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {{ cita.motivo }}
          </p>
        </div>

        <!-- Subformulario de Reprogramación (RF-16) -->
        @if (modoReprogramar()) {
          <div class="p-5 rounded-2xl border-2 border-sky-300 bg-sky-50/40 flex flex-col gap-4 animate-in fade-in duration-200">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-sm text-sky-950 flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                Reprogramar Fecha y Hora (RF-16)
              </h3>
              <button
                type="button"
                (click)="modoReprogramar.set(false)"
                class="text-xs text-sky-700 hover:underline font-semibold"
              >
                Cancelar Reprogramación
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-slate-700 uppercase">Nueva Fecha</label>
                <input
                  type="date"
                  [(ngModel)]="nuevaFecha"
                  [min]="fechaMinima"
                  (change)="verificarNuevaDisponibilidad()"
                  class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-slate-700 uppercase">Nueva Hora</label>
                <select
                  [(ngModel)]="nuevaHora"
                  (change)="verificarNuevaDisponibilidad()"
                  class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="">-- Seleccione hora --</option>
                  @for (h of franjasHorarias; track h) {
                    <option [value]="h">{{ h }} hrs</option>
                  }
                </select>
              </div>
            </div>

            <!-- Feedback de Disponibilidad -->
            @if (verificandoDisp()) {
              <div class="text-[11px] text-sky-700 flex items-center gap-2">
                <div class="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Comprobando disponibilidad del especialista...</span>
              </div>
            } @else if (dispReprogramacion()) {
              <div
                class="p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2"
                [ngClass]="dispReprogramacion()?.disponible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'"
              >
                <span>{{ dispReprogramacion()?.mensaje }}</span>
              </div>
            }

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="modoReprogramar.set(false)"
                class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-600 hover:bg-slate-50"
              >
                Descartar
              </button>
              <button
                type="button"
                (click)="ejecutarReprogramacion()"
                [disabled]="!nuevaFecha || !nuevaHora || ejecutando() || (dispReprogramacion() && !dispReprogramacion()?.disponible)"
                class="px-4 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                Confirmar Reprogramación
              </button>
            </div>
          </div>
        }

        <!-- Prompt de Confirmación de Cancelación (RF-17 / RN-07) -->
        @if (modoConfirmarCancelar()) {
          <div class="p-5 rounded-2xl border-2 border-rose-300 bg-rose-50/50 flex flex-col gap-3 animate-in fade-in duration-200">
            <div class="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <span>¿Está seguro de cancelar esta cita médica?</span>
            </div>
            <p class="text-xs text-rose-700 font-medium">
              Conforme a la regla <strong>RN-07</strong>, el registro se conservará como histórico con estado CANCELADA y se liberará el turno para otros pacientes.
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="modoConfirmarCancelar.set(false)"
                class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-600 hover:bg-slate-50"
              >
                No, mantener cita
              </button>
              <button
                type="button"
                (click)="ejecutarCancelacion()"
                [disabled]="ejecutando()"
                class="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-40 shadow-xs"
              >
                Sí, cancelar cita
              </button>
            </div>
          </div>
        }

        <!-- Barra de Acciones según el Estado Actual (Inmutabilidad RN-07 / RN-09) -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div class="text-xs text-slate-400 font-medium">
            @if (cita.estado !== 'PROGRAMADA') {
              <span class="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold inline-block">
                ℹ️ Esta cita se encuentra finalizada y no admite más modificaciones (RN-07 / RN-09).
              </span>
            }
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <!-- Botón Cancelar (solo citas PROGRAMADAS) -->
            @if (cita.estado === 'PROGRAMADA' && !modoReprogramar() && !modoConfirmarCancelar()) {
              <button
                type="button"
                (click)="modoConfirmarCancelar.set(true)"
                class="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                Cancelar Cita
              </button>
            }

            <!-- Botón Reprogramar (solo citas PROGRAMADAS) -->
            @if (cita.estado === 'PROGRAMADA' && !modoReprogramar() && !modoConfirmarCancelar()) {
              <button
                type="button"
                (click)="activarReprogramacion()"
                class="px-4 py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-bold text-xs hover:bg-sky-100 transition-colors"
              >
                Reprogramar
              </button>
            }

            <!-- Botón Marcar como Atendida (solo citas PROGRAMADAS) -->
            @if (cita.estado === 'PROGRAMADA' && !modoReprogramar() && !modoConfirmarCancelar()) {
              <button
                type="button"
                (click)="onMarcarAtendida()"
                [disabled]="ejecutando()"
                class="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Marcar Atendida</span>
              </button>
            }

            <button
              type="button"
              (click)="onCerrar()"
              class="px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CitaDetailModalComponent {
  private readonly citaService = inject(CitaService);

  @Input({ required: true }) cita!: Cita;
  @Output() cerrar = new EventEmitter<void>();
  @Output() citaActualizada = new EventEmitter<Cita>();
  @Output() iniciarConsulta = new EventEmitter<Cita>();

  // Estados locales con Signals
  readonly modoReprogramar = signal<boolean>(false);
  readonly modoConfirmarCancelar = signal<boolean>(false);
  readonly verificandoDisp = signal<boolean>(false);
  readonly dispReprogramacion = signal<DisponibilidadResponse | null>(null);
  readonly ejecutando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);

  nuevaFecha = '';
  nuevaHora = '';

  readonly fechaMinima = new Date().toISOString().split('T')[0];
  readonly franjasHorarias = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  activarReprogramacion(): void {
    this.nuevaFecha = this.cita.fecha;
    this.nuevaHora = this.cita.hora;
    this.dispReprogramacion.set(null);
    this.modoReprogramar.set(true);
    this.modoConfirmarCancelar.set(false);
  }

  verificarNuevaDisponibilidad(): void {
    if (!this.nuevaFecha || !this.nuevaHora) {
      this.dispReprogramacion.set(null);
      return;
    }

    this.verificandoDisp.set(true);
    this.mensajeError.set(null);

    this.citaService
      .consultarDisponibilidad(this.cita.veterinarioId, this.nuevaFecha, this.nuevaHora)
      .subscribe({
        next: (res) => {
          this.dispReprogramacion.set(res);
          this.verificandoDisp.set(false);
        },
        error: () => {
          this.verificandoDisp.set(false);
        }
      });
  }

  ejecutarReprogramacion(): void {
    if (!this.nuevaFecha || !this.nuevaHora) {
      return;
    }

    const payload: CitaReprogramarRequest = {
      fecha: this.nuevaFecha,
      hora: this.nuevaHora
    };

    this.ejecutando.set(true);
    this.mensajeError.set(null);

    this.citaService.reprogramarCita(this.cita.id, payload).subscribe({
      next: (reprogramada) => {
        this.ejecutando.set(false);
        this.modoReprogramar.set(false);
        this.cita = reprogramada;
        this.citaActualizada.emit(reprogramada);
      },
      error: (err) => {
        this.ejecutando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.message ||
          'Error al reprogramar la cita. Verifique colisiones de agenda (RF-16 / RN-03).';
        this.mensajeError.set(msg);
      }
    });
  }

  ejecutarCancelacion(): void {
    this.ejecutando.set(true);
    this.mensajeError.set(null);

    this.citaService.cancelarCita(this.cita.id).subscribe({
      next: (cancelada) => {
        this.ejecutando.set(false);
        this.modoConfirmarCancelar.set(false);
        this.cita = cancelada;
        this.citaActualizada.emit(cancelada);
      },
      error: (err) => {
        this.ejecutando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.message ||
          'Error al cancelar la cita médica (RF-17).';
        this.mensajeError.set(msg);
      }
    });
  }

  onIniciarConsulta(): void {
    this.iniciarConsulta.emit(this.cita);
  }

  onMarcarAtendida(): void {
    this.ejecutando.set(true);
    this.mensajeError.set(null);

    this.citaService
      .actualizarEstadoCita(this.cita.id, { estado: 'ATENDIDA' })
      .subscribe({
        next: (atendida) => {
          this.ejecutando.set(false);
          this.cita = atendida;
          this.citaActualizada.emit(atendida);
          this.iniciarConsulta.emit(atendida);
        },
        error: (err) => {
          this.ejecutando.set(false);
          const msg =
            err.error?.mensaje ||
            err.error?.message ||
            'No se pudo actualizar el estado de la cita (RF-19).';
          this.mensajeError.set(msg);
        }
      });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
