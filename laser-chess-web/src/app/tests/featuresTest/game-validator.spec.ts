import { TestBed } from '@angular/core/testing';
import { GameLogicService } from '../../services/game-logic-service';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { Router } from '@angular/router';
import { TimerService } from '../../services/timer-service';
import { GameUtils } from '../../utils/game-utils';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { NotificationService } from '../../model/notifications/notification';
import { GameState } from '../../utils/game-state';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('GameLogicService', () => {
  let service: GameLogicService;

  const wsMock = { sendAction: vi.fn() };
  const remoteMock = { getAccountId: () => 42 };
  const routerMock = { navigate: vi.fn() };
  const timerMock = {
    miTiempo: signal(300),
    tiempoRival: signal(300),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
  };
  const gameUtilsMock = {
    importarTablero: vi.fn().mockReturnValue([]),
    fromChess: (coord: string, _esAzul: boolean) => {
      const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
      const row = parseInt(coord[1]) - 1;
      return { x: col, y: row };
    },
  };
  const userRepoMock = { getAccount: vi.fn() };
  const boardStateMock = {
    laserColor: signal('red'),
    skinRival: signal(1),
  };
  const notificationMock = { showWebNotification: vi.fn() };
  const gameStateMock = {
    listaPiezas: signal<any[]>([]),
    laserPath: signal<any[]>([]),
    piezaActiva: signal<any>(null),
    esMiTurno: signal(false),
    soyAzul: signal(false),
    estadoDesconexion: signal({ mostrar: false }),
    estadoPausa: signal({ mostrar: false }),
    finPartida: signal({ mostrar: false, mensaje: '' }),
    nombreRival: signal(''),
    miNombre: signal(''),
    avatarRival: signal(1),
    cont: signal(0),
    permitSalida: signal(false),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameLogicService,
        { provide: Websocket, useValue: wsMock },
        { provide: Remote, useValue: remoteMock },
        { provide: Router, useValue: routerMock },
        { provide: TimerService, useValue: timerMock },
        { provide: GameUtils, useValue: gameUtilsMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: BoardState, useValue: boardStateMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: GameState, useValue: gameStateMock },
      ],
    });
    service = TestBed.inject(GameLogicService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─────────────────────────────────────────────
  //  Cola del láser
  // ─────────────────────────────────────────────

  describe('dispararLaser - cola', () => {
    const path1 = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    const path2 = [{ x: 2, y: 0 }, { x: 3, y: 0 }];

    it('debería mostrar el primer láser inmediatamente', () => {
      vi.useFakeTimers();
      service.dispararLaser(path1);

      expect(service.laserPath()).toEqual(path1);

      vi.advanceTimersByTime(1000);
    });

    it('debería limpiar el láser después de LASER_DURATION_MS', () => {
      vi.useFakeTimers();
      service.dispararLaser(path1);
      vi.advanceTimersByTime(1000);

      expect(service.laserPath()).toEqual([]);
    });

    it('el segundo láser espera a que termine el primero', () => {
      vi.useFakeTimers();
      service.dispararLaser(path1);
      service.dispararLaser(path2);

      expect(service.laserPath()).toEqual(path1);

      vi.advanceTimersByTime(1000);
      expect(service.laserPath()).toEqual(path2);

      vi.advanceTimersByTime(1000);
      expect(service.laserPath()).toEqual([]);
    });

    it('tres láseres se procesan en orden', () => {
      vi.useFakeTimers();
      const path3 = [{ x: 4, y: 0 }];
      service.dispararLaser(path1);
      service.dispararLaser(path2);
      service.dispararLaser(path3);

      expect(service.laserPath()).toEqual(path1);
      vi.advanceTimersByTime(1000);
      expect(service.laserPath()).toEqual(path2);
      vi.advanceTimersByTime(1000);
      expect(service.laserPath()).toEqual(path3);
      vi.advanceTimersByTime(1000);
      expect(service.laserPath()).toEqual([]);
    });

    it('el color del láser propio es azul', () => {
      vi.useFakeTimers();
      (service as any).waitingForConfirmation = true;
      service.dispararLaser(path1);

      expect(boardStateMock.laserColor()).toBe('blue');
      vi.advanceTimersByTime(1000);
    });

    it('el color del láser rival es rojo', () => {
      vi.useFakeTimers();
      (service as any).waitingForConfirmation = false;
      service.dispararLaser(path1);

      expect(boardStateMock.laserColor()).toBe('red');
      vi.advanceTimersByTime(1000);
    });
  });

  // ─────────────────────────────────────────────
  //  Movimientos en tablero
  // ─────────────────────────────────────────────

  describe('moverPiezaEnTablero', () => {
    beforeEach(() => {
      gameStateMock.listaPiezas.set([
        { x: 0, y: 0, rotation: 0, isBeingCaptured: false },
        { x: 1, y: 1, rotation: 0, isBeingCaptured: false },
      ]);
    });

    it('debería mover la pieza a la posición destino', () => {
      service.moverPiezaEnTablero({ x: 0, y: 0 }, { x: 2, y: 2 });
      const pieza = service.listaPiezas().find(p => p.x === 2 && p.y === 2);
      expect(pieza).toBeTruthy();
    });

    it('debería intercambiar piezas si el destino está ocupado', () => {
      service.moverPiezaEnTablero({ x: 0, y: 0 }, { x: 1, y: 1 });
      const piezaEnOrigen = service.listaPiezas().find(p => p.x === 0 && p.y === 0);
      const piezaEnDestino = service.listaPiezas().find(p => p.x === 1 && p.y === 1);
      expect(piezaEnOrigen).toBeTruthy();
      expect(piezaEnDestino).toBeTruthy();
    });
  });

  describe('rotarPiezaEnTablero', () => {
    beforeEach(() => {
      gameStateMock.listaPiezas.set([
        { x: 0, y: 0, rotation: 0, isBeingCaptured: false },
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
      gameStateMock.listaPiezas.set([
        { x: 0, y: 0, rotation: 0, isBeingCaptured: false },
      ]);
    });

    it('debería marcar la pieza como capturada inmediatamente', () => {
      service.eliminarPiezaEnTablero({ x: 0, y: 0 });
      expect(service.listaPiezas()[0].isBeingCaptured).toBe(true);
    });

    it('debería eliminar la pieza después de la animación', () => {
      vi.useFakeTimers();
      service.eliminarPiezaEnTablero({ x: 0, y: 0 });
      vi.advanceTimersByTime(400);
      expect(service.listaPiezas().length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  //  Cambio de turno al procesar movimientos
  // ─────────────────────────────────────────────

  describe('procesarAccion - Move', () => {
    const moveMsg = (content: string) => ({
      Type: 'Move',
      Content: content,
      Extra: '',
    });

    it('debería ser mi turno tras recibir movimiento del rival', () => {
      vi.useFakeTimers();
      gameStateMock.esMiTurno.set(false);
      (service as any).waitingForConfirmation = false;

      service.procesarAccion(moveMsg('Te8:e7%a1,b1%300'));

      expect(service.esMiTurno()).toBe(true);
      vi.advanceTimersByTime(1000);
    });

    it('no debería cambiar el turno al confirmar mi propio movimiento', () => {
      vi.useFakeTimers();
      gameStateMock.esMiTurno.set(false);
      (service as any).waitingForConfirmation = true;

      service.procesarAccion(moveMsg('Te8:e7%a1,b1%300'));

      expect(service.esMiTurno()).toBe(false);
      vi.advanceTimersByTime(1000);
    });

    it('debería actualizar miTiempo al confirmar mi movimiento', () => {
      vi.useFakeTimers();
      (service as any).waitingForConfirmation = true;
      service.procesarAccion(moveMsg('Te8:e7%a1,b1%250'));

      expect(timerMock.miTiempo()).toBe(250);
      vi.advanceTimersByTime(1000);
    });

    it('debería actualizar tiempoRival al recibir movimiento del rival', () => {
      vi.useFakeTimers();
      (service as any).waitingForConfirmation = false;
      service.procesarAccion(moveMsg('Te8:e7%a1,b1%180'));

      expect(timerMock.tiempoRival()).toBe(180);
      vi.advanceTimersByTime(1000);
    });
  });
});