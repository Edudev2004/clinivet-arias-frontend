import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || isLoading"
      (click)="onClick.emit($event)"
      class="relative overflow-hidden font-extrabold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl px-7 py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer border-2 group {{ className }}"
      [ngClass]="{
        'w-full': fullWidth,
        'bg-[#1e6ff9] text-white border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)]': variant === 'primary',
        'bg-[#F59E0B] text-slate-950 border-[#F59E0B] hover:bg-[#d97706] hover:text-white shadow-[0_3px_0_1px_rgba(245,158,11,0.3)]': variant === 'secondary',
        'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400': variant === 'outline',
        'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 hover:border-rose-700 hover:shadow-[0_4px_14px_rgba(225,29,72,0.35)] shadow-[0_3px_0_1px_rgba(225,29,72,0.3)]': variant === 'danger'
      }"
    >
      <!-- Animated Skew Light Bar (#F59E0B / Amber shine effect - 1s duration) -->
      <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>

      <span class="relative z-10 flex items-center justify-center gap-2">
        @if (isLoading) {
          <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        } @else {
          <ng-content></ng-content>
        }
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
  @Input() className = '';

  @Output() onClick = new EventEmitter<MouseEvent>();
}

