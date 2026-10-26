import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Mascota, MascotaCreateRequest, MascotaUpdateRequest, PropietarioResumen } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  template: `
    <form [formGroup]="petForm" (ngSubmit)="onSubmit()" class="space-y-5">
      <!-- Mensaje de error general si ocurre -->
      @if (errorMessage) {
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 text-rose-600 text-xs">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <!-- 1. Búsqueda y Selección de Propietario (RN-01 / RF-09) -->
      <div class="relative space-y-1 text-left">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Propietario Responsable <span class="text-rose-500">*</span>
        </label>
        
        @if (propietarioSeleccionado) {
          <!-- Tarjeta de Propietario Seleccionado -->
          <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-2xl">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {{ propietarioSeleccionado.nombre[0] }}
              </div>
              <div class="truncate">
                <p class="text-xs font-bold text-slate-900 truncate">
                  {{ propietarioSeleccionado.nombre }} {{ propietarioSeleccionado.apellido }}
                </p>
                <p class="text-[11px] text-slate-500 font-medium">
                  DNI: {{ propietarioSeleccionado.dni }} · Tel: {{ propietarioSeleccionado.telefono }}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              (click)="deseleccionarPropietario()"
              class="text-xs text-rose-600 hover:text-rose-800 font-bold ml-2 px-2 py-1 hover:bg-rose-100 rounded-lg transition-colors"
            >
              Cambiar
            </button>
          </div>
        } @else {
          <!-- Input con Autocomplete -->
          <div class="relative">
            <input
              type="text"
              [value]="busquedaPropietario"
              (input)="onBuscarPropietario($event)"
              placeholder="Buscar por DNI, nombre o apellido..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
            />
            
            <!-- Lista desplegable de sugerencias -->
            @if (propietariosSugeridos.length > 0) {
              <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                @for (prop of propietariosSugeridos; track prop.id) {
                  <button
                    type="button"
                    (click)="seleccionarPropietario(prop)"
                    class="w-full text-left p-3 hover:bg-blue-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p class="text-xs font-bold text-slate-900">{{ prop.nombre }} {{ prop.apellido }}</p>
                      <p class="text-[11px] text-slate-500">DNI: {{ prop.dni }}</p>
                    </div>
                    <span class="text-[11px] font-semibold text-brand-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Seleccionar
                    </span>
                  </button>
                }
              </div>
            }
          </div>
        }

        @if (petForm.get('propietarioId')?.touched && petForm.get('propietarioId')?.invalid) {
          <p class="text-[11px] text-rose-600 font-medium">Debe vincular un propietario para la mascota (RN-01).</p>
        }
      </div>

      <!-- 2. Nombre de la Mascota -->
      <div class="space-y-1 text-left">
        <label for="nombre" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Nombre de la Mascota <span class="text-rose-500">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          formControlName="nombre"
          placeholder="Ej. Bobby"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
        />
        @if (petForm.get('nombre')?.touched && petForm.get('nombre')?.invalid) {
          <p class="text-[11px] text-rose-600 font-medium">El nombre de la mascota es obligatorio.</p>
        }
      </div>

      <!-- 3. Especie y Sexo (Fila doble) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <!-- Especie -->
        <div class="space-y-1">
          <label for="especie" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Especie <span class="text-rose-500">*</span>
          </label>
          <select
            id="especie"
            formControlName="especie"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          >
            <option value="Canino">Canino (Perro)</option>
            <option value="Felino">Felino (Gato)</option>
            <option value="Ave">Ave</option>
            <option value="Roedor">Roedor</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <!-- Sexo -->
        <div class="space-y-1">
          <label for="sexo" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Sexo <span class="text-rose-500">*</span>
          </label>
          <select
            id="sexo"
            formControlName="sexo"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          >
            <option value="M">Macho</option>
            <option value="H">Hembra</option>
          </select>
        </div>
      </div>

      <!-- 4. Raza y Color -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div class="space-y-1">
          <label for="raza" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Raza
          </label>
          <input
            id="raza"
            type="text"
            formControlName="raza"
            placeholder="Ej. Golden Retriever"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        <div class="space-y-1">
          <label for="color" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Color
          </label>
          <input
            id="color"
            type="text"
            formControlName="color"
            placeholder="Ej. Dorado / Blanco"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      <!-- 5. Peso Actual (kg) y Fecha de Nacimiento (RF-12) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div class="space-y-1">
          <label for="pesoActualKg" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Peso Actual (kg) (RF-12)
          </label>
          <input
            id="pesoActualKg"
            type="number"
            step="0.01"
            formControlName="pesoActualKg"
            placeholder="Ej. 28.50"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          />
          @if (petForm.get('pesoActualKg')?.touched && petForm.get('pesoActualKg')?.invalid) {
            <p class="text-[11px] text-rose-600 font-medium">El peso debe ser mayor a 0 kg.</p>
          }
        </div>

        <div class="space-y-1">
          <label for="fechaNacimiento" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Fecha de Nacimiento
          </label>
          <input
            id="fechaNacimiento"
            type="date"
            formControlName="fechaNacimiento"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      <!-- 6. Fotografía de la Mascota con subida drag-and-drop (Estilo VetHD) -->
      <div class="space-y-1 text-left">
        <app-image-upload
          formControlName="fotoUrl"
          label="Fotografía de la Mascota"
          helperText="Formatos soportados: JPG, PNG o WEBP. Arrastra una imagen o ingresa una URL."
        ></app-image-upload>
      </div>

      <!-- Botones de Acción -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          (click)="cancelar.emit()"
          class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="petForm.invalid || isSubmitting"
          class="relative overflow-hidden px-7 py-3 text-sm font-extrabold text-white bg-[#1e6ff9] border-2 border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer group"
        >
          <!-- Animated Skew Light Bar (#F59E0B / Amber shine effect - 1s duration) -->
          <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>

          <span class="relative z-10 flex items-center justify-center gap-2">
            @if (isSubmitting) {
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Guardando...</span>
            } @else {
              <span>{{ mascota ? 'Guardar Cambios' : 'Registrar Mascota' }}</span>
            }
          </span>
        </button>
      </div>
    </form>
  `
})
export class PetFormComponent implements OnInit {
  @Input() mascota?: Mascota;
  @Output() guardado = new EventEmitter<Mascota>();
  @Output() cancelar = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly mascotaService = inject(MascotaService);

  petForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  busquedaPropietario = '';
  propietarioSeleccionado: PropietarioResumen | null = null;
  propietariosSugeridos: PropietarioResumen[] = [];

  ngOnInit(): void {
    this.initForm();

    if (this.mascota) {
      this.populateForm(this.mascota);
    }
  }

  private initForm(): void {
    this.petForm = this.fb.group({
      propietarioId: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      especie: ['Canino', [Validators.required]],
      raza: [''],
      color: [''],
      sexo: ['M', [Validators.required]],
      fechaNacimiento: [''],
      pesoActualKg: [null, [Validators.min(0.01)]],
      fotoUrl: ['']
    });
  }

  private populateForm(m: Mascota): void {
    this.petForm.patchValue({
      propietarioId: m.propietarioId,
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza || '',
      color: m.color || '',
      sexo: m.sexo,
      fechaNacimiento: m.fechaNacimiento || '',
      pesoActualKg: m.pesoActualKg || null,
      fotoUrl: m.fotoUrl || ''
    });

    if (m.propietarioNombre) {
      this.propietarioSeleccionado = {
        id: m.propietarioId,
        nombre: m.propietarioNombre,
        apellido: '',
        dni: m.propietarioDni || '',
        telefono: m.propietarioTelefono || ''
      };
    }
  }

  onBuscarPropietario(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busquedaPropietario = input.value;

    this.mascotaService.buscarPropietarios(this.busquedaPropietario).subscribe({
      next: (res) => {
        this.propietariosSugeridos = res;
      }
    });
  }

  seleccionarPropietario(prop: PropietarioResumen): void {
    this.propietarioSeleccionado = prop;
    this.petForm.patchValue({ propietarioId: prop.id });
    this.propietariosSugeridos = [];
    this.busquedaPropietario = '';
  }

  deseleccionarPropietario(): void {
    this.propietarioSeleccionado = null;
    this.petForm.patchValue({ propietarioId: '' });
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const formValue = this.petForm.value;

    if (this.mascota) {
      // Actualizar (RF-11 / RF-12)
      const updatePayload: MascotaUpdateRequest = {
        ...formValue,
        pesoActualKg: formValue.pesoActualKg ? Number(formValue.pesoActualKg) : undefined
      };

      this.mascotaService.actualizarMascota(this.mascota.id, updatePayload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.guardado.emit(res);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.message || 'Error al actualizar datos de la mascota';
        }
      });
    } else {
      // Registrar nueva mascota (RF-09)
      const createPayload: MascotaCreateRequest = {
        ...formValue,
        pesoActualKg: formValue.pesoActualKg ? Number(formValue.pesoActualKg) : undefined
      };

      this.mascotaService.registrarMascota(createPayload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.guardado.emit(res);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.message || 'Error al registrar la mascota';
        }
      });
    }
  }
}
