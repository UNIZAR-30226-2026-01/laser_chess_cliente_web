import { TestBed } from '@angular/core/testing';

import { ChallengeManager } from './challenge-manager';

describe('ChallengeManager', () => {
  let service: ChallengeManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChallengeManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
