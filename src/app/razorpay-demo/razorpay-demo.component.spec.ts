import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RazorpayDemoComponent } from './razorpay-demo.component';

describe('RazorpayDemoComponent', () => {
  let component: RazorpayDemoComponent;
  let fixture: ComponentFixture<RazorpayDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RazorpayDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RazorpayDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
