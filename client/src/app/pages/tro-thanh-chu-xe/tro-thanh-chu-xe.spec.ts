import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TroThanhChuXe } from './tro-thanh-chu-xe';

describe('TroThanhChuXe', () => {
  let component: TroThanhChuXe;
  let fixture: ComponentFixture<TroThanhChuXe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TroThanhChuXe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TroThanhChuXe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
