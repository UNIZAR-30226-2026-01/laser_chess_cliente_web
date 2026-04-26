import { TestBed } from '@angular/core/testing';

import { GameRepository } from './game-repository';

describe('GameRepository', () => {
  let service: GameRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
