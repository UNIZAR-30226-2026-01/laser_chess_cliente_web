import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pieza } from '../../shared/pieza/pieza';
import { TipoPieza } from '../../model/game/TipoPieza';
import { BoardState } from '../../utils/board-state';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';

describe('Pieza', () => {
  let component: Pieza;
  let fixture: ComponentFixture<Pieza>;

  const boardStateMock = {
    skinUsario: signal(1),
    skinRival: signal(1),
    laserColor: signal('red'),
  };

  const ocupadoVacio = () => null;
  const sinRestriccion = () => null;

  function crearComponente(overrides: Partial<{
    initialX: number;
    initialY: number;
    tipoPieza: TipoPieza;
    rotationInput: number;
    isBeingCaptured: boolean;
    ocupado: (x: number, y: number) => any;
    isCasillaRestringida: (x: number, y: number) => 'azul' | 'rojo' | null;
  }> = {}) {
    fixture = TestBed.createComponent(Pieza);
    component = fixture.componentRef.instance;

    fixture.componentRef.setInput('initialX', overrides.initialX ?? 3);
    fixture.componentRef.setInput('initialY', overrides.initialY ?? 3);
    fixture.componentRef.setInput('tipoPieza', overrides.tipoPieza ?? TipoPieza.DEFLECTOR);
    fixture.componentRef.setInput('rotationInput', overrides.rotationInput ?? 0);
    component.isBeingCaptured = overrides.isBeingCaptured ?? false;
    component.ocupado = overrides.ocupado ?? ocupadoVacio;
    fixture.componentRef.setInput('isCasillaRestringida', overrides.isCasillaRestringida ?? sinRestriccion);

    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Pieza],
      providers: [
        { provide: BoardState, useValue: boardStateMock },
      ],
    });
  });

  it('should be created', () => {
    const { component } = crearComponente();
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────
  //  Inicialización
  // ─────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('debería establecer la posición inicial', () => {
      const { component } = crearComponente({ initialX: 5, initialY: 4 });
      expect(component.position()).toEqual({ x: 5, y: 4 });
    });

    it('debería actualizar la interfaz según el skin y tipoPieza', () => {
      const { component } = crearComponente({ tipoPieza: TipoPieza.LASER });
      expect(component.interfazPieza).toContain('LAS');
    });
  });

  // ─────────────────────────────────────────────
  //  Renderizado
  // ─────────────────────────────────────────────

  describe('renderizado', () => {
    it('debería aplicar la clase captured si isBeingCaptured es true', () => {
      const { fixture } = crearComponente({ isBeingCaptured: true });
      const div = fixture.debugElement.query(By.css('.pieza'));
      expect(div.classes['captured']).toBe(true);
    });

    it('no debería aplicar la clase captured si isBeingCaptured es false', () => {
      const { fixture } = crearComponente({ isBeingCaptured: false });
      const div = fixture.debugElement.query(By.css('.pieza'));
      expect(div.classes['captured']).toBeFalsy();
    });

    it('debería aplicar la rotación correcta', () => {
      const { fixture } = crearComponente({ rotationInput: 90 });
      const div = fixture.debugElement.query(By.css('.pieza'));
      expect(div.styles['transform']).toContain('90deg');
    });

    it('no debería mostrar spots por defecto', () => {
      const { fixture } = crearComponente();
      const spots = fixture.debugElement.queryAll(By.css('.spot'));
      expect(spots.length).toBe(0);
    });

    it('debería mostrar spots cuando showSpots es true y no es LASER', () => {
      const { fixture, component } = crearComponente({
        initialX: 3,
        initialY: 3,
        tipoPieza: TipoPieza.DEFLECTOR,
      });
      component.showSpots.set(true);
      fixture.detectChanges();
      const spots = fixture.debugElement.queryAll(By.css('.spot'));
      expect(spots.length).toBeGreaterThan(0);
    });

    it('no debería mostrar spots si es LASER aunque showSpots sea true', () => {
      const { fixture, component } = crearComponente({
        tipoPieza: TipoPieza.LASER,
      });
      component.showSpots.set(true);
      fixture.detectChanges();
      const spots = fixture.debugElement.queryAll(By.css('.spot'));
      expect(spots.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  //  Eventos
  // ─────────────────────────────────────────────

  describe('select', () => {
    it('debería emitir el evento selected al hacer click', () => {
      const { fixture, component } = crearComponente();
      const spy = vi.fn();
      component.selected.subscribe(spy);

      const div = fixture.debugElement.query(By.css('.pieza'));
      div.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalledWith(component);
    });
  });

  describe('solicitarMovimiento', () => {
    it('debería emitir moveRequested con las coordenadas correctas', () => {
      const { fixture, component } = crearComponente({
        initialX: 3,
        initialY: 3,
        tipoPieza: TipoPieza.DEFLECTOR,
      });
      const spy = vi.fn();
      component.moveRequested.subscribe(spy);
      component.showSpots.set(true);
      fixture.detectChanges();

      const spot = fixture.debugElement.query(By.css('.spot-container'));
      spot.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  //  puedeEntrar
  // ─────────────────────────────────────────────

  describe('puedeEntrar', () => {
    it('debería devolver true si la casilla está libre y sin restricción', () => {
      const { component } = crearComponente();
      expect(component.puedeEntrar(4, 3)).toBe(true);
    });

    it('debería devolver false si la casilla está restringida como rojo', () => {
      const { component } = crearComponente({
        isCasillaRestringida: () => 'rojo',
      });
      expect(component.puedeEntrar(4, 3)).toBe(false);
    });

    it('debería devolver false si hay una pieza que bloquea el paso', () => {
      const { component } = crearComponente({
        ocupado: () => ({
          id: 99,
          x: 4, y: 3,
          rotation: 0,
          esMia: true,
          tipoPieza: TipoPieza.REY,
          isBeingCaptured: false,
        }),
      });
      expect(component.puedeEntrar(4, 3)).toBe(false);
    });

    it('SWITCH debería poder permutar con pieza rival', () => {
      const { component } = crearComponente({
        tipoPieza: TipoPieza.SWITCH,
        isCasillaRestringida: () => null,
        ocupado: () => ({
          id: 99,
          x: 4, y: 3,
          rotation: 0,
          esMia: false,
          tipoPieza: TipoPieza.DEFLECTOR,
          isBeingCaptured: false,
        }),
      });
      expect(component.puedeEntrar(4, 3)).toBe(true);
    });

    it('SWITCH no debería poder permutar con REY', () => {
      const { component } = crearComponente({
        tipoPieza: TipoPieza.SWITCH,
        isCasillaRestringida: () => null,
        ocupado: () => ({
          id: 99,
          x: 4, y: 3,
          rotation: 0,
          esMia: false,
          tipoPieza: TipoPieza.REY,
          isBeingCaptured: false,
        }),
      });
      expect(component.puedeEntrar(4, 3)).toBe(false);
    });

    it('SWITCH no debería poder permutar con otro SWITCH', () => {
      const { component } = crearComponente({
        tipoPieza: TipoPieza.SWITCH,
        isCasillaRestringida: () => null,
        ocupado: () => ({
          id: 99,
          x: 4, y: 3,
          rotation: 0,
          esMia: false,
          tipoPieza: TipoPieza.SWITCH,
          isBeingCaptured: false,
        }),
      });
      expect(component.puedeEntrar(4, 3)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  //  actualizarInterfaz - skins
  // ─────────────────────────────────────────────

  describe('actualizarInterfaz', () => {
    it('skin 1 debería usar assets Classic', () => {
      boardStateMock.skinUsario.set(1);
      const { component } = crearComponente({ tipoPieza: TipoPieza.REY });
      expect(component.interfazPieza).toContain('Classic');
    });

    it('skin 2 debería usar assets Soretro', () => {
      boardStateMock.skinUsario.set(2);
      const { component } = crearComponente({ tipoPieza: TipoPieza.REY });
      expect(component.interfazPieza).toContain('Soretro');
    });

    it('skin 3 debería usar assets Cats', () => {
      boardStateMock.skinUsario.set(3);
      const { component } = crearComponente({ tipoPieza: TipoPieza.REY });
      expect(component.interfazPieza).toContain('Cats');
    });
  });

  // ─────────────────────────────────────────────
  //  ngOnChanges
  // ─────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('debería actualizar la posición al cambiar initialX e initialY', () => {
      const { fixture, component } = crearComponente({ initialX: 2, initialY: 2 });
      fixture.componentRef.setInput('initialX', 7);
      fixture.componentRef.setInput('initialY', 6);
      fixture.detectChanges();
      expect(component.position()).toEqual({ x: 7, y: 6 });
    });
  });
});