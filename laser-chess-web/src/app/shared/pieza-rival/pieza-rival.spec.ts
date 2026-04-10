import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoPieza } from '../../model/game/TipoPieza';

import { PiezaRival } from './pieza-rival';

describe('PiezaRival', () => {
  let component: PiezaRival;
  let fixture: ComponentFixture<PiezaRival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiezaRival]
    }).compileComponents();

    fixture = TestBed.createComponent(PiezaRival);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('x', 0);
    fixture.componentRef.setInput('y', 0);
    fixture.componentRef.setInput('rotationInput', 0);
    fixture.componentRef.setInput('tipoPieza', TipoPieza.REY);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
