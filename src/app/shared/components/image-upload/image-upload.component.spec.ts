import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse con valores predeterminados', () => {
    expect(component).toBeTruthy();
    expect(component.value).toBe('');
    expect(component.isDragging).toBeFalse();
    expect(component.isUploading).toBeFalse();
  });

  it('debe admitir escritura de valor externo (writeValue)', () => {
    component.writeValue('https://example.com/bobby.jpg');
    expect(component.value).toBe('https://example.com/bobby.jpg');
  });

  it('debe alternar isDragging en eventos dragover y dragleave', () => {
    const mockDragOver = new DragEvent('dragover');
    spyOn(mockDragOver, 'preventDefault');
    component.onDragOver(mockDragOver);
    expect(component.isDragging).toBeTrue();
    expect(mockDragOver.preventDefault).toHaveBeenCalled();

    const mockDragLeave = new DragEvent('dragleave');
    spyOn(mockDragLeave, 'preventDefault');
    component.onDragLeave(mockDragLeave);
    expect(component.isDragging).toBeFalse();
  });

  it('debe procesar ingreso manual de URL', () => {
    const changeSpy = jasmine.createSpy('changeSpy');
    component.registerOnChange(changeSpy);

    const inputEvent = { target: { value: 'https://clinivet.pe/foto.png' } } as unknown as Event;
    component.onManualUrlInput(inputEvent);

    expect(component.value).toBe('https://clinivet.pe/foto.png');
    expect(changeSpy).toHaveBeenCalledWith('https://clinivet.pe/foto.png');
  });

  it('debe remover foto cuando se llama a removerFoto()', () => {
    component.value = 'https://example.com/pet.jpg';
    const changeSpy = jasmine.createSpy('changeSpy');
    component.registerOnChange(changeSpy);

    component.removerFoto();

    expect(component.value).toBe('');
    expect(changeSpy).toHaveBeenCalledWith('');
  });

  it('debe deshabilitar cuando se llama a setDisabledState(true)', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBeTrue();
  });
});
