import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTrustCar } from './about-trustcar';

describe('AboutTrustCar', () => {
  let component: AboutTrustCar;
  let fixture: ComponentFixture<AboutTrustCar>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTrustCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTrustCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
