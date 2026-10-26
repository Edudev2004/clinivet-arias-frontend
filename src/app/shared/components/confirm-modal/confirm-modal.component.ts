import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalVariant = 'danger' | 'warning' | 'primary';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- Backdrop con desenfoque suave -->
        <div
          class="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          (click)="!isLoading ? onCancel() : null"
        ></div>

        <!-- Contenedor del Modal (Estilo VetHD) -->
        <div
          class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 z-10 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Botón cerrar esquina superior -->
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isLoading"
            class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer focus:outline-none"
            title="Cerrar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Ícono destacado -->
          <div
            class="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs"
            [ngClass]="{
              'bg-rose-50 border-rose-200 text-rose-600': variant === 'danger',
              'bg-amber-50 border-amber-200 text-amber-600': variant === 'warning',
              'bg-blue-50 border-blue-200 text-brand-600': variant === 'primary'
            }"
          >
            @if (variant === 'danger') {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
            } @else if (variant === 'warning') {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            } @else {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
            }
          </div>

          <!-- Título & Mensaje -->
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-outfit">
            {{ title }}
          </h3>
          <p class="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
            {{ description }}
          </p>

          <!-- Acciones -->
          <div class="mt-7 flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading"
              class="w-full sm:flex-1 py-3 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {{ cancelText }}
            </button>

            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isLoading"
              class="relative overflow-hidden w-full sm:flex-1 py-3.5 px-7 rounded-xl font-extrabold text-sm text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer border-2 group"
              [ngClass]="{
                'bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 hover:shadow-[0_4px_14px_rgba(225,29,72,0.35)] shadow-[0_3px_0_1px_rgba(225,29,72,0.3)]': variant === 'danger',
                'bg-[#F59E0B] text-slate-950 border-[#F59E0B] hover:bg-[#d97706] hover:text-white shadow-[0_3px_0_1px_rgba(245,158,11,0.3)]': variant === 'warning',
                'bg-[#1e6ff9] text-white border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)]': variant === 'primary'
              }"
            >
              <!-- Animated Skew Light Bar (#F59E0B / Amber shine effect - 1s duration) -->
              <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>

              <span class="relative z-10 flex items-center justify-center gap-2">
                @if (isLoading) {
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                  </svg>
                  <span>{{ confirmText }}</span>
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = '¿Cerrar Sesión?';
  @Input() description = '¿Estás seguro de que deseas salir del sistema? Tendrás que volver a ingresar tus credenciales para acceder a tus datos.';
  @Input() confirmText = 'Sí, Cerrar Sesión';
  @Input() cancelText = 'Cancelar';
  @Input() variant: ModalVariant = 'danger';
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isLoading) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
