import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MascotasPageComponent } from './mascotas-page.component';
import { MascotaService } from '../../services/mascota.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Mascota } from '../../models/mascota.model';

describe('MascotasPageComponent', () => {
  let component: MascotasPageComponent;
  let fixture: ComponentFixture<MascotasPageComponent>;
  let mascotaServiceSpy: any;

  const mockMascotas: Mascota[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      propietarioId: 'p0000000-0000-0000-0000-000000000001',
      propietarioNombre: 'Carlos Mendoza',
      propietarioDni: '45892314',
      nombre: 'Bobby',
      especie: 'Canino',
      raza: 'Golden Retriever',
      sexo: 'M',
      pesoActualKg: 28.5,
      activo: true
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      propietarioId: 'p0000000-0000-0000-0000-000000000002',
      propietarioNombre: 'María Flores',
      propietarioDni: '72345678',
      nombre: 'Luna',
      especie: 'Felino',
      raza: 'Siamés',
      sexo: 'H',
      pesoActualKg: 4.2,
      activo: true
    }
  ];

  beforeEach(async () => {
    mascotaServiceSpy = {
      mascotas: signal<Mascota[]>(mockMascotas),
      cargando: signal<boolean>(false),
      getMascotas: jasmine.createSpy('getMascotas').and.returnValue(of(mockMascotas)),
      eliminarMascota: jasmine.createSpy('eliminarMascota').and.returnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [MascotasPageComponent],
      providers: [{ provide: MascotaService, useValue: mascotaServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(MascotasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar las mascotas inicialmente', () => {
    expect(component).toBeTruthy();
    expect(mascotaServiceSpy.getMascotas).toHaveBeenCalled();
    expect(component.mascotasFiltradas().length).toBe(2);
  });

  it('debe filtrar reactivamente por término de búsqueda (nombre o dueño)', () => {
    component.terminoBusqueda.set('Luna');
    expect(component.mascotasFiltradas().length).toBe(1);
    expect(component.mascotasFiltradas()[0].nombre).toBe('Luna');

    component.terminoBusqueda.set('45892314');
    expect(component.mascotasFiltradas().length).toBe(1);
    expect(component.mascotasFiltradas()[0].nombre).toBe('Bobby');
  });

  it('debe filtrar reactivamente por especie (pills)', () => {
    component.especieSeleccionada.set('Felino');
    expect(component.mascotasFiltradas().length).toBe(1);
    expect(component.mascotasFiltradas()[0].nombre).toBe('Luna');

    component.especieSeleccionada.set('Canino');
    expect(component.mascotasFiltradas().length).toBe(1);
    expect(component.mascotasFiltradas()[0].nombre).toBe('Bobby');
  });

  it('toggleFormulario debe alternar la visualización del formulario', () => {
    expect(component.showForm()).toBeFalse();
    component.toggleFormulario();
    expect(component.showForm()).toBeTrue();
    component.toggleFormulario();
    expect(component.showForm()).toBeFalse();
  });

  it('abrirDetalle debe establecer la mascota seleccionada para el modal (RF-10)', () => {
    component.abrirDetalle(mockMascotas[0]);
    expect(component.mascotaSeleccionada()).toEqual(mockMascotas[0]);
  });

  it('iniciarEdicionDesdeModal debe abrir el formulario con los datos de la mascota (RF-11)', () => {
    component.iniciarEdicionDesdeModal(mockMascotas[0]);
    expect(component.mascotaSeleccionada()).toBeNull();
    expect(component.mascotaEnEdicion()).toEqual(mockMascotas[0]);
    expect(component.showForm()).toBeTrue();
  });

  it('solicitarEliminarMascota y confirmarEliminarMascota deben ejecutar borrado lógico (RF-12 / RN-07)', () => {
    component.solicitarEliminarMascota(mockMascotas[0]);
    expect(component.mostrarModalEliminar()).toBeTrue();
    expect(component.mascotaParaEliminar()).toEqual(mockMascotas[0]);

    component.confirmarEliminarMascota();
    expect(mascotaServiceSpy.eliminarMascota).toHaveBeenCalledWith(mockMascotas[0].id);
    expect(component.mostrarModalEliminar()).toBeFalse();
    expect(component.mensajeExito()).toContain('desactivada correctamente');
  });
});
