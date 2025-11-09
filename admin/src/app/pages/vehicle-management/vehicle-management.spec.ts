import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleManagement } from './vehicle-management';

describe('VehicleManagement', () => {
  let component: VehicleManagement;
  let fixture: ComponentFixture<VehicleManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
