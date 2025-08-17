import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOnboardComponent } from './admin-onboard.component';

describe('AdminOnboardComponent', () => {
  let component: AdminOnboardComponent;
  let fixture: ComponentFixture<AdminOnboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminOnboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
