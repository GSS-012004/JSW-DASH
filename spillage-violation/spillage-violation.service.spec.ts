import { TestBed } from '@angular/core/testing';

import { SpillageViolationService } from './spillage-violation.service';

describe('SpillageViolationService', () => {
  let service: SpillageViolationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpillageViolationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
