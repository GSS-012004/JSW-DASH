import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpillageViolationComponent } from './spillage-violation.component';

describe('SpillageViolationComponent', () => {
  let component: SpillageViolationComponent;
  let fixture: ComponentFixture<SpillageViolationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpillageViolationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpillageViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
