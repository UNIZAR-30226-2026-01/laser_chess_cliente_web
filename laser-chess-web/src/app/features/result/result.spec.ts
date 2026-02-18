import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Result } from './result';

describe('Result', () => {
  let component: Result;
  let fixture: ComponentFixture<Result>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Result]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Result);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
