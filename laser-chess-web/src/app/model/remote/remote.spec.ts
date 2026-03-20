import { TestBed } from '@angular/core/testing';

import { Remote } from './remote';

describe('Remote', () => {
  let service: Remote;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Remote);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
