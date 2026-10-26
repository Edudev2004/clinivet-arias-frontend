import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    component.visible = true;
    component.message = 'Operación realizada con éxito';
    component.type = 'success';
    fixture.detectChanges();
  });

  it('debe crearse y mostrar el mensaje cuando visible es true', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Operación realizada con éxito');
  });

  it('onClose debe emitir close y poner visible en false', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.visible).toBeFalse();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
