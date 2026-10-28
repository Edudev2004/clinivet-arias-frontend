import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { Cita, EstadoCita } from '../../models/cita.model';
import { CitaFormComponent } from '../../components/cita-form/cita-form.component';

@Component({
  selector: 'app-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CitaFormComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Encabezado del Módulo de Citas (RF-13 a RF-18) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
            Agenda de Citas Médicas
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Programación de consultas, control de disponibilidad y turnos de especialistas (RF-13, RF-14, RF-15, RF-18)
          </p>
        </div>

        <button
          type="button"
          (click)="abrirFormularioNuevaCita()"
          class="relative overflow-hidden px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-2 active:scale-95 group"
          [ngClass]="mostrarFormulario() ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-[#1e6ff9] text-white border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)]'"
        >
          @if (!mostrarFormulario()) {
            <!-- Animated Amber Light Bar -->
            <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>
          }

          <span class="relative z-10 flex items-center gap-2">
            @if (mostrarFormulario()) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Cerrar Formulario</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              <span>Nueva Cita Médica</span>
            }
          </span>
        </button>
      </div>

      <!-- Banner de Éxito / Confirmación -->
      @if (mensajeExito()) {
        <div class="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-teal-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <svg class="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-semibold">{{ mensajeExito() }}</span>
          </div>
          <button
            type="button"
            (click)="mensajeExito.set(null)"
            class="text-teal-600 hover:text-teal-800 focus:outline-none p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Formulario Modal / Integrado de Nueva Cita (RF-13, RF-14, RF-15) -->
      @if (mostrarFormulario()) {
        <app-cita-form
          (guardado)="onCitaGuardada($event)"
          (cancelar)="cerrarFormulario()"
        ></app-cita-form>
      }

      <!-- Listado de Citas y Filtro por Estado (RF-18) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
        <!-- Filtros Rápidos -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              (click)="filtrarPorEstado(undefined)"
              class="px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              [ngClass]="!filtroEstado() ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              Todas ({{ citaService.totalElementos() }})
            </button>
            <button
              type="button"
              (click)="filtrarPorEstado('PROGRAMADA')"
              class="px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              [ngClass]="filtroEstado() === 'PROGRAMADA' ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'"
            >
              Programadas
            </button>
            <button
              type="button"
              (click)="filtrarPorEstado('ATENDIDA')"
              class="px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              [ngClass]="filtroEstado() === 'ATENDIDA' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
            >
              Atendidas
            </button>
            <button
              type="button"
              (click)="filtrarPorEstado('CANCELADA')"
              class="px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              [ngClass]="filtroEstado() === 'CANCELADA' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'"
            >
              Canceladas
            </button>
          </div>

          <div class="text-xs text-slate-400 font-medium">
            Mostrando {{ citaService.citas().length }} registros
          </div>
        </div>

        <!-- Tabla de Citas -->
        @if (citaService.cargando()) {
          <div class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div class="w-8 h-8 border-3 border-[#1e6ff9] border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-semibold">Cargando citas médicas...</span>
          </div>
        } @else if (citaService.citas().length === 0) {
          <div class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
            <p class="text-xs font-semibold text-slate-500">No se encontraron citas médicas registradas</p>
            <button
              type="button"
              (click)="abrirFormularioNuevaCita()"
              class="text-xs font-bold text-[#1e6ff9] hover:underline"
            >
              Agendar la primera cita
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th class="py-3 px-4">Fecha y Hora</th>
                  <th class="py-3 px-4">Paciente (Mascota)</th>
                  <th class="py-3 px-4">Propietario</th>
                  <th class="py-3 px-4">Veterinario Especialista</th>
                  <th class="py-3 px-4">Motivo</th>
                  <th class="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                @for (cita of citaService.citas(); track cita.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <div class="font-bold text-slate-900">{{ cita.fecha }}</div>
                      <div class="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ cita.hora }} hrs
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900">{{ cita.nombreMascota }}</div>
                      <div class="text-[11px] text-slate-400">{{ cita.especieMascota }}</div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-semibold text-slate-800">{{ cita.nombrePropietario }}</div>
                      <div class="text-[11px] text-slate-400">DNI: {{ cita.dniPropietario }}</div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-[#1e6ff9]">{{ cita.nombreVeterinario }}</div>
                      <div class="text-[11px] text-slate-400">{{ cita.especialidadVeterinario || 'Medicina General' }}</div>
                    </td>
                    <td class="py-3.5 px-4 max-w-xs truncate" [title]="cita.motivo">
                      {{ cita.motivo }}
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span
                        class="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide border inline-flex items-center gap-1.5"
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
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class CitasPageComponent implements OnInit {
  readonly citaService = inject(CitaService);

  readonly mostrarFormulario = signal<boolean>(false);
  readonly filtroEstado = signal<EstadoCita | undefined>(undefined);
  readonly mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.citaService.listarCitas({ estado: this.filtroEstado() }).subscribe();
  }

  filtrarPorEstado(estado?: EstadoCita): void {
    this.filtroEstado.set(estado);
    this.cargarCitas();
  }

  abrirFormularioNuevaCita(): void {
    this.mostrarFormulario.update((val) => !val);
    this.mensajeExito.set(null);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  onCitaGuardada(cita: Cita): void {
    this.mostrarFormulario.set(false);
    this.mensajeExito.set(
      `Cita médica agendada exitosamente para "${cita.nombreMascota}" con el ${cita.nombreVeterinario} el día ${cita.fecha} a las ${cita.hora} hrs (RF-13).`
    );
    this.cargarCitas();
  }
}
