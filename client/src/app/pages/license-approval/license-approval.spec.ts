import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseApproval } from './license-approval';

describe('LicenseApproval', () => {
  let component: LicenseApproval;
  let fixture: ComponentFixture<LicenseApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
