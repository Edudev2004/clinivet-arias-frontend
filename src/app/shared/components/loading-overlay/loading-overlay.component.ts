import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes vet-bounce {
      0% {
        top: 56px;
        height: 5px;
        border-radius: 50px 50px 25px 25px;
        transform: scaleX(1.7);
      }
      40% {
        height: 20px;
        border-radius: 50%;
        transform: scaleX(1);
      }
      100% {
        top: 0%;
      }
    }

    @keyframes vet-shadow {
      0% { transform: scaleX(1.5); }
      40% { transform: scaleX(1); opacity: 0.7; }
      100% { transform: scaleX(0.2); opacity: 0.4; }
    }

    .vet-loader-wrapper {
      width: 200px;
      height: 60px;
      position: relative;
    }

    .vet-circle {
      width: 20px;
      height: 20px;
      position: absolute;
      border-radius: 50%;
      background-color: #1e6ff9;
      left: 15%;
      transform-origin: 50%;
      animation: vet-bounce 0.6s alternate infinite ease;
    }

    .vet-circle:nth-child(2) {
      left: 45%;
      animation-delay: 0.2s;
      background-color: #F59E0B;
    }

    .vet-circle:nth-child(3) {
      left: auto;
      right: 15%;
      animation-delay: 0.3s;
      background-color: #1e6ff9;
    }

    .vet-shadow {
      width: 20px;
      height: 4px;
      border-radius: 50%;
      background-color: rgba(30, 111, 249, 0.25);
      position: absolute;
      top: 58px;
      transform-origin: 50%;
      z-index: -1;
      left: 15%;
      filter: blur(1px);
      animation: vet-shadow 0.6s alternate infinite ease;
    }

    .vet-shadow:nth-child(4) {
      left: 45%;
      animation-delay: 0.2s;
    }

    .vet-shadow:nth-child(5) {
      left: auto;
      right: 15%;
      animation-delay: 0.3s;
    }
  `],
  template: `
    @if (visible) {
      <div
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <!-- Logo / Marca Oficial -->
        <div class="mb-8 flex flex-col items-center">
          <img
            src="assets/img/logo-horizontal.png"
            alt="Clinivet Arias"
            class="h-14 sm:h-16 object-contain drop-shadow-xs"
          />
          <span class="sr-only">Clinivet Arias</span>
        </div>

        <!-- Animación de esferas veterinarias rebotantes (VetHD) -->
        <div class="vet-loader-wrapper">
          <div class="vet-circle"></div>
          <div class="vet-circle"></div>
          <div class="vet-circle"></div>
          <div class="vet-shadow"></div>
          <div class="vet-shadow"></div>
          <div class="vet-shadow"></div>
        </div>

        <p class="mt-8 text-xs sm:text-sm text-slate-600 font-medium tracking-wide">
          {{ message }}
        </p>
      </div>
    }
  `
})
export class LoadingOverlayComponent {
  @Input() visible = false;
  @Input() message = 'Cargando información clínica...';
}
