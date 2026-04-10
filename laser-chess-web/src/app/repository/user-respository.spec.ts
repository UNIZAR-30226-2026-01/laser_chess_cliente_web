import { TestBed } from '@angular/core/testing';

import { UserRespository } from './user-respository';

describe('UserRespository', () => {
  let service: UserRespository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRespository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
