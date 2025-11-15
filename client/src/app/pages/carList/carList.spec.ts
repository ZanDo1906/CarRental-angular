import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarList } from './carList';

describe('CarList', () => {
  let component: CarList;
  let fixture: ComponentFixture<CarList>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
