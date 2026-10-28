import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropietariosPageComponent } from './propietarios-page.component';
import { PropietarioService } from '../../services/propietario.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Propietario, PropietarioPage, MascotaResumen } from '../../models/propietario.model';
import { provideRouter } from '@angular/router';

describe('PropietariosPageComponent', () => {
  let component: PropietariosPageComponent;
  let fixture: ComponentFixture<PropietariosPageComponent>;
  let propietarioServiceSpy: any;

  const mockPropietario: Propietario = {
    id: 'e0000000-0000-0000-0000-000000000001',
    nombre: 'Carlos',
    apellido: 'Mendoza Ramos',
    nombreCompleto: 'Carlos Mendoza Ramos',
    dni: '45871236',
    telefono: '987654321',
    email: 'carlos.mendoza@gmail.com',
    direccion: 'Av. Universitaria 1240',
    activo: true,
    createdAt: '2026-10-27T10:00:00',
    cantidadMascotas: 1
  };

  const mockPage: PropietarioPage = {
    content: [mockPropietario],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  };

  beforeEach(async () => {
    propietarioServiceSpy = {
      propietarios: signal<Propietario[]>([mockPropietario]),
      totalElementos: signal<number>(1),
      totalPaginas: signal<number>(1),
      paginaActual: signal<number>(0),
      cargando: signal<boolean>(false),
      propietarioSeleccionado: signal<Propietario | null>(null),
      mascotasDelPropietario: signal<MascotaResumen[]>([]),
      cargandoMascotas: signal<boolean>(false),
      buscar: jasmine.createSpy('buscar').and.returnValue(of(mockPage)),
      registrar: jasmine.createSpy('registrar').and.returnValue(of(mockPropietario)),
      actualizar: jasmine.createSpy('actualizar').and.returnValue(of(mockPropietario)),
      seleccionarPropietario: jasmine.createSpy('seleccionarPropietario')
    };

    await TestBed.configureTestingModule({
      imports: [PropietariosPageComponent],
      providers: [
        { provide: PropietarioService, useValue: propietarioServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropietariosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y llamar a buscar inicialmente (RF-06)', () => {
    expect(component).toBeTruthy();
    expect(propietarioServiceSpy.buscar).toHaveBeenCalled();
  });

  it('debe filtrar al cambiar la búsqueda (RF-06)', () => {
    component.onCambiarBusqueda('Mendoza');
    expect(component.terminoBusqueda()).toBe('Mendoza');
    expect(propietarioServiceSpy.buscar).toHaveBeenCalledWith('Mendoza', 0);
  });

  it('abrirFormularioNuevo debe activar la visualización del formulario de registro (RF-05)', () => {
    component.abrirFormularioNuevo();
    expect(component.mostrarFormulario()).toBeTrue();
    expect(component.propietarioAEditar()).toBeNull();
  });

  it('editarPropietario debe cargar datos para edición (RF-07)', () => {
    component.editarPropietario(mockPropietario);
    expect(component.mostrarFormulario()).toBeTrue();
    expect(component.propietarioAEditar()).toEqual(mockPropietario);
  });

  it('verMascotas debe invocar seleccionarPropietario en el servicio (RF-08)', () => {
    component.verMascotas(mockPropietario);
    expect(propietarioServiceSpy.seleccionarPropietario).toHaveBeenCalledWith(mockPropietario);
  });

  it('onGuardar en modo registro debe llamar a registrar y mostrar mensaje de éxito (RF-05)', () => {
    component.propietarioAEditar.set(null);
    component.onGuardar({
      nombre: 'Carlos',
      apellido: 'Mendoza',
      dni: '45871236',
      telefono: '987654321'
    });

    expect(propietarioServiceSpy.registrar).toHaveBeenCalled();
    expect(component.mostrarFormulario()).toBeFalse();
    expect(component.mensajeExito()).toContain('registrado exitosamente');
  });

  it('onGuardar en modo edición debe llamar a actualizar y mostrar mensaje de éxito (RF-07)', () => {
    component.propietarioAEditar.set(mockPropietario);
    component.onGuardar({
      nombre: 'Carlos Alberto',
      apellido: 'Mendoza Ramos',
      dni: '45871236',
      telefono: '999888777'
    });

    expect(propietarioServiceSpy.actualizar).toHaveBeenCalledWith(
      mockPropietario.id,
      jasmine.any(Object)
    );
    expect(component.mostrarFormulario()).toBeFalse();
    expect(component.mensajeExito()).toContain('actualizado exitosamente');
  });
});
