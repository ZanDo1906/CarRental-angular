import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRental } from './user-rental';
import { CarList } from '../carList/carList';

describe('UserRental', () => {
  let component: UserRental;
  let fixture: ComponentFixture<UserRental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRental, CarList],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRental);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
