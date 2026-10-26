import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    component.variant = 'primary';
    fixture.detectChanges();
  });

  it('debe crearse correctamente con variante primary', () => {
    expect(component).toBeTruthy();
    expect(component.variant).toBe('primary');
  });

  it('debe deshabilitarse cuando isLoading o disabled son true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('debe emitir evento onClick al hacer click', () => {
    spyOn(component.onClick, 'emit');
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(component.onClick.emit).toHaveBeenCalled();
  });

  it('debe aplicar className personalizada', () => {
    component.className = 'extra-custom-class';
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toContain('extra-custom-class');
  });
});
