import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { PropietarioService } from '../../../propietarios/services/propietario.service';
import { Propietario, MascotaResumen } from '../../../propietarios/models/propietario.model';
import {
  Cita,
  CitaCreateRequest,
  DisponibilidadResponse,
  VeterinarioResumen
} from '../../models/cita.model';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 max-w-2xl w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      <!-- Encabezado del Formulario -->
      <div class="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight flex items-center gap-2">
            <svg class="w-6 h-6 text-[#1e6ff9]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
            Agendar Nueva Cita
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Ingreso de cita con verificación de disponibilidad en tiempo real (RF-13, RF-14, RF-15)
          </p>
        </div>

        <button
          type="button"
          (click)="onCancelar()"
          class="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Banner de Error / Conflicto 409 -->
      @if (mensajeError()) {
        <div class="mb-5 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          <div class="flex-1 font-semibold leading-relaxed">
            {{ mensajeError() }}
          </div>
          <button
            type="button"
            (click)="mensajeError.set(null)"
            class="text-rose-500 hover:text-rose-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
        <!-- 1. Selector de Propietario con Autocomplete / Búsqueda -->
        <div class="flex flex-col gap-1.5 relative">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Propietario / Cliente</span>
            <span class="text-rose-500">*</span>
          </label>

          @if (!propietarioSeleccionado()) {
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="busquedaPropietario"
                name="busquedaPropietario"
                (input)="buscarPropietarios()"
                (focus)="mostrarResultadosPropietarios.set(true)"
                placeholder="Escribe el nombre o DNI del propietario..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] transition-all"
                autocomplete="off"
              />
              <svg class="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>

              <!-- Lista desplegable de resultados -->
              @if (mostrarResultadosPropietarios() && listaPropietariosFiltrados().length > 0) {
                <div class="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50 p-1 flex flex-col gap-0.5">
                  @for (prop of listaPropietariosFiltrados(); track prop.id) {
                    <button
                      type="button"
                      (click)="seleccionarPropietario(prop)"
                      class="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-sky-50 text-xs sm:text-sm flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div class="font-bold text-slate-800">{{ prop.nombre }} {{ prop.apellido }}</div>
                        <div class="text-[11px] text-slate-400">DNI: {{ prop.dni }} • Tel: {{ prop.telefono }}</div>
                      </div>
                      <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {{ prop.cantidadMascotas ?? 0 }} masc.
                      </span>
                    </button>
                  }
                </div>
              }
            </div>
          } @else {
            <!-- Tarjeta de Propietario Seleccionado -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-sky-200 bg-sky-50/70">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#1e6ff9] text-white flex items-center justify-center font-black text-sm">
                  {{ propietarioSeleccionado()?.nombre?.charAt(0) }}{{ propietarioSeleccionado()?.apellido?.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-slate-900 text-sm">
                    {{ propietarioSeleccionado()?.nombre }} {{ propietarioSeleccionado()?.apellido }}
                  </div>
                  <div class="text-xs text-slate-500">
                    DNI: {{ propietarioSeleccionado()?.dni }} • Teléfono: {{ propietarioSeleccionado()?.telefono }}
                  </div>
                </div>
              </div>
              <button
                type="button"
                (click)="cambiarPropietario()"
                class="text-xs text-[#1e6ff9] hover:underline font-semibold px-2 py-1"
              >
                Cambiar
              </button>
            </div>
          }
        </div>

        <!-- 2. Selector Reactivo de Mascota -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Mascota / Paciente</span>
            <span class="text-rose-500">*</span>
          </label>

          <select
            [(ngModel)]="mascotaId"
            name="mascotaId"
            [disabled]="!propietarioSeleccionado() || cargandoMascotas()"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <option value="">
              @if (!propietarioSeleccionado()) {
                -- Primero seleccione un propietario --
              } @else if (cargandoMascotas()) {
                Cargando mascotas del propietario...
              } @else if (mascotasDisponibles().length === 0) {
                -- El propietario no tiene mascotas registradas --
              } @else {
                -- Seleccione la mascota --
              }
            </option>
            @for (m of mascotasDisponibles(); track m.id) {
              <option [value]="m.id">
                {{ m.nombre }} ({{ m.especie }} {{ m.raza ? '- ' + m.raza : '' }})
              </option>
            }
          </select>
        </div>

        <!-- 3. Selector de Médico Veterinario Especialista -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Médico Veterinario Especialista</span>
            <span class="text-rose-500">*</span>
          </label>

          <select
            [(ngModel)]="veterinarioId"
            name="veterinarioId"
            (change)="verificarDisponibilidad()"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] transition-all"
          >
            <option value="">-- Seleccione un especialista --</option>
            @for (vet of veterinarios(); track vet.id) {
              <option [value]="vet.id">
                {{ vet.nombreCompleto }} ({{ vet.especialidad }} - {{ vet.numeroColegiatura }})
              </option>
            }
          </select>
        </div>

        <!-- 4 y 5. Fecha y Hora de la Cita -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Fecha</span>
              <span class="text-rose-500">*</span>
            </label>
            <input
              type="date"
              [(ngModel)]="fecha"
              name="fecha"
              [min]="fechaMinima"
              (change)="verificarDisponibilidad()"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Hora</span>
              <span class="text-rose-500">*</span>
            </label>
            <select
              [(ngModel)]="hora"
              name="hora"
              (change)="verificarDisponibilidad()"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] transition-all"
            >
              <option value="">-- Seleccione hora --</option>
              @for (franja of franjasHorarias; track franja) {
                <option [value]="franja">{{ franja }} hrs</option>
              }
            </select>
          </div>
        </div>

        <!-- Feedback de Disponibilidad en Tiempo Real (RF-14 / RF-15) -->
        @if (consultandoDisponibilidad()) {
          <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-xs text-slate-600 animate-pulse">
            <div class="w-4 h-4 border-2 border-[#1e6ff9] border-t-transparent rounded-full animate-spin"></div>
            <span>Consultando agenda y turnos del especialista...</span>
          </div>
        } @else if (disponibilidadInfo()) {
          @if (disponibilidadInfo()?.disponible) {
            <div class="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
              <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <span class="font-bold">{{ disponibilidadInfo()?.mensaje }}</span>
                <span class="block text-[11px] text-emerald-700 mt-0.5">
                  El médico veterinario no tiene colisiones en este horario.
                </span>
              </div>
            </div>
          } @else {
            <div class="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
              <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <div>
                <span class="font-bold">Horario no disponible:</span>
                <span class="block text-[11px] text-rose-700 mt-0.5">
                  {{ disponibilidadInfo()?.mensaje }}
                </span>
              </div>
            </div>
          }
        }

        <!-- 6. Motivo de la Cita -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Motivo de la Consulta</span>
            <span class="text-rose-500">*</span>
          </label>
          <textarea
            [(ngModel)]="motivo"
            name="motivo"
            rows="3"
            placeholder="Describa el motivo de la cita (ej. Vacunación, control post-quirúrgico, decaimiento)..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9] transition-all resize-none"
          ></textarea>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
          <button
            type="button"
            (click)="onCancelar()"
            class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            [disabled]="!esFormularioValido() || guardando() || (disponibilidadInfo() && !disponibilidadInfo()?.disponible)"
            class="relative overflow-hidden px-7 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-[#1e6ff9] border-2 border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_3px_0_1px_rgba(30,111,249,0.3)] flex items-center gap-2 group cursor-pointer"
          >
            @if (guardando()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Agendando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
              <span>Confirmar Cita</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class CitaFormComponent implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly propietarioService = inject(PropietarioService);

  @Output() guardado = new EventEmitter<Cita>();
  @Output() cancelar = new EventEmitter<void>();

  // Estados reactivos
  readonly veterinarios = this.citaService.veterinarios;
  readonly propietarioSeleccionado = signal<Propietario | null>(null);
  readonly listaPropietariosFiltrados = signal<Propietario[]>([]);
  readonly mostrarResultadosPropietarios = signal<boolean>(false);
  readonly mascotasDisponibles = signal<MascotaResumen[]>([]);
  readonly cargandoMascotas = signal<boolean>(false);
  readonly consultandoDisponibilidad = signal<boolean>(false);
  readonly disponibilidadInfo = signal<DisponibilidadResponse | null>(null);
  readonly guardando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);

  // Campos del formulario
  busquedaPropietario = '';
  mascotaId = '';
  veterinarioId = '';
  fecha = '';
  hora = '';
  motivo = '';

  readonly fechaMinima = new Date().toISOString().split('T')[0];

  readonly franjasHorarias = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  ngOnInit(): void {
    this.citaService.listarVeterinarios().subscribe();
    this.fecha = this.fechaMinima;
  }

  buscarPropietarios(): void {
    const q = this.busquedaPropietario.trim();
    if (!q) {
      this.listaPropietariosFiltrados.set([]);
      return;
    }

    this.propietarioService.buscar(q, 0, 8).subscribe({
      next: (res) => {
        this.listaPropietariosFiltrados.set(res.content);
        this.mostrarResultadosPropietarios.set(true);
      }
    });
  }

  seleccionarPropietario(prop: Propietario): void {
    this.propietarioSeleccionado.set(prop);
    this.mostrarResultadosPropietarios.set(false);
    this.busquedaPropietario = '';
    this.mascotaId = '';
    this.cargandoMascotas.set(true);

    this.propietarioService.listarMascotas(prop.id).subscribe({
      next: (mascotas) => {
        this.mascotasDisponibles.set(mascotas);
        this.cargandoMascotas.set(false);
        if (mascotas.length === 1) {
          this.mascotaId = mascotas[0].id;
        }
      },
      error: () => {
        this.cargandoMascotas.set(false);
      }
    });
  }

  cambiarPropietario(): void {
    this.propietarioSeleccionado.set(null);
    this.mascotasDisponibles.set([]);
    this.mascotaId = '';
  }

  verificarDisponibilidad(): void {
    if (!this.veterinarioId || !this.fecha || !this.hora) {
      this.disponibilidadInfo.set(null);
      return;
    }

    this.consultandoDisponibilidad.set(true);
    this.mensajeError.set(null);

    this.citaService
      .consultarDisponibilidad(this.veterinarioId, this.fecha, this.hora)
      .subscribe({
        next: (res) => {
          this.disponibilidadInfo.set(res);
          this.consultandoDisponibilidad.set(false);
        },
        error: () => {
          this.consultandoDisponibilidad.set(false);
        }
      });
  }

  esFormularioValido(): boolean {
    return (
      !!this.propietarioSeleccionado() &&
      !!this.mascotaId &&
      !!this.veterinarioId &&
      !!this.fecha &&
      !!this.hora &&
      this.motivo.trim().length >= 3
    );
  }

  onSubmit(): void {
    if (!this.esFormularioValido()) {
      return;
    }

    const payload: CitaCreateRequest = {
      propietarioId: this.propietarioSeleccionado()!.id,
      mascotaId: this.mascotaId,
      veterinarioId: this.veterinarioId,
      fecha: this.fecha,
      hora: this.hora,
      motivo: this.motivo.trim()
    };

    this.guardando.set(true);
    this.mensajeError.set(null);

    this.citaService.crearCita(payload).subscribe({
      next: (citaCreada) => {
        this.guardando.set(false);
        this.guardado.emit(citaCreada);
      },
      error: (err) => {
        this.guardando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo registrar la cita. Verifique que no exista colisión de horario (RF-15 / RN-03).';
        this.mensajeError.set(msg);
      }
    });
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
