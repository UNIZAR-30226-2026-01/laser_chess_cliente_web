import { TestBed } from '@angular/core/testing';

import { BoardAction } from './board-action';

describe('BoardAction', () => {
  let service: BoardAction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardAction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
