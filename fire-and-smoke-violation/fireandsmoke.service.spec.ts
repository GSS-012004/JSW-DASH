import { TestBed } from '@angular/core/testing';

import { FireandsmokeService } from './fireandsmoke.service';

describe('FireandsmokeService', () => {
  let service: FireandsmokeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireandsmokeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
