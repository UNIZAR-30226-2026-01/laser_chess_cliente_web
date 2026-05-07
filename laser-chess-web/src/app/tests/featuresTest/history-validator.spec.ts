import { TestBed } from '@angular/core/testing';
import { HistoryService } from '../../services/history-service';
import { GameLogicService } from '../../services/game-logic-service';
import { GameUtils } from '../../utils/game-utils';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { TipoPieza } from '../../model/game/TipoPieza';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('HistoryService', () => {
  let service: HistoryService;

  const mockPiezas = [
    { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 2, x: 1, y: 1, rotation: 0, isBeingCaptured: false, esMia: false, tipoPieza: TipoPieza.ESCUDO },
  ];

  const mockGame = {
    p1_id: 42,
    p2_id: 99,
    board: 'mockBoard',
    movement_history: 'Te1:e2%a1,b1%{300};Re3%a1,b1%{280}',
    time_base: 300,
  };

  const userRepoMock = {
    getId: () => 42,
    getUsername: () => 'YoMismo',
    getAccount: vi.fn().mockReturnValue({
      subscribe: (cb: any) => cb({ username: 'Rival', avatar: 2 }),
    }),
  };

  const boardStateMock = {
    iniciarTablero: vi.fn().mockReturnValue([...mockPiezas]),
    laserColor: signal('red'),
    skinRival: signal(1),
  };

  const gameUtilsMock = {
    fromChess: (coord: string, _esAzul: boolean) => {
      const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
      const row = parseInt(coord[1]) - 1;
      return { x: col, y: row };
    },
  };

  const gameLogicMock = {};

  beforeEach(() => {
    boardStateMock.iniciarTablero.mockReturnValue([...mockPiezas]);

    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        { provide: GameLogicService, useValue: gameLogicMock },
        { provide: GameUtils, useValue: gameUtilsMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: BoardState, useValue: boardStateMock },
      ],
    });
    service = TestBed.inject(HistoryService);
    service.historySelectedGame.set(mockGame as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─────────────────────────────────────────────
  //  inicializarTablero
  // ─────────────────────────────────────────────

  describe('inicializarTablero', () => {
    it('debería inicializar las piezas del tablero', () => {
      service.inicializarTablero();
      expect(service.listaPiezas().length).toBe(mockPiezas.length);
    });

    it('debería resetear el índice de movimiento a 0', () => {
      service.indiceMovimiento = 5;
      service.inicializarTablero();
      expect(service.indiceMovimiento).toBe(0);
    });

    it('debería parsear el historial de movimientos', () => {
      service.inicializarTablero();
      expect(service.movimientos.length).toBe(2);
    });

    it('debería asignar soyAzul false si soy p1', () => {
      service.inicializarTablero();
      expect(service.soyAzul()).toBe(false);
    });

    it('debería asignar soyAzul true si soy p2', () => {
      service.historySelectedGame.set({ ...mockGame, p1_id: 99, p2_id: 42 } as any);
      service.inicializarTablero();
      expect(service.soyAzul()).toBe(true);
    });

    it('debería asignar los tiempos base', () => {
      service.inicializarTablero();
      expect(service.miTiempo()).toBe(300);
      expect(service.tiempoRival()).toBe(300);
    });

    it('debería asignar el nombre propio', () => {
      service.inicializarTablero();
      expect(service.miNombre()).toBe('YoMismo');
    });

    it('debería asignar el nombre del rival', () => {
      service.inicializarTablero();
      expect(service.nombreRival()).toBe('Rival');
    });
  });

  // ─────────────────────────────────────────────
  //  Movimientos en tablero
  // ─────────────────────────────────────────────

  describe('moverPiezaEnTablero', () => {
    beforeEach(() => {
      service.listaPiezas.set([
        { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
        { id: 2, x: 1, y: 1, rotation: 0, isBeingCaptured: false, esMia: false, tipoPieza: TipoPieza.ESCUDO },
      ]);
    });

    it('debería mover la pieza al destino', () => {
      service.moverPiezaEnTablero({ x: 0, y: 0 }, { x: 3, y: 3 });
      const pieza = service.listaPiezas().find(p => p.x === 3 && p.y === 3);
      expect(pieza).toBeTruthy();
    });

    it('debería intercambiar piezas si el destino está ocupado', () => {
      service.moverPiezaEnTablero({ x: 0, y: 0 }, { x: 1, y: 1 });
      const enOrigen = service.listaPiezas().find(p => p.x === 0 && p.y === 0);
      const enDestino = service.listaPiezas().find(p => p.x === 1 && p.y === 1);
      expect(enOrigen).toBeTruthy();
      expect(enDestino).toBeTruthy();
    });
  });

  describe('rotarPiezaEnTablero', () => {
    beforeEach(() => {
      service.listaPiezas.set([
        { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.LASER },
      ]);
    });

    it('debería rotar 90 grados a la derecha', () => {
      service.rotarPiezaEnTablero({ x: 0, y: 0 }, 'R');
      expect(service.listaPiezas()[0].rotation).toBe(90);
    });

    it('debería rotar 90 grados a la izquierda', () => {
      service.rotarPiezaEnTablero({ x: 0, y: 0 }, 'L');
      expect(service.listaPiezas()[0].rotation).toBe(-90);
    });

    it('dos rotaciones acumulan ángulo', () => {
      service.rotarPiezaEnTablero({ x: 0, y: 0 }, 'R');
      service.rotarPiezaEnTablero({ x: 0, y: 0 }, 'R');
      expect(service.listaPiezas()[0].rotation).toBe(180);
    });
  });

  describe('eliminarPiezaEnTablero', () => {
    beforeEach(() => {
      service.listaPiezas.set([
        { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.REY },
      ]);
    });

    it('debería eliminar la pieza de la lista', () => {
      service.eliminarPiezaEnTablero({ x: 0, y: 0 });
      expect(service.listaPiezas().length).toBe(0);
    });

    it('no debería eliminar una pieza en posición incorrecta', () => {
      service.eliminarPiezaEnTablero({ x: 5, y: 5 });
      expect(service.listaPiezas().length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────
  //  Navegación por historial
  // ─────────────────────────────────────────────

  describe('avanzar / retroceder', () => {
    beforeEach(() => {
      service.inicializarTablero();
    });

    it('avanzar debería incrementar el índice', () => {
      service.avanzar();
      expect(service.indiceMovimiento).toBe(1);
    });

    it('avanzar al final debería mostrar popup y no incrementar más', () => {
      service.indiceMovimiento = service.movimientos.length - 1;
      service.avanzar();
      expect(service.popUpLimites()).toBe(true);
      expect(service.indiceMovimiento).toBe(service.movimientos.length - 1);
    });

    it('retroceder desde el inicio debería mostrar popup', () => {
      service.indiceMovimiento = 0;
      service.retroceder();
      expect(service.popUpLimites()).toBe(true);
      expect(service.indiceMovimiento).toBe(0);
    });

    it('retroceder debería decrementar el índice', () => {
      service.indiceMovimiento = 1;
      service.retroceder();
      expect(service.indiceMovimiento).toBe(0);
    });

    it('irAlPrimero debería poner el índice a 0', () => {
      service.indiceMovimiento = 2;
      service.irAlPrimero();
      expect(service.indiceMovimiento).toBe(0);
    });

    it('irAlUltimo debería poner el índice al último movimiento', () => {
      service.irAlUltimo();
      expect(service.indiceMovimiento).toBe(service.movimientos.length - 1);
    });
  });

  // ─────────────────────────────────────────────
  //  applyAction - avanzar y retroceder
  // ─────────────────────────────────────────────

  describe('applyAction', () => {
    beforeEach(() => {
      service.listaPiezas.set([
        { id: 1, x: 4, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
        { id: 2, x: 4, y: 1, rotation: 0, isBeingCaptured: false, esMia: false, tipoPieza: TipoPieza.ESCUDO },
      ]);
      service.capturas = [];
      service.esMiTurno.set(true);
    });

    it('avanzando: debería mover pieza de e1 a e2', () => {
      service.applyAction('Te1:e2%a1,b1%{300}', true);
      const pieza = service.listaPiezas().find(p => p.x === 4 && p.y === 1);
      expect(pieza).toBeTruthy();
    });

    it('retrocediendo: debería mover pieza de e2 a e1', () => {
      service.applyAction('Te1:e2%a1,b1%{300}', false);
      const pieza = service.listaPiezas().find(p => p.x === 4 && p.y === 0);
      expect(pieza).toBeTruthy();
    });

    it('avanzando: debería rotar a la derecha', () => {
      service.listaPiezas.set([
        { id: 1, x: 4, y: 2, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
      ]);
      service.applyAction('Re3%a1%{300}', true);
      expect(service.listaPiezas()[0].rotation).toBe(90);
    });

    it('retrocediendo: debería invertir la rotación derecha a izquierda', () => {
      service.listaPiezas.set([
        { id: 1, x: 4, y: 2, rotation: 90, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
      ]);
      service.applyAction('Re3%a1%{300}', false);
      expect(service.listaPiezas()[0].rotation).toBe(0);
    });

    it('avanzando con captura: debería eliminar la pieza capturada', () => {
      service.listaPiezas.set([
        { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
        { id: 2, x: 1, y: 0, rotation: 0, isBeingCaptured: false, esMia: false, tipoPieza: TipoPieza.ESCUDO },
      ]);
      service.applyAction('Ta1:b1xb1%a1,b1%{300}', true);
      expect(service.listaPiezas().find(p => p.x === 1 && p.y === 0)).toBeFalsy();
    });

    it('retrocediendo con captura: debería restaurar la pieza capturada', () => {
      service.listaPiezas.set([
        { id: 1, x: 0, y: 0, rotation: 0, isBeingCaptured: false, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
      ]);
      const piezaCapturada = { id: 2, x: 1, y: 0, rotation: 0, isBeingCaptured: false, esMia: false, tipoPieza: TipoPieza.ESCUDO };
      service.capturas = [piezaCapturada];
      service.applyAction('Ta1:b1xb1%a1,b1%{300}', false);
      expect(service.listaPiezas().find(p => p.x === 1 && p.y === 0)).toBeTruthy();
    });

    it('debería cambiar el turno tras aplicar acción', () => {
      service.esMiTurno.set(true);
      service.applyAction('Te1:e2%a1,b1%{300}', true);
      expect(service.esMiTurno()).toBe(false);
    });

    it('debería actualizar miTiempo si era mi turno', () => {
      service.esMiTurno.set(true);
      service.applyAction('Te1:e2%a1,b1%{250}', true);
      expect(service.miTiempo()).toBe(250);
    });

    it('debería actualizar tiempoRival si era turno del rival', () => {
      service.esMiTurno.set(false);
      service.applyAction('Te1:e2%a1,b1%{180}', true);
      expect(service.tiempoRival()).toBe(180);
    });
  });
});