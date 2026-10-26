import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'healthy' | 'warning' | 'pending' | 'confirmed';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs"
      [ngClass]="{
        'bg-emerald-100/80 text-emerald-700 border-emerald-200': variant === 'healthy',
        'bg-amber-100/80 text-amber-700 border-amber-200': variant === 'warning',
        'bg-slate-100 text-slate-600 border-slate-200': variant === 'pending',
        'bg-teal-100 text-teal-800 border-teal-200': variant === 'confirmed'
      }"
    >
      @if (variant === 'healthy') {
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      } @else if (variant === 'warning') {
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'healthy';
}
