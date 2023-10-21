import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireAndSmokeViolationComponent } from './fire-and-smoke-violation.component';

describe('FireAndSmokeViolationComponent', () => {
  let component: FireAndSmokeViolationComponent;
  let fixture: ComponentFixture<FireAndSmokeViolationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireAndSmokeViolationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireAndSmokeViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
