import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { Cita, EstadoCita, CitaFiltros } from '../../models/cita.model';
import { CitaFormComponent } from '../../components/cita-form/cita-form.component';
import { CitaDetailModalComponent } from '../../components/cita-detail-modal/cita-detail-modal.component';
import { ConsultaFormModalComponent } from '../../../consultas/components/consulta-form-modal/consulta-form-modal.component';
import { Consulta } from '../../../consultas/models/consulta.model';

export type ModoVistaCitas = 'tabla' | 'calendario';

@Component({
  selector: 'app-citas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CitaFormComponent, CitaDetailModalComponent, ConsultaFormModalComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Encabezado del Módulo de Citas (RF-13 a RF-19 / APF2 Tabla 38 Anexo C) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
            Agenda y Calendario de Citas
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Programación de consultas, control de disponibilidad y turnos de especialistas (RF-13 a RF-19)
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Toggle de Modo de Vista (Tabla vs Calendario) -->
          <div class="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              (click)="modoVista.set('tabla')"
              class="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              [ngClass]="modoVista() === 'tabla' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
              </svg>
              <span>Tabla</span>
            </button>

            <button
              type="button"
              (click)="modoVista.set('calendario')"
              class="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              [ngClass]="modoVista() === 'calendario' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
              </svg>
              <span>Calendario</span>
            </button>
          </div>

          <!-- Botón Nueva Cita con Skew Bar -->
          <button
            type="button"
            (click)="abrirFormularioNuevaCita()"
            class="relative overflow-hidden px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-2 active:scale-95 group"
            [ngClass]="mostrarFormulario() ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-[#1e6ff9] text-white border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)]'"
          >
            @if (!mostrarFormulario()) {
              <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>
            }

            <span class="relative z-10 flex items-center gap-2">
              @if (mostrarFormulario()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span>Cerrar</span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                <span>Nueva Cita</span>
              }
            </span>
          </button>
        </div>
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

      <!-- Modal de Detalle y Acciones de Cita (RF-16, RF-17, RF-19) -->
      @if (citaSeleccionada()) {
        <app-cita-detail-modal
          [cita]="citaSeleccionada()!"
          (cerrar)="citaSeleccionada.set(null)"
          (citaActualizada)="onCitaActualizada($event)"
        ></app-cita-detail-modal>
      }

      <!-- Contenedor Principal de la Agenda / Filtros Dinámicos (RF-18) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">

        <!-- Barra de Filtros Dinámicos (Veterinario, Fecha y Estado) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pb-5 border-b border-slate-100">
          <!-- Filtro por Veterinario -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Especialista</label>
            <select
              [(ngModel)]="filtroVeterinarioId"
              (change)="aplicarFiltros()"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9]"
            >
              <option value="">-- Todos los especialistas --</option>
              @for (v of citaService.veterinarios(); track v.id) {
                <option [value]="v.id">{{ v.nombreCompleto }}</option>
              }
            </select>
          </div>

          <!-- Filtro por Fecha Puntual o Inicio -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha / Desde</label>
            <input
              type="date"
              [(ngModel)]="filtroFecha"
              (change)="aplicarFiltros()"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9]"
            />
          </div>

          <!-- Filtro por Estado -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado de Cita</label>
            <select
              [(ngModel)]="filtroEstado"
              (change)="aplicarFiltros()"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e6ff9]/20 focus:border-[#1e6ff9]"
            >
              <option [ngValue]="undefined">Todos los estados</option>
              <option value="PROGRAMADA">Programadas</option>
              <option value="ATENDIDA">Atendidas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>

          <!-- Botón Limpiar Filtros -->
          <div class="flex items-end">
            <button
              type="button"
              (click)="limpiarFiltros()"
              class="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
              <span>Restablecer Filtros</span>
            </button>
          </div>
        </div>

        <!-- Indicador de Carga -->
        @if (citaService.cargando()) {
          <div class="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div class="w-8 h-8 border-3 border-[#1e6ff9] border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-semibold">Cargando citas médicas...</span>
          </div>
        } @else if (citaService.citas().length === 0) {
          <div class="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
            <p class="text-xs font-semibold text-slate-500">No se encontraron citas que coincidan con los filtros</p>
            <button
              type="button"
              (click)="limpiarFiltros()"
              class="text-xs font-bold text-[#1e6ff9] hover:underline"
            >
              Ver todas las citas agendadas
            </button>
          </div>
        } @else {

          <!-- 1. VISTA TABLA -->
          @if (modoVista() === 'tabla') {
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
                    <th class="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                  @for (cita of citaService.citas(); track cita.id) {
                    <tr
                      (click)="verDetalleCita(cita)"
                      class="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
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
                        <div class="font-bold text-slate-900 group-hover:text-[#1e6ff9] transition-colors">{{ cita.nombreMascota }}</div>
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
                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          (click)="verDetalleCita(cita, $event)"
                          class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 group-hover:border-sky-300 transition-all shadow-2xs"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Controles de Paginación -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                Página <span class="font-bold text-slate-800">{{ citaService.paginaActual() + 1 }}</span> de
                <span class="font-bold text-slate-800">{{ citaService.totalPaginas() || 1 }}</span>
                ({{ citaService.totalElementos() }} citas totales)
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="citaService.paginaActual() === 0"
                  (click)="cambiarPagina(citaService.paginaActual() - 1)"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  [disabled]="citaService.paginaActual() >= citaService.totalPaginas() - 1"
                  (click)="cambiarPagina(citaService.paginaActual() + 1)"
                  class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                </button>
              </div>
            </div>
          }

          <!-- 2. VISTA CALENDARIO / AGENDA VISUAL (RF-18 / APF2 Anexo C) -->
          @if (modoVista() === 'calendario') {
            <div class="flex flex-col gap-4 animate-in fade-in duration-200">
              <div class="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs text-slate-600">
                <span class="font-bold text-slate-800">Vista de Agenda por Especialista y Turno</span>
                <span class="text-[11px] text-slate-400">Haga clic en cualquier tarjeta para gestionar o reprogramar</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (grupo of citasAgrupadasPorVet(); track grupo.veterinarioNombre) {
                  <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 flex flex-col gap-3">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-[#1e6ff9]"></span>
                        {{ grupo.veterinarioNombre }}
                      </div>
                      <span class="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {{ grupo.citas.length }} citas
                      </span>
                    </div>

                    <div class="flex flex-col gap-2">
                      @for (c of grupo.citas; track c.id) {
                        <div
                          (click)="verDetalleCita(c)"
                          class="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#1e6ff9] hover:shadow-xs transition-all cursor-pointer flex flex-col gap-1.5"
                        >
                          <div class="flex items-center justify-between">
                            <span class="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                              🕒 {{ c.hora }} hrs
                            </span>
                            <span
                              class="px-2 py-0.5 rounded-md text-[10px] font-black border"
                              [ngClass]="{
                                'bg-sky-50 text-sky-800 border-sky-300': c.estado === 'PROGRAMADA',
                                'bg-emerald-50 text-emerald-800 border-emerald-300': c.estado === 'ATENDIDA',
                                'bg-rose-50 text-rose-800 border-rose-300': c.estado === 'CANCELADA'
                              }"
                            >
                              {{ c.estado }}
                            </span>
                          </div>

                          <div class="text-xs font-bold text-[#1e6ff9]">
                            🐾 {{ c.nombreMascota }} ({{ c.especieMascota }})
                          </div>
                          <div class="text-[11px] text-slate-500 truncate">
                            👤 {{ c.nombrePropietario }}
                          </div>
                          <div class="text-[11px] text-slate-400 italic truncate">
                            "{{ c.motivo }}"
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        }
      </div>
    </div>
  `
})
export class CitasPageComponent implements OnInit {
  readonly citaService = inject(CitaService);

  readonly modoVista = signal<ModoVistaCitas>('tabla');
  readonly mostrarFormulario = signal<boolean>(false);
  readonly citaSeleccionada = signal<Cita | null>(null);
  readonly citaParaConsulta = signal<Cita | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  // Modelos de filtros dinámicos
  filtroVeterinarioId = '';
  filtroFecha = '';
  filtroEstado: EstadoCita | undefined = undefined;

  // Agrupamiento de citas para la vista de calendario
  readonly citasAgrupadasPorVet = computed(() => {
    const lista = this.citaService.citas();
    const gruposMap = new Map<string, Cita[]>();

    for (const c of lista) {
      const vetNombre = c.nombreVeterinario || 'Especialista';
      if (!gruposMap.has(vetNombre)) {
        gruposMap.set(vetNombre, []);
      }
      gruposMap.get(vetNombre)!.push(c);
    }

    const resultado: { veterinarioNombre: string; citas: Cita[] }[] = [];
    gruposMap.forEach((citas, veterinarioNombre) => {
      resultado.push({
        veterinarioNombre,
        citas: citas.sort((a, b) => a.hora.localeCompare(b.hora))
      });
    });

    return resultado;
  });

  ngOnInit(): void {
    this.citaService.listarVeterinarios().subscribe();
    this.cargarCitas();
  }

  cargarCitas(page = 0): void {
    const filtros: CitaFiltros = {
      veterinarioId: this.filtroVeterinarioId || undefined,
      fecha: this.filtroFecha || undefined,
      estado: this.filtroEstado,
      page,
      size: 10
    };
    this.citaService.listarCitas(filtros).subscribe();
  }

  aplicarFiltros(): void {
    this.cargarCitas(0);
  }

  limpiarFiltros(): void {
    this.filtroVeterinarioId = '';
    this.filtroFecha = '';
    this.filtroEstado = undefined;
    this.cargarCitas(0);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.citaService.totalPaginas()) {
      this.cargarCitas(nuevaPagina);
    }
  }

  abrirFormularioNuevaCita(): void {
    this.mostrarFormulario.update((val) => !val);
    this.mensajeExito.set(null);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  verDetalleCita(cita: Cita, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.citaSeleccionada.set(cita);
  }

  onCitaGuardada(cita: Cita): void {
    this.mostrarFormulario.set(false);
    this.mensajeExito.set(
      `Cita médica agendada exitosamente para "${cita.nombreMascota}" con el ${cita.nombreVeterinario} el día ${cita.fecha} a las ${cita.hora} hrs (RF-13).`
    );
    this.cargarCitas();
  }

  onCitaActualizada(cita: Cita): void {
    this.citaSeleccionada.set(null);
    this.mensajeExito.set(
      `Cita de "${cita.nombreMascota}" actualizada exitosamente. Estado actual: ${cita.estado}.`
    );
    this.cargarCitas();
  }
}
