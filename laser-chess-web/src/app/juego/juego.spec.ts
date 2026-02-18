import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Juego } from './juego';

describe('Juego', () => {
  let component: Juego;
  let fixture: ComponentFixture<Juego>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Juego]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Juego);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
