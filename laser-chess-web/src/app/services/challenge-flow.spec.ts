import { TestBed } from '@angular/core/testing';

import { ChallengeFlowService } from './challenge-flow';

describe('ChallengeFlowService', () => {
  let service: ChallengeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChallengeFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
