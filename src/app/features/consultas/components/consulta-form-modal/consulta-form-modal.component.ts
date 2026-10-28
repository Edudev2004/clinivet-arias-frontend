import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../services/consulta.service';
import {
  Consulta,
  ConsultaCreateRequest,
  TratamientoCreateRequest,
  MedicamentoCatalogo
} from '../../models/consulta.model';
import { Cita } from '../../../citas/models/cita.model';

export interface TratamientoItem {
  medicamentoId: string;
  nombreMedicamento: string;
  dosisMgPorKg: number;
  dosisTotalMg: number;
  duracionDias: number;
  indicaciones: string;
}

@Component({
  selector: 'app-consulta-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9995] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">

        <!-- Encabezado de la Consulta Médica (RF-20 / Anexo E) -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div class="flex flex-col gap-1">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-outfit tracking-tight flex items-center gap-2">
              <span class="p-2 rounded-xl bg-emerald-100 text-emerald-700">🩺</span>
              Registro de Atención y Consulta Médica
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 font-medium">
              Triaje, diagnóstico clínico y prescripción con cálculo automático de dosis (RF-20, RF-21, RF-22, RF-23)
            </p>
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

        <!-- Banner de Paciente y Cita Asociada -->
        <div class="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span class="font-bold text-sky-950 text-sm">Paciente: {{ cita.nombreMascota }} ({{ cita.especieMascota }})</span>
            <div class="text-sky-800 mt-0.5">
              Propietario: {{ cita.nombrePropietario }} • DNI: {{ cita.dniPropietario }}
            </div>
          </div>
          <div class="text-sky-900 font-semibold sm:text-right">
            <div>Médico: {{ cita.nombreVeterinario }}</div>
            <div class="text-[11px] text-sky-700">Cita: {{ cita.fecha }} a las {{ cita.hora }} hrs</div>
          </div>
        </div>

        <!-- Banner de Error -->
        @if (mensajeError()) {
          <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <span class="flex-1 font-semibold leading-relaxed">{{ mensajeError() }}</span>
            <button type="button" (click)="mensajeError.set(null)" class="text-rose-500 hover:text-rose-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }

        <!-- Resumen de Guardado Exitoso -->
        @if (consultaGuardada()) {
          <div class="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex flex-col gap-4 animate-in fade-in duration-300">
            <div class="flex items-center gap-3 text-emerald-900 font-black text-lg">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>¡Atención Médica Registrada con Éxito! (RF-20)</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-emerald-800 font-medium">
              <div class="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Peso Actualizado</div>
                <div class="text-sm font-extrabold text-slate-900">{{ consultaGuardada()?.pesoKg }} kg</div>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Temperatura</div>
                <div class="text-sm font-extrabold text-slate-900">{{ consultaGuardada()?.temperaturaC }} °C</div>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Tratamientos</div>
                <div class="text-sm font-extrabold text-slate-900">{{ listaTratamientos().length }} prescritos</div>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Estado de Cita</div>
                <div class="text-sm font-extrabold text-emerald-600">ATENDIDA</div>
              </div>
            </div>

            <div class="bg-white/80 p-3.5 rounded-xl border border-emerald-100 text-xs text-slate-700">
              <div class="font-bold text-slate-900 mb-1">Diagnóstico Conclusivo:</div>
              <div>{{ consultaGuardada()?.diagnostico }}</div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                (click)="onFinalizar()"
                class="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Cerrar y Volver a la Agenda
              </button>
            </div>
          </div>
        } @else {

          <!-- Formulario Clínico Multisección -->
          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-6">

            <!-- SECCIÓN 1: Constantes Clínicas y Triaje (RF-20 / RF-12) -->
            <div class="flex flex-col gap-3">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Constantes Clínicas y Triaje</span>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Peso Actual (RF-12) -->
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-700">
                    Peso de la Mascota (kg) <span class="text-rose-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      [(ngModel)]="peso"
                      name="peso"
                      (ngModelChange)="recalcularDosisPrescripcion()"
                      placeholder="Ej. 28.50"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <span class="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">kg</span>
                  </div>
                  <span class="text-[10px] text-slate-400">Actualiza automáticamente la ficha (RF-12).</span>
                </div>

                <!-- Temperatura (°C) -->
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-700">
                    Temperatura Corporal (°C) <span class="text-rose-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="45"
                      [(ngModel)]="temperatura"
                      name="temperatura"
                      placeholder="Ej. 38.5"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <span class="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold pointer-events-none">°C</span>
                  </div>
                </div>

                <!-- Fecha Consulta -->
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-700">Fecha de Atención</label>
                  <input
                    type="date"
                    [value]="cita.fecha"
                    disabled
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <!-- SECCIÓN 2: Motivo y Diagnóstico Clínico (RF-21) -->
            <div class="flex flex-col gap-3">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Diagnóstico Clínico y Observaciones</span>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-700">
                    Motivo de Consulta <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    [(ngModel)]="motivo"
                    name="motivo"
                    rows="3"
                    placeholder="Síntomas observados..."
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  ></textarea>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-700">
                    Diagnóstico Clínico <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    [(ngModel)]="diagnostico"
                    name="diagnostico"
                    rows="3"
                    placeholder="Conclusión diagnóstica..."
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-slate-700">Observaciones y Cuidados Generales (Opcional)</label>
                <input
                  type="text"
                  [(ngModel)]="observaciones"
                  name="observaciones"
                  placeholder="Recomendaciones alimentarias, reposo o cuidados posoperatorios..."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <!-- SECCIÓN 3: Prescripción de Tratamientos con Calculadora de Dosis en Tiempo Real (RF-22 / RF-23 / RN-12) -->
            <div class="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/30">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Prescripción y Calculadora Automática de Dosis (RN-12 / RF-23)</span>
                </h3>
                <span class="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                  Fórmula: DosisTotal = Peso * Dosis (mg/kg)
                </span>
              </div>

              <!-- Inputs del Tratamiento en Preparación -->
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2">
                <!-- Selector Medicamento -->
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <label class="text-[11px] font-bold text-slate-700">Medicamento del Catálogo</label>
                  <select
                    [(ngModel)]="nuevoMedicamentoId"
                    name="nuevoMedicamentoId"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="">-- Seleccionar fármaco --</option>
                    @for (med of medicamentos(); track med.id) {
                      <option [value]="med.id">{{ med.nombre }} ({{ med.presentacion }})</option>
                    }
                  </select>
                </div>

                <!-- Dosis en mg/kg con Cálculo Reactivo -->
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold text-slate-700">Dosis (mg/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    [(ngModel)]="nuevaDosisMgPorKg"
                    name="nuevaDosisMgPorKg"
                    (ngModelChange)="recalcularDosisPrescripcion()"
                    placeholder="Ej. 12.5"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <!-- Duración en Días -->
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold text-slate-700">Duración (Días)</label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="nuevaDuracionDias"
                    name="nuevaDuracionDias"
                    placeholder="Días"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <!-- Fila con Indicaciones y Botón Agregar -->
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div class="flex flex-col gap-1 sm:col-span-3">
                  <label class="text-[11px] font-bold text-slate-700">Indicaciones para el Propietario</label>
                  <input
                    type="text"
                    [(ngModel)]="nuevasIndicaciones"
                    name="nuevasIndicaciones"
                    placeholder="Ej. Administrar cada 12 horas vía oral después de comer"
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    (click)="agregarTratamiento()"
                    [disabled]="!nuevoMedicamentoId || !nuevaDosisMgPorKg || !nuevaDuracionDias || !peso"
                    class="w-full px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    <span>Añadir Receta</span>
                  </button>
                </div>
              </div>

              <!-- Calculadora en Tiempo Real (Badge Informativo) -->
              @if (peso && nuevaDosisMgPorKg) {
                <div class="p-3 rounded-xl bg-white border border-teal-200 flex items-center justify-between text-xs animate-in fade-in duration-200">
                  <div class="flex items-center gap-2">
                    <span class="text-teal-600 font-bold">⚡ Cálculo Reactivo de Dosis Total:</span>
                    <span class="text-slate-600">{{ peso }} kg × {{ nuevaDosisMgPorKg }} mg/kg =</span>
                  </div>
                  <div class="text-sm font-black text-teal-700">
                    {{ calcularDosisTotalPreview() }} mg
                  </div>
                </div>
              }

              <!-- Tabla de Recetas / Tratamientos Agregados -->
              @if (listaTratamientos().length > 0) {
                <div class="mt-2 bg-white rounded-xl border border-teal-200 overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-teal-50/70 border-b border-teal-100 text-[10px] font-black uppercase text-teal-900 tracking-wider">
                        <th class="py-2.5 px-3">Medicamento</th>
                        <th class="py-2.5 px-3">Dosis Unitaria</th>
                        <th class="py-2.5 px-3">Dosis Total</th>
                        <th class="py-2.5 px-3">Duración</th>
                        <th class="py-2.5 px-3">Indicaciones</th>
                        <th class="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-teal-50 text-[11px] font-medium text-slate-700">
                      @for (t of listaTratamientos(); track t.medicamentoId; let i = $index) {
                        <tr>
                          <td class="py-2.5 px-3 font-bold text-slate-900">{{ t.nombreMedicamento }}</td>
                          <td class="py-2.5 px-3">{{ t.dosisMgPorKg }} mg/kg</td>
                          <td class="py-2.5 px-3 font-black text-teal-700">{{ t.dosisTotalMg }} mg</td>
                          <td class="py-2.5 px-3">{{ t.duracionDias }} días</td>
                          <td class="py-2.5 px-3 truncate max-w-xs">{{ t.indicaciones || 'Sin indicaciones adicionales' }}</td>
                          <td class="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              (click)="eliminarTratamiento(i)"
                              class="text-rose-500 hover:text-rose-700 font-bold p-1"
                              title="Remover prescripción"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Botones de Guardado y Cierre -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="onCerrar()"
                class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="!esFormularioValido() || guardando()"
                class="relative overflow-hidden px-7 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-emerald-600 border-2 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 cursor-pointer"
              >
                @if (guardando()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando Consulta...</span>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                  <span>Guardar Consulta Médica</span>
                }
              </button>
            </div>

          </form>
        }

      </div>
    </div>
  `
})
export class ConsultaFormModalComponent implements OnInit {
  private readonly consultaService = inject(ConsultaService);

  @Input({ required: true }) cita!: Cita;
  @Output() cerrar = new EventEmitter<void>();
  @Output() consultaRegistrada = new EventEmitter<Consulta>();

  readonly medicamentos = this.consultaService.medicamentosCatalogo;
  readonly guardando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);
  readonly consultaGuardada = signal<Consulta | null>(null);

  // Campos de Consulta
  peso: number | null = null;
  temperatura: number | null = null;
  motivo = '';
  diagnostico = '';
  observaciones = '';

  // Campos de Tratamiento
  nuevoMedicamentoId = '';
  nuevaDosisMgPorKg: number | null = null;
  nuevaDuracionDias: number | null = 7;
  nuevasIndicaciones = '';

  readonly listaTratamientos = signal<TratamientoItem[]>([]);

  ngOnInit(): void {
    if (this.cita) {
      this.motivo = this.cita.motivo;
    }
  }

  calcularDosisTotalPreview(): number {
    if (!this.peso || !this.nuevaDosisMgPorKg) return 0;
    return Math.round(this.peso * this.nuevaDosisMgPorKg * 100) / 100;
  }

  recalcularDosisPrescripcion(): void {
    // Reactividad para actualizar el cálculo preview
  }

  agregarTratamiento(): void {
    if (!this.nuevoMedicamentoId || !this.nuevaDosisMgPorKg || !this.nuevaDuracionDias || !this.peso) {
      return;
    }

    const med = this.medicamentos().find((m) => m.id === this.nuevoMedicamentoId);
    const dosisTotal = this.calcularDosisTotalPreview();

    const nuevoItem: TratamientoItem = {
      medicamentoId: this.nuevoMedicamentoId,
      nombreMedicamento: med?.nombre || 'Medicamento Prescrito',
      dosisMgPorKg: this.nuevaDosisMgPorKg,
      dosisTotalMg: dosisTotal,
      duracionDias: this.nuevaDuracionDias,
      indicaciones: this.nuevasIndicaciones.trim()
    };

    this.listaTratamientos.update((actuales) => [...actuales, nuevoItem]);

    // Limpiar campos de prescripción temporal
    this.nuevoMedicamentoId = '';
    this.nuevaDosisMgPorKg = null;
    this.nuevaDuracionDias = 7;
    this.nuevasIndicaciones = '';
  }

  eliminarTratamiento(index: number): void {
    this.listaTratamientos.update((actuales) => actuales.filter((_, i) => i !== index));
  }

  esFormularioValido(): boolean {
    return (
      !!this.peso &&
      this.peso > 0 &&
      !!this.temperatura &&
      this.temperatura > 0 &&
      this.motivo.trim().length >= 3 &&
      this.diagnostico.trim().length >= 3
    );
  }

  onSubmit(): void {
    if (!this.esFormularioValido()) {
      return;
    }

    const payload: ConsultaCreateRequest = {
      citaId: this.cita.id,
      veterinarioId: this.cita.veterinarioId,
      fecha: this.cita.fecha,
      motivo: this.motivo.trim(),
      diagnostico: this.diagnostico.trim(),
      peso: this.peso!,
      temperatura: this.temperatura!,
      observaciones: this.observaciones.trim() || undefined
    };

    this.guardando.set(true);
    this.mensajeError.set(null);

    // 1. Guardar la consulta médica (RF-20 / RN-04 / RN-07)
    this.consultaService.registrarConsulta(payload).subscribe({
      next: (consultaCreada) => {
        // 2. Persistir cada tratamiento prescrito si existen (RF-22)
        const tratamientos = this.listaTratamientos();
        if (tratamientos.length > 0) {
          tratamientos.forEach((t) => {
            const req: TratamientoCreateRequest = {
              medicamentoId: t.medicamentoId,
              dosisMgPorKg: t.dosisMgPorKg,
              duracionDias: t.duracionDias,
              indicaciones: t.indicaciones
            };
            this.consultaService.prescribirTratamiento(consultaCreada.id, req).subscribe();
          });
        }

        this.guardando.set(false);
        this.consultaGuardada.set(consultaCreada);
        this.consultaRegistrada.emit(consultaCreada);
      },
      error: (err) => {
        this.guardando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo registrar la consulta médica. Verifique permisos de rol o duplicidad.';
        this.mensajeError.set(msg);
      }
    });
  }

  onFinalizar(): void {
    this.cerrar.emit();
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
