import { TestBed } from '@angular/core/testing';

import { AuthRepository } from './auth-repository';

describe('AuthRepository', () => {
  let service: AuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
