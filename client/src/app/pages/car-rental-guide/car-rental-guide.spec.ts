import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarRentalGuide } from './car-rental-guide';

describe('CarRentalGuide', () => {
  let component: CarRentalGuide;
  let fixture: ComponentFixture<CarRentalGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarRentalGuide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarRentalGuide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
