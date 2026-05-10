import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeFlow } from './challenge-flow';

describe('ChallengeFlow', () => {
  let component: ChallengeFlow;
  let fixture: ComponentFixture<ChallengeFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeFlow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeFlow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
