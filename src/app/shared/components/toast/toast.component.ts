import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div
        class="fixed bottom-5 right-5 z-[9998] max-w-sm w-full p-4 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        [ngClass]="{
          'bg-teal-50 border-teal-200 text-teal-800': type === 'success',
          'bg-rose-50 border-rose-200 text-rose-800': type === 'error',
          'bg-amber-50 border-amber-200 text-amber-800': type === 'warning',
          'bg-sky-50 border-sky-200 text-sky-800': type === 'info'
        }"
      >
        <div class="mt-0.5 flex-shrink-0">
          @if (type === 'success') {
            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          } @else if (type === 'error') {
            <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          } @else if (type === 'warning') {
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
          }
        </div>

        <div class="flex-1 text-xs font-semibold leading-relaxed">
          {{ message }}
        </div>

        <button
          type="button"
          (click)="onClose()"
          class="text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    }
  `
})
export class ToastComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: ToastType = 'success';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.visible = false;
    this.close.emit();
  }
}
