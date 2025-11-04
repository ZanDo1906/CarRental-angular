import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarRegistrationApproval } from './car-registration-approval';

describe('CarRegistrationApproval', () => {
  let component: CarRegistrationApproval;
  let fixture: ComponentFixture<CarRegistrationApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarRegistrationApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarRegistrationApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
