import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-underline-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnderlineInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1 w-full text-left">
      @if (label) {
        <label [for]="inputId" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {{ label }}
        </label>
      }

      <div
        class="relative flex items-center border-b-2 border-slate-200 focus-within:border-brand-600 transition-colors py-1.5"
        [ngClass]="{ 'border-rose-500': !!error }"
      >
        <input
          [id]="inputId"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          class="w-full bg-transparent text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none pr-8 py-1"
        />

        <div class="absolute right-0 text-slate-400 pointer-events-none flex items-center">
          <ng-content select="[rightElement]"></ng-content>
        </div>
      </div>

      @if (error) {
        <p class="text-[11px] text-rose-500 font-semibold mt-1">{{ error }}</p>
      }
    </div>
  `
})
export class UnderlineInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() error?: string | null = null;
  @Input() id?: string;

  value = '';
  disabled = false;

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputId(): string {
    return this.id || `input-${this.label.toLowerCase().replace(/\s+/g, '-')}`;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

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
}
