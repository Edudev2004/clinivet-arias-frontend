import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Propietario, PropietarioCreateRequest, PropietarioUpdateRequest } from '../../models/propietario.model';

@Component({
  selector: 'app-propietario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
      <!-- Encabezado del Formulario -->
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            @if (esModoEdicion) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
              </svg>
            }
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-800 font-outfit">
              {{ esModoEdicion ? 'Editar Propietario (RF-07)' : 'Nuevo Propietario (RF-05)' }}
            </h2>
            <p class="text-xs text-slate-500">
              {{ esModoEdicion ? 'Actualice la información del cliente registrado' : 'Complete los datos obligatorios para el registro' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="cancelar.emit()"
          class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Cerrar formulario"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Cuerpo del Formulario con Validación Reactiva -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
        <!-- Fila 1: Nombre y Apellido -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Nombre -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="nombre"
              placeholder="Ej. Carlos Alberto"
              class="w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-2xs"
              [ngClass]="campoInvalido('nombre') ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'"
            />
            @if (campoInvalido('nombre')) {
              <p class="text-[11px] text-rose-500 mt-1 font-medium">
                @if (form.get('nombre')?.hasError('required')) {
                  El nombre es obligatorio.
                } @else if (form.get('nombre')?.hasError('minlength')) {
                  Mínimo 2 caracteres requeridos.
                }
              </p>
            }
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Apellidos <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="apellido"
              placeholder="Ej. Mendoza Ramos"
              class="w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-2xs"
              [ngClass]="campoInvalido('apellido') ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'"
            />
            @if (campoInvalido('apellido')) {
              <p class="text-[11px] text-rose-500 mt-1 font-medium">
                @if (form.get('apellido')?.hasError('required')) {
                  El apellido es obligatorio.
                } @else if (form.get('apellido')?.hasError('minlength')) {
                  Mínimo 2 caracteres requeridos.
                }
              </p>
            }
          </div>
        </div>

        <!-- Fila 2: DNI y Teléfono -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- DNI -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              DNI / Documento <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              formControlName="dni"
              placeholder="8 a 12 dígitos numéricos"
              maxlength="12"
              class="w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-2xs font-mono"
              [ngClass]="campoInvalido('dni') ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'"
            />
            @if (campoInvalido('dni')) {
              <p class="text-[11px] text-rose-500 mt-1 font-medium">
                @if (form.get('dni')?.hasError('required')) {
                  El DNI es obligatorio.
                } @else if (form.get('dni')?.hasError('pattern')) {
                  Debe contener entre 8 y 12 dígitos numéricos.
                }
              </p>
            }
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teléfono de Contacto <span class="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              formControlName="telefono"
              placeholder="Ej. 987654321"
              maxlength="20"
              class="w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-2xs"
              [ngClass]="campoInvalido('telefono') ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'"
            />
            @if (campoInvalido('telefono')) {
              <p class="text-[11px] text-rose-500 mt-1 font-medium">
                @if (form.get('telefono')?.hasError('required')) {
                  El teléfono es obligatorio.
                } @else if (form.get('telefono')?.hasError('minlength')) {
                  Mínimo 6 caracteres requeridos.
                }
              </p>
            }
          </div>
        </div>

        <!-- Fila 3: Email y Dirección -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="cliente@ejemplo.com"
              class="w-full bg-slate-50/70 border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-2xs"
              [ngClass]="campoInvalido('email') ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'"
            />
            @if (campoInvalido('email')) {
              <p class="text-[11px] text-rose-500 mt-1 font-medium">
                Ingrese un formato de correo electrónico válido.
              </p>
            }
          </div>

          <!-- Dirección -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dirección Domiciliaria (Opcional)
            </label>
            <input
              type="text"
              formControlName="direccion"
              placeholder="Ej. Av. Universitaria 1240, Carabayllo"
              class="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        <!-- Estado Activo (solo en modo edición) -->
        @if (esModoEdicion) {
          <div class="pt-2">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                formControlName="activo"
                class="w-4 h-4 text-brand-600 rounded-md border-slate-300 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span class="text-xs font-bold text-slate-700">Propietario activo en el sistema</span>
            </label>
          </div>
        }

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            (click)="cancelar.emit()"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            [disabled]="form.invalid || enviando"
            class="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
          >
            @if (enviando) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
              <span>{{ esModoEdicion ? 'Actualizar Propietario' : 'Registrar Propietario' }}</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class PropietarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() propietario: Propietario | null = null;
  @Input() enviando = false;

  @Output() guardar = new EventEmitter<PropietarioCreateRequest | PropietarioUpdateRequest>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;

  get esModoEdicion(): boolean {
    return !!this.propietario?.id;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: [
        this.propietario?.nombre || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      apellido: [
        this.propietario?.apellido || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      dni: [
        this.propietario?.dni || '',
        [Validators.required, Validators.pattern(/^[0-9]{8,12}$/)]
      ],
      telefono: [
        this.propietario?.telefono || '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
      ],
      email: [
        this.propietario?.email || '',
        [Validators.email, Validators.maxLength(150)]
      ],
      direccion: [
        this.propietario?.direccion || '',
        [Validators.maxLength(255)]
      ],
      activo: [this.propietario ? this.propietario.activo : true]
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    if (this.esModoEdicion) {
      const payload: PropietarioUpdateRequest = {
        nombre: val.nombre.trim(),
        apellido: val.apellido.trim(),
        dni: val.dni.trim(),
        telefono: val.telefono.trim(),
        email: val.email ? val.email.trim() : undefined,
        direccion: val.direccion ? val.direccion.trim() : undefined,
        activo: val.activo
      };
      this.guardar.emit(payload);
    } else {
      const payload: PropietarioCreateRequest = {
        nombre: val.nombre.trim(),
        apellido: val.apellido.trim(),
        dni: val.dni.trim(),
        telefono: val.telefono.trim(),
        email: val.email ? val.email.trim() : undefined,
        direccion: val.direccion ? val.direccion.trim() : undefined
      };
      this.guardar.emit(payload);
    }
  }
}
