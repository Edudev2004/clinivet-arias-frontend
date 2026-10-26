import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      currentUser: signal({
        id: 'u-1',
        nombre: 'Carlos',
        apellido: 'Mendoza',
        email: 'carlos@clinivet.pe',
        rol: 'ADMIN'
      }),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y obtener el nombre y rol del usuario autenticado', () => {
    expect(component).toBeTruthy();
    expect(component.userName).toBe('Carlos');
    expect(component.userFullName).toBe('Carlos Mendoza');
    expect(component.userRole).toBe('ADMIN');
  });

  it('debe llamar a authService.logout() al confirmar salida', () => {
    component.mostrarModalLogout = true;
    component.confirmarLogout();
    expect(component.mostrarModalLogout).toBeFalse();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
