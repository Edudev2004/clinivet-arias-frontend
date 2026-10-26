import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MascotaService } from '../../services/mascota.service';
import { Mascota } from '../../models/mascota.model';
import { PetCardComponent } from '../../components/pet-card/pet-card.component';
import { PetFormComponent } from '../../components/pet-form/pet-form.component';
import { PetDetailModalComponent } from '../../components/pet-detail-modal/pet-detail-modal.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-mascotas-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PetCardComponent,
    PetFormComponent,
    PetDetailModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Encabezado del Módulo (RF-09 a RF-12) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
            Gestión de Mascotas
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Expedientes clínicos y registro de pacientes (RF-09 a RF-12)
          </p>
        </div>

        <button
          type="button"
          (click)="toggleFormulario()"
          class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
          [ngClass]="showForm() ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/20 shadow-md'"
        >
          @if (showForm()) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span>Cancelar</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span>Registrar Mascota</span>
          }
        </button>
      </div>

      <!-- Banner de Notificación / Toast Éxito -->
      @if (mensajeExito()) {
        <div class="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-teal-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <svg class="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-semibold">{{ mensajeExito() }}</span>
          </div>
          <button
            type="button"
            (click)="mensajeExito.set(null)"
            class="text-teal-600 hover:text-teal-800 focus:outline-none"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Barra de Filtros y Búsqueda Reactiva -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Input de Búsqueda -->
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <input
            type="text"
            [ngModel]="terminoBusqueda()"
            (ngModelChange)="terminoBusqueda.set($event)"
            placeholder="Buscar por nombre, raza o propietario..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        <!-- Filtro por Especie (Pills) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          @for (esp of especiesFiltro; track esp) {
            <button
              type="button"
              (click)="especieSeleccionada.set(esp)"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              [ngClass]="especieSeleccionada() === esp ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              {{ esp }}
            </button>
          }
        </div>
      </div>

      <!-- VISTA EN DOS COLUMNAS (Cuando el formulario está abierto) -->
      @if (showForm()) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Columna Izquierda: Formulario (RF-09 / RF-11) -->
          <div class="lg:col-span-5 xl:col-span-5">
            <div class="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white shadow-xs">
              <div class="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 font-outfit">
                  {{ mascotaEnEdicion() ? 'Editar Mascota' : 'Registrar Nueva Mascota' }}
                </h2>
                <button
                  type="button"
                  (click)="cancelarFormulario()"
                  class="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Cerrar
                </button>
              </div>

              <app-pet-form
                [mascota]="mascotaEnEdicion() ?? undefined"
                (guardado)="onMascotaGuardada($event)"
                (cancelar)="cancelarFormulario()"
              ></app-pet-form>
            </div>
          </div>

          <!-- Columna Derecha: Mascotas registradas -->
          <div class="lg:col-span-7 xl:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mascotas Filtradas ({{ mascotasFiltradas().length }})
              </h2>
            </div>

            @if (mascotasFiltradas().length === 0) {
              <div class="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-slate-800">No se encontraron mascotas</h3>
                <p class="text-xs text-slate-500 max-w-sm">Intenta ajustar tu búsqueda o registra una nueva mascota.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (m of mascotasFiltradas(); track m.id) {
                  <app-pet-card
                    [mascota]="m"
                    (verFicha)="abrirDetalle(m)"
                    (verHistorial)="abrirDetalle(m)"
                  ></app-pet-card>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- VISTA EN GRID COMPLETO (Formulario cerrado) -->
        @if (mascotasFiltradas().length === 0) {
          <div class="p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800 mb-1">No se encontraron mascotas registradas</h3>
              <p class="text-xs sm:text-sm text-slate-500 max-w-md">
                No hay coincidencias con los filtros aplicados o aún no has registrado pacientes en el sistema.
              </p>
            </div>
            <button
              type="button"
              (click)="abrirFormularioNuevo()"
              class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-700/20 active:scale-95"
            >
              Registrar Primera Mascota
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            @for (m of mascotasFiltradas(); track m.id) {
              <app-pet-card
                [mascota]="m"
                (verFicha)="abrirDetalle(m)"
                (verHistorial)="abrirDetalle(m)"
              ></app-pet-card>
            }
          </div>
        }
      }

      <!-- MODAL DE FICHA TÉCNICA (RF-10) -->
      @if (mascotaSeleccionada()) {
        <app-pet-detail-modal
          [mascota]="mascotaSeleccionada()!"
          (cerrar)="mascotaSeleccionada.set(null)"
          (editar)="iniciarEdicionDesdeModal($event)"
          (verHistorial)="mascotaSeleccionada.set(null)"
        ></app-pet-detail-modal>
      }

      <!-- MODAL DE CONFIRMACIÓN PARA BORRADO LÓGICO (RF-12 / RN-07) -->
      <app-confirm-modal
        [isOpen]="mostrarModalEliminar()"
        title="¿Desactivar Mascota?"
        [description]="'¿Confirmas la desactivación del paciente ' + (mascotaParaEliminar()?.nombre || '') + '? Se conservará su historial para fines clínicos.'"
        confirmText="Sí, Desactivar"
        cancelText="Cancelar"
        variant="danger"
        (confirm)="confirmarEliminarMascota()"
        (cancel)="mostrarModalEliminar.set(false)"
      ></app-confirm-modal>
    </div>
  `
})
export class MascotasPageComponent implements OnInit {
  private readonly mascotaService = inject(MascotaService);

  readonly showForm = signal<boolean>(false);
  readonly mascotaEnEdicion = signal<Mascota | null>(null);
  readonly mascotaSeleccionada = signal<Mascota | null>(null);
  readonly mascotaParaEliminar = signal<Mascota | null>(null);
  readonly mostrarModalEliminar = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);

  readonly terminoBusqueda = signal<string>('');
  readonly especieSeleccionada = signal<string>('Todos');

  readonly especiesFiltro = ['Todos', 'Canino', 'Felino', 'Ave', 'Otros'];

  // Lista reactiva filtrada computada
  readonly mascotasFiltradas = computed(() => {
    const list = this.mascotaService.mascotas();
    const termino = this.terminoBusqueda().toLowerCase().trim();
    const especie = this.especieSeleccionada();

    return list.filter((m) => {
      const coincideEspecie =
        especie === 'Todos' ||
        (especie === 'Otros'
          ? !['Canino', 'Felino', 'Ave'].includes(m.especie)
          : m.especie.toLowerCase() === especie.toLowerCase());

      const coincideTexto =
        !termino ||
        m.nombre.toLowerCase().includes(termino) ||
        (m.raza && m.raza.toLowerCase().includes(termino)) ||
        (m.propietarioNombre && m.propietarioNombre.toLowerCase().includes(termino)) ||
        (m.propietarioDni && m.propietarioDni.includes(termino));

      return coincideEspecie && coincideTexto;
    });
  });

  ngOnInit(): void {
    this.mascotaService.getMascotas().subscribe();
  }

  toggleFormulario(): void {
    if (this.showForm()) {
      this.cancelarFormulario();
    } else {
      this.abrirFormularioNuevo();
    }
  }

  abrirFormularioNuevo(): void {
    this.mascotaEnEdicion.set(null);
    this.showForm.set(true);
  }

  cancelarFormulario(): void {
    this.showForm.set(false);
    this.mascotaEnEdicion.set(null);
  }

  abrirDetalle(m: Mascota): void {
    this.mascotaSeleccionada.set(m);
  }

  iniciarEdicionDesdeModal(m: Mascota): void {
    this.mascotaSeleccionada.set(null);
    this.mascotaEnEdicion.set(m);
    this.showForm.set(true);
  }

  solicitarEliminarMascota(m: Mascota): void {
    this.mascotaParaEliminar.set(m);
    this.mostrarModalEliminar.set(true);
  }

  confirmarEliminarMascota(): void {
    const target = this.mascotaParaEliminar();
    if (!target) return;

    this.mascotaService.eliminarMascota(target.id).subscribe({
      next: () => {
        this.mostrarModalEliminar.set(false);
        this.mascotaParaEliminar.set(null);
        this.mensajeExito.set(`Mascota "${target.nombre}" desactivada correctamente.`);
        setTimeout(() => this.mensajeExito.set(null), 4000);
      }
    });
  }

  onMascotaGuardada(m: Mascota): void {
    const eraEdicion = !!this.mascotaEnEdicion();
    this.showForm.set(false);
    this.mascotaEnEdicion.set(null);

    const accion = eraEdicion ? 'actualizada' : 'registrada';
    this.mensajeExito.set(`Mascota "${m.nombre}" ${accion} con éxito.`);
    setTimeout(() => this.mensajeExito.set(null), 4000);
  }
}
