import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente modal de confirmación reutilizable (SOLID - Open/Closed).
 * Utilizado para confirmaciones críticas como borrado lógico de mascotas (RN-07)
 * y cierre de sesión.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <!-- Backdrop translúcido con desenfoque suave -->
        <div
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          (click)="onCancel()"
        ></div>

        <!-- Ventana Modal -->
        <div
          class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-150 p-6 sm:p-7 text-center"
        >
          <!-- Ícono de Variante -->
          <div
            class="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-inner"
            [ngClass]="{
              'bg-rose-50 text-rose-600 border border-rose-200': variant === 'danger',
              'bg-amber-50 text-amber-600 border border-amber-200': variant === 'warning',
              'bg-teal-50 text-teal-600 border border-teal-200': variant === 'primary'
            }"
          >
            @if (variant === 'danger') {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            } @else if (variant === 'warning') {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            } @else {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          </div>

          <!-- Título y Descripción -->
          <h3 class="text-lg font-bold text-slate-900 font-outfit mb-2">
            {{ title }}
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            {{ description }}
          </p>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              class="flex-1 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95"
              [ngClass]="{
                'bg-rose-600 hover:bg-rose-700': variant === 'danger',
                'bg-amber-600 hover:bg-amber-700': variant === 'warning',
                'bg-teal-600 hover:bg-teal-700': variant === 'primary'
              }"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() description = 'Esta acción no se puede deshacer.';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: 'danger' | 'warning' | 'primary' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
