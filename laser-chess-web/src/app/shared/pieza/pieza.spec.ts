import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoPieza } from '../../model/game/TipoPieza';

import { Pieza } from './pieza';

describe('Pieza', () => {
  let component: Pieza;
  let fixture: ComponentFixture<Pieza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pieza]
    }).compileComponents();

    fixture = TestBed.createComponent(Pieza);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('initialX', 0);
    fixture.componentRef.setInput('initialY', 0);
    fixture.componentRef.setInput('tipoPieza', TipoPieza.REY);
    fixture.componentRef.setInput('rotationInput', 0);
    fixture.componentRef.setInput('cols', 10);
    fixture.componentRef.setInput('rows', 8);
    fixture.componentRef.setInput('isCasillaRestringida', () => null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
