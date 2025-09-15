import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessModelComponent } from './business-model.component';

describe('BusinessModelComponent', () => {
  let component: BusinessModelComponent;
  let fixture: ComponentFixture<BusinessModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusinessModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
