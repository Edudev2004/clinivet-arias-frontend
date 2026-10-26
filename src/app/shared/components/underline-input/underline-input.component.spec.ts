import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnderlineInputComponent } from './underline-input.component';

describe('UnderlineInputComponent', () => {
  let component: UnderlineInputComponent;
  let fixture: ComponentFixture<UnderlineInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderlineInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnderlineInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente con valores iniciales', () => {
    expect(component).toBeTruthy();
    expect(component.value).toBe('');
    expect(component.disabled).toBeFalse();
  });

  it('debe escribir valor mediante ControlValueAccessor (writeValue)', () => {
    component.writeValue('Test Clinivet');
    expect(component.value).toBe('Test Clinivet');
  });

  it('debe emitir nuevo valor cuando cambia el input', () => {
    const spy = jasmine.createSpy('onChangeSpy');
    component.registerOnChange(spy);

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    inputEl.value = 'Mascota';
    inputEl.dispatchEvent(new Event('input'));

    expect(component.value).toBe('Mascota');
    expect(spy).toHaveBeenCalledWith('Mascota');
  });

  it('debe llamar a onTouched al desenfocar el input', () => {
    const touchedSpy = jasmine.createSpy('onTouchedSpy');
    component.registerOnTouched(touchedSpy);

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    inputEl.dispatchEvent(new Event('blur'));

    expect(touchedSpy).toHaveBeenCalled();
  });

  it('debe deshabilitar el input cuando se llama a setDisabledState(true)', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(component.disabled).toBeTrue();
    expect(inputEl.disabled).toBeTrue();
  });

  it('debe renderizar mensaje de error cuando se proporciona', () => {
    component.error = 'El campo es obligatorio';
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('p');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('El campo es obligatorio');
  });
});
