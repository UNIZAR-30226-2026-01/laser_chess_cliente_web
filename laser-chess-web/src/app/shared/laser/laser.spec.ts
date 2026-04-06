import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Laser } from './laser';

describe('Laser', () => {
  let component: Laser;
  let fixture: ComponentFixture<Laser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Laser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Laser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
