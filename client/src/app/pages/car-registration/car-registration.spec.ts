import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarRegistration } from './car-registration';

describe('CarRegistration', () => {
  let component: CarRegistration;
  let fixture: ComponentFixture<CarRegistration>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
