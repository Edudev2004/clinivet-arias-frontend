import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropietarioService } from '../../services/propietario.service';
import {
  Propietario,
  PropietarioCreateRequest,
  PropietarioUpdateRequest
} from '../../models/propietario.model';
import { PropietarioFormComponent } from '../../components/propietario-form/propietario-form.component';
import { PropietarioMascotasPanelComponent } from '../../components/propietario-mascotas-panel/propietario-mascotas-panel.component';

@Component({
  selector: 'app-propietarios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PropietarioFormComponent,
    PropietarioMascotasPanelComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Encabezado del Módulo (RF-05 a RF-08) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
            Gestión de Propietarios
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Directorio de clientes, registro y consulta de mascotas vinculadas (RF-05 a RF-08)
          </p>
        </div>

        <button
          type="button"
          (click)="abrirFormularioNuevo()"
          class="relative overflow-hidden px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-2 active:scale-95 group"
          [ngClass]="mostrarFormulario() && !propietarioAEditar() ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-[#1e6ff9] text-white border-[#1e6ff9] hover:bg-[#1858c7] hover:border-[#1858c7] hover:shadow-[0_4px_14px_rgba(30,111,249,0.35)] shadow-[0_3px_0_1px_rgba(30,111,249,0.3)]'"
        >
          @if (!mostrarFormulario()) {
            <!-- Animated Amber Light Bar -->
            <span class="absolute top-1/2 left-0 w-28 h-[160%] bg-[#F59E0B] opacity-90 -translate-y-1/2 skew-x-[30deg] -translate-x-44 transition-transform duration-1000 ease-in-out group-hover:translate-x-[480px]"></span>
          }

          <span class="relative z-10 flex items-center gap-2">
            @if (mostrarFormulario() && !propietarioAEditar()) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Cancelar</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
              </svg>
              <span>Registrar Propietario</span>
            }
          </span>
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
            class="text-teal-600 hover:text-teal-800 focus:outline-none p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Banner de Error / Conflicto -->
      @if (mensajeError()) {
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <span class="font-semibold">{{ mensajeError() }}</span>
          </div>
          <button
            type="button"
            (click)="mensajeError.set(null)"
            class="text-rose-600 hover:text-rose-800 focus:outline-none p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Formulario Desplegable: Registro o Edición (RF-05 / RF-07) -->
      @if (mostrarFormulario()) {
        <app-propietario-form
          [propietario]="propietarioAEditar()"
          [enviando]="guardando()"
          (guardar)="onGuardar($event)"
          (cancelar)="cerrarFormulario()"
        ></app-propietario-form>
      }

      <!-- Panel Lateral / Desplegable de Mascotas Asociadas (RF-08) -->
      @if (propietarioSeleccionado()) {
        <app-propietario-mascotas-panel
          [propietario]="propietarioSeleccionado()!"
          [mascotas]="propietarioService.mascotasDelPropietario()"
          [cargando]="propietarioService.cargandoMascotas()"
          (cerrar)="cerrarPanelMascotas()"
        ></app-propietario-mascotas-panel>
      }

      <!-- Barra de Filtros y Búsqueda Reactiva (RF-06) -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Input de Búsqueda -->
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <input
            type="text"
            [ngModel]="terminoBusqueda()"
            (ngModelChange)="onCambiarBusqueda($event)"
            placeholder="Buscar por nombre, apellidos, DNI o teléfono..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-xs"
          />
          @if (terminoBusqueda()) {
            <button
              type="button"
              (click)="limpiarBusqueda()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>

        <!-- Cantidad de Resultados -->
        <div class="flex items-center justify-between md:justify-end gap-2 text-xs text-slate-500 px-1">
          <span>{{ propietarioService.totalElementos() }} propietario(s) encontrado(s)</span>
        </div>
      </div>

      <!-- Tabla y Listado de Propietarios (RF-06) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        @if (propietarioService.cargando()) {
          <!-- Skeleton Loading -->
          <div class="p-8 space-y-4">
            <div class="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        } @else if (propietarioService.propietarios().length === 0) {
          <!-- Estado Vacío -->
          <div class="text-center py-16 px-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-700">No se encontraron propietarios</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              @if (terminoBusqueda()) {
                No hay coincidencias para "{{ terminoBusqueda() }}". Intente con otro nombre o DNI.
              } @else {
                No hay clientes registrados en el sistema. Comience agregando uno.
              }
            </p>
          </div>
        } @else {
          <!-- Vista Desktop: Tabla Responsiva -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th class="py-3.5 px-4 sm:px-6">Cliente</th>
                  <th class="py-3.5 px-4">DNI / Documento</th>
                  <th class="py-3.5 px-4">Contacto</th>
                  <th class="py-3.5 px-4 hidden lg:table-cell">Dirección</th>
                  <th class="py-3.5 px-4 text-center">Mascotas</th>
                  <th class="py-3.5 px-4 text-center hidden sm:table-cell">Estado</th>
                  <th class="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs sm:text-sm">
                @for (p of propietarioService.propietarios(); track p.id) {
                  <tr
                    class="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    [ngClass]="propietarioSeleccionado()?.id === p.id ? 'bg-brand-50/40' : ''"
                  >
                    <!-- Cliente: Avatar e Información -->
                    <td class="py-3.5 px-4 sm:px-6">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 border border-brand-200 text-xs">
                          {{ p.nombre.charAt(0) }}{{ p.apellido.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                            {{ p.nombre }} {{ p.apellido }}
                          </div>
                          @if (p.email) {
                            <div class="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {{ p.email }}
                            </div>
                          }
                        </div>
                      </div>
                    </td>

                    <!-- DNI -->
                    <td class="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {{ p.dni }}
                    </td>

                    <!-- Contacto -->
                    <td class="py-3.5 px-4 text-slate-600">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                        </svg>
                        <span>{{ p.telefono }}</span>
                      </div>
                    </td>

                    <!-- Dirección -->
                    <td class="py-3.5 px-4 hidden lg:table-cell text-slate-500 truncate max-w-[200px]">
                      {{ p.direccion || 'No registrada' }}
                    </td>

                    <!-- Mascotas vinculadas con badge interactivo -->
                    <td class="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        (click)="verMascotas(p, $event)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shadow-2xs"
                        [ngClass]="(p.cantidadMascotas || 0) > 0 ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
                        title="Ver lista de mascotas asociadas (RF-08)"
                      >
                        <span>🐾</span>
                        <span>{{ p.cantidadMascotas || 0 }}</span>
                      </button>
                    </td>

                    <!-- Estado Activo -->
                    <td class="py-3.5 px-4 text-center hidden sm:table-cell">
                      @if (p.activo) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Inactivo
                        </span>
                      }
                    </td>

                    <!-- Acciones: Ver Mascotas y Editar -->
                    <td class="py-3.5 px-4 sm:px-6 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          (click)="verMascotas(p, $event)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Ver mascotas de este propietario (RF-08)"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 1a2 2 0 100-4 2 2 0 000 4zm9 0a2 2 0 100-4 2 2 0 000 4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zm-7 6.5c2.5 0 4.5-1.5 4.5-3.5 0-1.8-1.5-2.5-4.5-4-3 1.5-4.5 2.2-4.5 4 0 2 2 3.5 4.5 3.5z"/>
                          </svg>
                        </button>

                        <button
                          type="button"
                          (click)="editarPropietario(p, $event)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar datos del propietario (RF-07)"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Barra de Paginación Reactiva (RF-06) -->
          <div class="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Página <span class="font-bold text-slate-800">{{ propietarioService.paginaActual() + 1 }}</span> de
              <span class="font-bold text-slate-800">{{ propietarioService.totalPaginas() || 1 }}</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="propietarioService.paginaActual() === 0"
                (click)="cambiarPagina(propietarioService.paginaActual() - 1)"
                class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                Anterior
              </button>

              <button
                type="button"
                [disabled]="propietarioService.paginaActual() >= propietarioService.totalPaginas() - 1"
                (click)="cambiarPagina(propietarioService.paginaActual() + 1)"
                class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PropietariosPageComponent implements OnInit {
  readonly propietarioService = inject(PropietarioService);

  // Estados locales con Signals
  readonly mostrarFormulario = signal<boolean>(false);
  readonly propietarioAEditar = signal<Propietario | null>(null);
  readonly guardando = signal<boolean>(false);
  readonly terminoBusqueda = signal<string>('');
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  get propietarioSeleccionado(): () => Propietario | null {
    return this.propietarioService.propietarioSeleccionado;
  }

  ngOnInit(): void {
    this.cargarPropietarios();
  }

  cargarPropietarios(page = 0): void {
    this.propietarioService.buscar(this.terminoBusqueda(), page).subscribe();
  }

  onCambiarBusqueda(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.cargarPropietarios(0);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.cargarPropietarios(0);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.propietarioService.totalPaginas()) {
      this.cargarPropietarios(nuevaPagina);
    }
  }

  abrirFormularioNuevo(): void {
    if (this.mostrarFormulario() && !this.propietarioAEditar()) {
      this.cerrarFormulario();
    } else {
      this.propietarioAEditar.set(null);
      this.mostrarFormulario.set(true);
      this.mensajeExito.set(null);
      this.mensajeError.set(null);
    }
  }

  editarPropietario(p: Propietario, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.propietarioAEditar.set(p);
    this.mostrarFormulario.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.propietarioAEditar.set(null);
  }

  verMascotas(p: Propietario, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.propietarioService.seleccionarPropietario(p);
  }

  cerrarPanelMascotas(): void {
    this.propietarioService.seleccionarPropietario(null);
  }

  onGuardar(payload: PropietarioCreateRequest | PropietarioUpdateRequest): void {
    this.guardando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    if (this.propietarioAEditar()) {
      const id = this.propietarioAEditar()!.id;
      this.propietarioService.actualizar(id, payload as PropietarioUpdateRequest).subscribe({
        next: (act) => {
          this.guardando.set(false);
          this.cerrarFormulario();
          this.mensajeExito.set(`Propietario "${act.nombre} ${act.apellido}" actualizado exitosamente (RF-07).`);
        },
        error: (err) => {
          this.guardando.set(false);
          const msg = err.error?.mensaje || err.error?.message || 'Error al actualizar el propietario. Verifique el DNI.';
          this.mensajeError.set(msg);
        }
      });
    } else {
      this.propietarioService.registrar(payload as PropietarioCreateRequest).subscribe({
        next: (nuevo) => {
          this.guardando.set(false);
          this.cerrarFormulario();
          this.mensajeExito.set(`Propietario "${nuevo.nombre} ${nuevo.apellido}" registrado exitosamente (RF-05).`);
        },
        error: (err) => {
          this.guardando.set(false);
          const msg = err.error?.mensaje || err.error?.message || 'Error al registrar el propietario. Verifique el DNI.';
          this.mensajeError.set(msg);
        }
      });
    }
  }
}
