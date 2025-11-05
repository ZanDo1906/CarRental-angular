import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCar } from './user-car';
import { CarList } from '../carList/carList';

describe('UserCar', () => {
  let component: UserCar;
  let fixture: ComponentFixture<UserCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCar, CarList],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
