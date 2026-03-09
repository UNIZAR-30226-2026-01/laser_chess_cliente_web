import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pieza } from './pieza';

describe('Pieza', () => {
  let component: Pieza;
  let fixture: ComponentFixture<Pieza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pieza]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pieza);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
