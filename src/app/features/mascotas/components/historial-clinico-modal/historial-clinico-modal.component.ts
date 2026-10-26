import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mascota } from '../../models/mascota.model';

export interface EntradaHistorial {
  id: string;
  fecha: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  veterinario: {
    nombre: string;
    especialidad: string;
    colegiatura: string;
  };
  triaje: {
    pesoKg: number;
    temperaturaC: number;
    frecuenciaCardiacaBpm: number;
  };
  medicamentosPrescritos?: {
    nombre: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
  }[];
}

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

        <!-- Ventana Modal de Historial Clínico (Estilo VetHD) -->
        <div
          class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
          <!-- Cabecera con degradado Teal -->
          <div class="relative bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-xl sm:text-2xl font-black font-outfit">
                    Expediente Clínico: {{ mascotaNombre }}
                  </h2>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30 uppercase tracking-wider">
                    {{ entradas.length }} Atenciones Registradas
                  </span>
                </div>
                <p class="text-xs text-teal-100 font-medium mt-0.5">
                  Historial médico veterinario, triajes, diagnósticos y tratamientos
                </p>
              </div>
            </div>

            <!-- Botones de Acción de Cabecera -->
            <div class="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                (click)="imprimirHistorial()"
                class="px-3.5 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl transition-all flex items-center gap-2 active:scale-95"
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
                class="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none"
                title="Cerrar ventana"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Barra de Búsqueda de Entradas de Historial -->
          <div class="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
            <div class="relative flex-1">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="filtroTermino"
                placeholder="Buscar por diagnóstico, tratamiento, medicamento o veterinario..."
                class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-xs"
              />
            </div>

            <button
              type="button"
              (click)="alternarTodosLosAcordeones()"
              class="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
            >
              {{ todosExpandidos ? 'Colapsar Todos' : 'Expandir Todos' }}
            </button>
          </div>

          <!-- Cuerpo con Lista de Entradas de Historial (Scrollable) -->
          <div class="flex-1 p-6 overflow-y-auto space-y-4">
            @if (entradasFiltradas.length === 0) {
              <div class="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <h4 class="text-sm font-bold text-slate-800">No se encontraron atenciones médicas</h4>
                <p class="text-xs text-slate-500 max-w-sm">No hay consultas registradas para este paciente o ninguna coincide con el filtro.</p>
              </div>
            } @else {
              @for (entry of entradasFiltradas; track entry.id) {
                <div class="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-teal-300">
                  <!-- Cabecera del Acordeón -->
                  <div
                    (click)="toggleAcordeon(entry.id)"
                    class="p-4 sm:p-5 bg-slate-50/60 hover:bg-teal-50/40 cursor-pointer flex items-center justify-between gap-4 transition-colors select-none"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        <svg class="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold text-slate-900">{{ entry.fecha }}</span>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
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

                  <!-- Detalle Expandible -->
                  @if (acordeonesAbiertos[entry.id]) {
                    <div class="p-5 border-t border-slate-100 space-y-4 text-left animate-in fade-in duration-150">
                      <!-- Triaje Fisiológico -->
                      <div>
                        <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Signos Vitales y Triaje
                        </h4>
                        <div class="grid grid-cols-3 gap-3">
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-medium text-slate-400 block">Peso</span>
                            <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.pesoKg }} kg</span>
                          </div>
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-medium text-slate-400 block">Temperatura</span>
                            <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.temperaturaC }} °C</span>
                          </div>
                          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] font-medium text-slate-400 block">Frec. Cardíaca</span>
                            <span class="text-xs sm:text-sm font-bold text-slate-800">{{ entry.triaje.frecuenciaCardiacaBpm }} bpm</span>
                          </div>
                        </div>
                      </div>

                      <!-- Diagnóstico y Tratamiento -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
                          <h4 class="text-[11px] font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <span>Diagnóstico Médico</span>
                          </h4>
                          <p class="text-xs text-slate-700 leading-relaxed font-medium">
                            {{ entry.diagnostico }}
                          </p>
                        </div>

                        <div class="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                          <h4 class="text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                            </svg>
                            <span>Tratamiento y Plan Clínico</span>
                          </h4>
                          <p class="text-xs text-slate-700 leading-relaxed font-medium">
                            {{ entry.tratamiento }}
                          </p>
                        </div>
                      </div>

                      <!-- Receta Farmacológica si tiene -->
                      @if (entry.medicamentosPrescritos && entry.medicamentosPrescritos.length > 0) {
                        <div>
                          <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Medicamentos e Insumos Prescritos (RN-10 / RN-12)
                          </h4>
                          <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                            @for (med of entry.medicamentosPrescritos; track med.nombre) {
                              <div class="p-2.5 bg-slate-50 flex items-center justify-between text-xs">
                                <div>
                                  <span class="font-bold text-slate-800">{{ med.nombre }}</span>
                                  <span class="text-slate-500 ml-1">· {{ med.dosis }}</span>
                                </div>
                                <span class="text-[11px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                                  {{ med.frecuencia }} por {{ med.duracion }}
                                </span>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Observaciones Finales -->
                      <div class="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong class="text-slate-700">Observaciones:</strong> {{ entry.observaciones }}
                      </div>
                    </div>
                  }
                </div>
              }
            }
          </div>

          <!-- Pie del Modal -->
          <div class="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">
              Clinivet Arias — Sistema de Expedientes Clínicos
            </span>
            <button
              type="button"
              (click)="onClose()"
              class="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
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
  @Input() isOpen = false;
  @Input() mascotaId = '';
  @Input() mascotaNombre = '';
  @Input() mascota?: Mascota;
  @Output() close = new EventEmitter<void>();

  filtroTermino = '';
  todosExpandidos = true;
  acordeonesAbiertos: Record<string, boolean> = {};

  // Entradas de historial clínico demostrativas según especialidades y seed_data.sql
  entradas: EntradaHistorial[] = [];

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mascotaId'] || changes['mascotaNombre']) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    // Generar atenciones clínicas coherentes con la mascota
    const nombre = this.mascotaNombre || this.mascota?.nombre || 'Paciente';

    this.entradas = [
      {
        id: 'hist-1',
        fecha: '15/10/2026 - 10:30 AM',
        motivoConsulta: 'Control Periódico y Vacunación',
        diagnostico: `Examen clínico general de ${nombre} sin anomalías. Mucosas rosadas, ganglios normales. Se procede con revacunación anual preventiva.`,
        tratamiento: 'Administración de Séxtuple Canina (DHPPi/L) vía subcutánea.',
        observaciones: 'Paciente en excelente condición corporal. Próximo control en 6 meses o ante cualquier sintomatología.',
        veterinario: {
          nombre: 'Dr. Beckhan Elias',
          especialidad: 'Medicina General y Cirugía Menor',
          colegiatura: 'CMVP-14892'
        },
        triaje: {
          pesoKg: this.mascota?.pesoActualKg || 28.5,
          temperaturaC: 38.6,
          frecuenciaCardiacaBpm: 92
        },
        medicamentosPrescritos: [
          {
            nombre: 'Séxtuple Canina (DHPPi/L)',
            dosis: '1 dosis (1 ml)',
            frecuencia: 'Única',
            duracion: '1 día'
          }
        ]
      },
      {
        id: 'hist-2',
        fecha: '20/08/2026 - 03:15 PM',
        motivoConsulta: 'Dermatitis Alérgica y Prurito',
        diagnostico: `Dermatitis alérgica por picadura de pulga (DAPP) con eritema focal en lomo y zona ventral. Sin signos de infección bacteriana secundaria.`,
        tratamiento: 'Baño medicado antiseborreico, desparasitación externa con pipeta y antihistamínico vía oral.',
        observaciones: 'Mantener ambiente libre de ectoparásitos. Repetir tratamiento antiparasitario mensual.',
        veterinario: {
          nombre: 'Dr. Beckhan Elias',
          especialidad: 'Dermatología Veterinaria',
          colegiatura: 'CMVP-14892'
        },
        triaje: {
          pesoKg: this.mascota?.pesoActualKg ? this.mascota.pesoActualKg - 0.4 : 28.1,
          temperaturaC: 38.8,
          frecuenciaCardiacaBpm: 104
        },
        medicamentosPrescritos: [
          {
            nombre: 'Antihistamínico Clorfenamina 4mg',
            dosis: '1 tableta',
            frecuencia: 'Cada 12 horas',
            duracion: '5 días'
          },
          {
            nombre: 'Pipeta Antiparasitaria Spot-on',
            dosis: '1 pipeta',
            frecuencia: 'Única',
            duracion: '1 mes'
          }
        ]
      }
    ];

    // Expandir inicialmente
    this.entradas.forEach((e) => (this.acordeonesAbiertos[e.id] = true));
  }

  get entradasFiltradas(): EntradaHistorial[] {
    if (!this.filtroTermino.trim()) return this.entradas;
    const term = this.filtroTermino.toLowerCase().trim();

    return this.entradas.filter(
      (e) =>
        e.diagnostico.toLowerCase().includes(term) ||
        e.tratamiento.toLowerCase().includes(term) ||
        e.motivoConsulta.toLowerCase().includes(term) ||
        e.observaciones.toLowerCase().includes(term) ||
        e.veterinario.nombre.toLowerCase().includes(term) ||
        e.veterinario.especialidad.toLowerCase().includes(term)
    );
  }

  toggleAcordeon(id: string): void {
    this.acordeonesAbiertos[id] = !this.acordeonesAbiertos[id];
  }

  alternarTodosLosAcordeones(): void {
    this.todosExpandidos = !this.todosExpandidos;
    this.entradas.forEach((e) => (this.acordeonesAbiertos[e.id] = this.todosExpandidos));
  }

  imprimirHistorial(): void {
    window.print();
  }

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }
}
