import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Board } from './board';

describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Board]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Board);
    
    component = fixture.componentInstance;
    component.piezas = signal([]);
    component.laserPath = signal([]); 
    component.columnas = 10;
    component.filas = 8;
    component.isCasillaRestringida = () => null;
    component.ocupado = () => null;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
