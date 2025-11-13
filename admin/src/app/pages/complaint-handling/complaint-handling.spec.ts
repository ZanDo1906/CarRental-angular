import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintHandling } from './complaint-handling';

describe('ComplaintHandling', () => {
  let component: ComplaintHandling;
  let fixture: ComponentFixture<ComplaintHandling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintHandling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintHandling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
