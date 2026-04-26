import { TestBed } from '@angular/core/testing';

import { GameUtils } from './game-utils';

describe('GameUtils', () => {
  let service: GameUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
