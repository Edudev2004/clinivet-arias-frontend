import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    component.variant = 'healthy';
    fixture.detectChanges();
  });

  it('debe crearse correctamente con variante healthy', () => {
    expect(component).toBeTruthy();
    expect(component.variant).toBe('healthy');
  });

  it('debe admitir variante warning', () => {
    component.variant = 'warning';
    fixture.detectChanges();
    expect(component.variant).toBe('warning');
  });
});
