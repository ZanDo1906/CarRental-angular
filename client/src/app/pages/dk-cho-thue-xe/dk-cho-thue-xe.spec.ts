import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DKChoThueXe } from './dk-cho-thue-xe';

describe('DKChoThueXe', () => {
  let component: DKChoThueXe;
  let fixture: ComponentFixture<DKChoThueXe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DKChoThueXe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DKChoThueXe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
