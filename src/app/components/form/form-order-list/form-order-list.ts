import { Component, output, input, viewChild, ElementRef, signal, effect } from '@angular/core';

@Component({
  selector: 'app-form-order-list',
  imports: [],
  templateUrl: 'form-order-list.html',
  styleUrl: '../form.scss',
})
export class FormOrderList {

  // Input
  value = input<number | undefined>(undefined);

  // Internal display value
  displayValue = signal<number | undefined>(undefined);

  // Output with debounce
  valueChange = output<number | undefined>();

  // Internal timer control
  private debounceTimer: number | null = null;

  constructor() {
    // Sync external input changes to internal display
    effect(() => {
      this.displayValue.set(this.value());
    });
  }

  private emitValueChangeDebounced(newValue: number | undefined) {
    // Clear previous timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = window.setTimeout(() => {
      this.valueChange.emit(newValue);
    }, 900);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const numValue = Number(target.value);
    let newValue = isNaN(numValue) || target.value === '' ? undefined : numValue;

    // Don't allow negative values
    if (newValue !== undefined && newValue < 0) {
      newValue = 0;
    }

    this.displayValue.set(newValue);
    this.emitValueChangeDebounced(newValue);
  }

  // Number input controls
  increment() {
    const currentValue = Number(this.displayValue()) || 0;
    const newValue = currentValue + 1;
    this.displayValue.set(newValue);
    this.emitValueChangeDebounced(newValue);
  }

  decrement() {
    const currentValue = Number(this.displayValue()) || 0;
    const newValue = Math.max(0, currentValue - 1);
    this.displayValue.set(newValue);
    this.emitValueChangeDebounced(newValue);
  }
}
