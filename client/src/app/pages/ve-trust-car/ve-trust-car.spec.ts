import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeTrustCar } from './ve-trust-car';

describe('VeTrustCar', () => {
  let component: VeTrustCar;
  let fixture: ComponentFixture<VeTrustCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeTrustCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeTrustCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
