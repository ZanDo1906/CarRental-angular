import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanhSachXe } from './danh-sach-xe';

describe('DanhSachXe', () => {
  let component: DanhSachXe;
  let fixture: ComponentFixture<DanhSachXe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DanhSachXe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DanhSachXe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
