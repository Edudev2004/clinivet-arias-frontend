import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mascota } from '../../models/mascota.model';
import { HistorialClinicoService } from '../../services/historial-clinico.service';
import { CitaService } from '../../../citas/services/cita.service';
import { EntradaHistorialClinico, HistorialFiltros } from '../../models/historial-clinico.model';

@Component({
  selector: 'app-historial-clinico-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <!-- Backdrop translúcido con desenfoque suave -->
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Ventana Modal de Historial Clínico (RF-25, RF-26) -->
        <div
          class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
          <!-- Cabecera con degradado Azul Institucional Clinivet Arias -->
          <div class="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white p-2 border border-white/40 flex items-center justify-center flex-shrink-0 shadow-md">
                <img src="assets/img/logo.png" alt="Clinivet Arias" class="w-10 h-10 object-contain" />
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-xl sm:text-2xl font-black font-outfit">
                    Expediente Clínico: {{ mascotaNombre || mascota?.nombre || 'Paciente' }}
                  </h2>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30 uppercase tracking-wider">
                    {{ historialService.totalElementos() }} Atenciones Registradas (RF-25)
                  </span>
                </div>
                <p class="text-xs text-blue-100 font-medium mt-0.5">
                  Historial médico veterinario, triajes, diagnósticos, tratamientos y vacunas (RN-09)
                </p>
              </div>
            </div>

            <!-- Botones de Acción de Cabecera -->
            <div class="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                (click)="imprimirHistorial()"
                class="px-3.5 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                title="Imprimir expediente clínico"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.656h10.5z"/>
                </svg>
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                (click)="onClose()"
                class="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none cursor-pointer"
                title="Cerrar ventana"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Barra de Filtros Combinados (RF-26: Rango de Fechas y Veterinario) -->
          <div class="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col gap-3">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <!-- Búsqueda textual -->
              <div class="sm:col-span-4 relative">
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
                <input
                  type="text"
                  [(ngModel)]="filtroTermino"
                  (ngModelChange)="aplicarFiltros()"
                  placeholder="Diagnóstico, motivo, fármaco..."
                  class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>

              <!-- Selector de Veterinario (RF-26) -->
              <div class="sm:col-span-3">
                <select
                  [(ngModel)]="filtroVeterinarioId"
                  (change)="aplicarFiltros()"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                >
                  <option value="">-- Todos los veterinarios --</option>
                  @for (v of veterinarios(); track v.id) {
                    <option [value]="v.id">{{ v.nombreCompleto }}</option>
                  }
                </select>
              </div>

              <!-- Rango de Fechas: Desde y Hasta (RF-26) -->
              <div class="sm:col-span-3 flex items-center gap-1.5">
                <input
                  type="date"
                  [(ngModel)]="fechaInicio"
                  (change)="aplicarFiltros()"
                  class="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                  title="Fecha inicio"
                />
                <span class="text-slate-400 text-xs">-</span>
                <input
                  type="date"
                  [(ngModel)]="fechaFin"
                  (change)="aplicarFiltros()"
                  class="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                  title="Fecha fin"
                />
              </div>

              <!-- Botones Limpiar y Acordeón -->
              <div class="sm:col-span-2 flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  (click)="limpiarFiltros()"
                  class="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-bold"
                  title="Restablecer filtros"
                >
                  ✕
                </button>
                <button
                  type="button"
                  (click)="alternarTodosLosAcordeones()"
                  class="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
                >
                  {{ todosExpandidos ? 'Colapsar' : 'Expandir' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Cuerpo con Lista de Entradas de Historial (Scrollable) -->
          <div class="flex-1 p-6 overflow-y-auto space-y-4">
            @if (historialService.cargando()) {
              <div class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div class="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-xs font-semibold">Cargando expediente clínico...</span>
              </div>
            } @else if (historialService.entradas().length === 0) {
              <div class="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
                  📋
                </div>
                <h4 class="text-sm font-bold text-slate-800">No se encontraron atenciones médicas</h4>
                <p class="text-xs text-slate-500 max-w-sm">
                  No hay registros clínicos que coincidan con los filtros de fecha o especialista aplicados.
                </p>
                <button
                  type="button"
                  (click)="limpiarFiltros()"
                  class="text-xs font-bold text-teal-600 hover:underline"
                >
                  Ver todo el historial
                </button>
              </div>
            } @else {
              @for (entry of historialService.entradas(); track entry.id) {
                <div class="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-teal-300">
                  <!-- Cabecera del Acordeón (Expandible / Colapsable) -->
                  <div
                    (click)="toggleAcordeon(entry.id)"
                    class="p-4 sm:p-5 bg-slate-50/60 hover:bg-teal-50/40 cursor-pointer flex items-center justify-between gap-4 transition-colors select-none"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        🩺
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-extrabold text-slate-900">{{ entry.fecha }}</span>
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                            {{ entry.motivoConsulta }}
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 font-medium truncate mt-0.5">
                          Atendido por: <strong class="text-slate-700">{{ entry.veterinario.nombre }}</strong> ({{ entry.veterinario.especialidad }})
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-slate-400 transition-transform duration-200"
                        [ngClass]="acordeonesAbiertos[entry.id] ? 'rotate-180' : ''"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Detalle Expandible de la Atención (RF-25) -->
                  @if (acordeonesAbiertos[entry.id]) {
                    <div class="p-5 border-t border-slate-100 space-y-4 text-left animate-in fade-in duration-150">
                      <!-- Triaje Fisiológico -->
                      <div>
                        <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Signos Vitales y Triaje Clínico
                        </h4>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-medium text-slate-400 block">Peso</span>
                            <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.pesoKg }} kg</span>
                          </div>
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-medium text-slate-400 block">Temperatura</span>
                            <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.temperaturaC }} °C</span>
                          </div>
                          @if (entry.triaje.frecuenciaCardiacaBpm) {
                            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span class="text-[10px] font-medium text-slate-400 block">Frec. Cardíaca</span>
                              <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.frecuenciaCardiacaBpm }} bpm</span>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Diagnóstico y Tratamiento -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
                          <h4 class="text-[11px] font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <span>Diagnóstico Médico Conclusivo</span>
                          </h4>
                          <p class="text-xs text-slate-700 leading-relaxed font-medium">
                            {{ entry.diagnostico }}
                          </p>
                        </div>

                        <!-- Vacunas Aplicadas en la Consulta si existen (RF-25) -->
                        <div class="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                          <h4 class="text-[11px] font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                            <span>💉</span>
                            <span>Inmunizaciones Administradas</span>
                          </h4>
                          @if (entry.vacunasAplicadas && entry.vacunasAplicadas.length > 0) {
                            <div class="flex flex-col gap-1.5 mt-1.5">
                              @for (vac of entry.vacunasAplicadas; track vac.nombreVacuna) {
                                <div class="text-xs font-semibold text-slate-800 flex items-center justify-between">
                                  <span>{{ vac.nombreVacuna }}</span>
                                  <span class="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md font-bold">
                                    Refuerzo: {{ vac.proximaFecha || 'Dosis única' }}
                                  </span>
                                </div>
                              }
                            </div>
                          } @else {
                            <p class="text-xs text-slate-500 italic mt-1">Sin vacunas aplicadas en esta atención médica.</p>
                          }
                        </div>
                      </div>

                      <!-- Receta Farmacológica y Tratamientos (RF-22 / RF-23 / RF-25) -->
                      @if (entry.tratamientos && entry.tratamientos.length > 0) {
                        <div>
                          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Tratamientos y Prescripciones Farmacológicas (RN-12 / RF-23)
                          </h4>
                          <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                            @for (trat of entry.tratamientos; track trat.medicamento) {
                              <div class="p-3 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div>
                                  <span class="font-black text-slate-900">{{ trat.medicamento }}</span>
                                  @if (trat.dosisTotalMg) {
                                    <span class="text-teal-700 font-bold ml-1.5">· Dosis Total: {{ trat.dosisTotalMg }} mg</span>
                                  }
                                  @if (trat.indicaciones) {
                                    <div class="text-[11px] text-slate-500 mt-0.5">{{ trat.indicaciones }}</div>
                                  }
                                </div>
                                <span class="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg self-start sm:self-center">
                                  {{ trat.frecuencia || 'Vía oral' }} · {{ trat.duracion }}
                                </span>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Observaciones Finales -->
                      @if (entry.observaciones) {
                        <div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <strong class="text-slate-800">Observaciones:</strong> {{ entry.observaciones }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Controles de Paginación (RF-25: cuando supera 20 entradas) -->
              @if (historialService.totalElementos() > 0) {
                <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div>
                    Página <span class="font-bold text-slate-800">{{ historialService.paginaActual() + 1 }}</span> de
                    <span class="font-bold text-slate-800">{{ historialService.totalPaginas() }}</span>
                    ({{ historialService.totalElementos() }} atenciones)
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      [disabled]="historialService.paginaActual() === 0"
                      (click)="cambiarPagina(historialService.paginaActual() - 1)"
                      class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      [disabled]="historialService.paginaActual() >= historialService.totalPaginas() - 1"
                      (click)="cambiarPagina(historialService.paginaActual() + 1)"
                      class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Pie del Modal -->
          <div class="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">
              Clinivet Arias — Historial Clínico Inmutable y Permanente (RN-09)
            </span>
            <button
              type="button"
              (click)="onClose()"
              class="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HistorialClinicoModalComponent implements OnInit, OnChanges {
  readonly historialService = inject(HistorialClinicoService);
  private readonly citaService = inject(CitaService);

  @Input() isOpen = false;
  @Input() mascotaId = '';
  @Input() mascotaNombre = '';
  @Input() mascota?: Mascota;
  @Output() close = new EventEmitter<void>();

  readonly veterinarios = this.citaService.veterinarios;

  filtroTermino = '';
  filtroVeterinarioId = '';
  fechaInicio = '';
  fechaFin = '';

  todosExpandidos = true;
  acordeonesAbiertos: Record<string, boolean> = {};

  ngOnInit(): void {
    this.cargarVeterinarios();
    if (this.isOpen) {
      this.cargarHistorial();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.cargarHistorial();
    } else if (changes['mascotaId'] && this.isOpen) {
      this.cargarHistorial();
    }
  }

  cargarVeterinarios(): void {
    if (this.veterinarios().length === 0) {
      this.citaService.listarVeterinarios().subscribe();
    }
  }

  cargarHistorial(page = 0): void {
    const id = this.mascotaId || this.mascota?.id || 'f0000000-0000-0000-0000-000000000001';
    const filtros: HistorialFiltros = {
      fechaInicio: this.fechaInicio || undefined,
      fechaFin: this.fechaFin || undefined,
      veterinarioId: this.filtroVeterinarioId || undefined,
      termino: this.filtroTermino.trim() || undefined,
      page,
      size: 20
    };

    this.historialService.consultarHistorial(id, filtros).subscribe({
      next: (res) => {
        // Expandir por defecto
        res.content.forEach((e) => (this.acordeonesAbiertos[e.id] = true));
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarHistorial(0);
  }

  limpiarFiltros(): void {
    this.filtroTermino = '';
    this.filtroVeterinarioId = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHistorial(0);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.historialService.totalPaginas()) {
      this.cargarHistorial(nuevaPagina);
    }
  }

  toggleAcordeon(id: string): void {
    this.acordeonesAbiertos[id] = !this.acordeonesAbiertos[id];
  }

  alternarTodosLosAcordeones(): void {
    this.todosExpandidos = !this.todosExpandidos;
    this.historialService.entradas().forEach((e) => {
      this.acordeonesAbiertos[e.id] = this.todosExpandidos;
    });
  }

  imprimirHistorial(): void {
    window.print();
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }
}
