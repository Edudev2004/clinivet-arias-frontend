import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full space-y-2 text-left">
      @if (label) {
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {{ label }}
        </label>
      }

      <!-- Input de archivo oculto -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        (change)="onFileSelected($event)"
        [disabled]="disabled || isUploading"
        class="hidden"
      />

      <!-- Banner de Error si ocurre -->
      @if (uploadError) {
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-600 text-xs animate-in fade-in">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="flex-1">
            <p class="font-semibold">Error al procesar la imagen</p>
            <p class="text-slate-600">{{ uploadError }}</p>
          </div>
          <button
            type="button"
            (click)="uploadError = null"
            class="text-rose-400 hover:text-rose-700 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      }

      <!-- Estado: Subiendo imagen con animación -->
      @if (isUploading) {
        <div class="p-6 border-2 border-dashed border-brand-600/40 bg-brand-50/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-center animate-pulse">
          <div class="w-12 h-12 rounded-full bg-blue-100 text-brand-700 flex items-center justify-center">
            <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">
              Procesando y optimizando imagen...
            </p>
            <p class="text-xs text-slate-500 mt-0.5">
              Guardando en almacenamiento seguro de Clinivet
            </p>
          </div>
        </div>
      } @else if (value) {
        <!-- Estado: Imagen cargada con previsualización -->
        <div class="relative border border-slate-200 bg-slate-50/80 rounded-2xl p-3.5 flex items-center gap-4 group">
          <div
            class="relative overflow-hidden bg-white border border-slate-200 flex-shrink-0"
            [ngClass]="shape === 'circle' ? 'w-20 h-20 rounded-full' : 'w-20 h-20 rounded-xl'"
          >
            <img
              [src]="value"
              alt="Vista previa"
              class="w-full h-full object-cover"
              (error)="imgError = true"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Imagen vinculada correctamente</span>
            </div>
            <p class="text-[11px] text-slate-500 truncate max-w-xs" [title]="value">
              {{ value }}
            </p>

            <div class="flex items-center gap-2 mt-2">
              <button
                type="button"
                (click)="fileInput.click()"
                [disabled]="disabled"
                class="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                <span>Cambiar foto</span>
              </button>
              <button
                type="button"
                (click)="removerFoto()"
                [disabled]="disabled"
                class="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                </svg>
                <span>Quitar</span>
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Estado: Dropzone Vacía para Arrastrar o Seleccionar -->
        <div
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="!disabled && fileInput.click()"
          class="cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all"
          [ngClass]="{
            'border-brand-600 bg-blue-50/60 scale-[1.01]': isDragging,
            'border-slate-200 bg-white hover:border-brand-600/60 hover:bg-blue-50/20': !isDragging,
            'opacity-60 cursor-not-allowed': disabled
          }"
        >
          <div class="flex flex-col items-center justify-center gap-2">
            <div class="w-11 h-11 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">
                <span class="text-brand-700 underline underline-offset-2">
                  Haz clic para subir una foto
                </span>
                o arrástrala aquí
              </p>
              <p class="text-[11px] text-slate-500 mt-1">{{ helperText }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Opción para alternar ingreso manual de URL -->
      <div class="flex items-center justify-between pt-1">
        <button
          type="button"
          (click)="showManualUrl = !showManualUrl"
          class="text-[11px] font-medium text-slate-500 hover:text-brand-700 inline-flex items-center gap-1 focus:outline-none cursor-pointer"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
          </svg>
          <span>{{ showManualUrl ? 'Ocultar ingreso de URL manual' : 'O ingresar enlace URL manualmente' }}</span>
        </button>
      </div>

      @if (showManualUrl) {
        <div class="pt-1 animate-in fade-in duration-200">
          <input
            type="url"
            [value]="value"
            (input)="onManualUrlInput($event)"
            placeholder="https://ejemplo.com/foto.jpg"
            class="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
      }
    </div>
  `
})
export class ImageUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly storageService = inject(StorageService, { optional: true });

  @Input() label = 'Foto';
  @Input() helperText = 'Formatos soportados: JPG, PNG, WEBP o GIF (máx. 10 MB)';
  @Input() shape: 'rounded' | 'circle' = 'rounded';
  @Input() folder = 'mascotas';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  value = '';
  isUploading = false;
  uploadError: string | null = null;
  isDragging = false;
  showManualUrl = false;
  imgError = false;

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled && !this.isUploading) {
      this.isDragging = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (this.disabled || this.isUploading) return;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.procesarArchivo(event.dataTransfer.files[0]);
    }
  }

  procesarArchivo(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Formato no válido. Debe ser JPG, PNG, WEBP o GIF.';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'El archivo supera el tamaño máximo de 10 MB.';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;

    if (this.storageService) {
      this.storageService.uploadFile(file, this.folder).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.value = res.url;
          this.onChange(this.value);
          this.valueChange.emit(this.value);
          this.onTouched();
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = err?.error?.message || err?.message || 'Error al subir la imagen a Supabase Storage.';
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        this.isUploading = false;
        this.value = reader.result as string;
        this.onChange(this.value);
        this.valueChange.emit(this.value);
        this.onTouched();
      };
      reader.onerror = () => {
        this.isUploading = false;
        this.uploadError = 'Error al leer el archivo seleccionado.';
      };
      reader.readAsDataURL(file);
    }
  }

  removerFoto(): void {
    this.value = '';
    this.uploadError = null;
    this.onChange('');
    this.valueChange.emit('');
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  onManualUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}
