import { TestBed } from '@angular/core/testing';

import { BoardState } from './board-state';

describe('BoardState', () => {
  let service: BoardState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
