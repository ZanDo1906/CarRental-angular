import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeCarOwner } from './become-car-owner';

describe('BecomeCarOwner', () => {
  let component: BecomeCarOwner;
  let fixture: ComponentFixture<BecomeCarOwner>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeCarOwner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecomeCarOwner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
