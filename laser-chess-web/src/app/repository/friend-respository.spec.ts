import { TestBed } from '@angular/core/testing';

import { FriendRespository } from './friend-respository';

describe('FriendRespository', () => {
  let service: FriendRespository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendRespository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
