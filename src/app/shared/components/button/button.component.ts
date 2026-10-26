import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || isLoading"
      class="relative overflow-hidden font-extrabold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl px-6 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-2 shadow-[0_3px_0_1px_rgba(13,124,132,0.3)] group"
      [ngClass]="{
        'w-full': fullWidth,
        'bg-[#0D7C84] text-white border-[#0D7C84] hover:bg-[#0b686f] hover:border-[#0b686f] hover:shadow-[0_4px_14px_rgba(13,124,132,0.35)]': variant === 'primary',
        'bg-[#F59E0B] text-slate-950 border-[#F59E0B] hover:bg-[#d97706] hover:text-white': variant === 'secondary',
        'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400': variant === 'outline'
      }"
    >
      <!-- Barra luminosa con efecto skew animada al hover (estilo VetHD) -->
      <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>

      <span class="relative z-10 flex items-center justify-center gap-2">
        @if (isLoading) {
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        }
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() fullWidth = false;
  @Input() isLoading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
