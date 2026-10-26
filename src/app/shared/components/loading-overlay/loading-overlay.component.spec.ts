import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingOverlayComponent } from './loading-overlay.component';

describe('LoadingOverlayComponent', () => {
  let component: LoadingOverlayComponent;
  let fixture: ComponentFixture<LoadingOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingOverlayComponent);
    component = fixture.componentInstance;
    component.visible = true;
    component.message = 'Cargando información médica...';
    fixture.detectChanges();
  });

  it('debe crearse y renderizar el mensaje cuando visible es true', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cargando información médica...');
    expect(compiled.textContent).toContain('Clinivet');
  });

  it('no debe renderizar nada cuando visible es false', () => {
    component.visible = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.vet-loader-wrapper')).toBeNull();
  });
});
