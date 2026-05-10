import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { HistoryHall } from './history-hall';
import { GameRepository } from '../../repository/game-repository';
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { GameState } from '../../utils/game-state';
import { Websocket } from '../../model/remote/websocket';
import { TimerService } from '../../services/timer-service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = (v: any) => { value = v; };
  return fn;
};

describe('HistoryHall', () => {
  let component: HistoryHall;
  let fixture: ComponentFixture<HistoryHall>;

  beforeEach(async () => {
    const gameRepoMock = {
      getFinishedGame: vi.fn().mockReturnValue(of([]))
    };

    const historyServiceMock = {
      historySelectedGame: fakeSignal(null),
      perfilRival: fakeSignal(null),
    };

    const userRepoMock = {
      getOwnAccount: vi.fn().mockReturnValue(of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      })),
      getXpInfo: vi.fn().mockReturnValue(of({ xp: 100, required_xp: 200 })),
      getAccount: vi.fn().mockReturnValue(of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
      })),
      getId: vi.fn().mockReturnValue('1'),
      getUsername: vi.fn().mockReturnValue('test'),
    };

    await TestBed.configureTestingModule({
      imports: [HistoryHall],
      providers: [
        provideRouter([]),
        { provide: GameRepository, useValue: gameRepoMock },
        { provide: HistoryService, useValue: historyServiceMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: BoardState, useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0) } },
        {
          provide: GameState,
          useValue: {
            startingTime: fakeSignal(0),
            increment: fakeSignal(0),
            nombreRival: fakeSignal(''),
            miNombre: fakeSignal(''),
          }
        },
        {
          provide: Websocket,
          useValue: {
            initConnection: vi.fn(),
            close: vi.fn(),
            connectionClosed$: of(null),
            connectionError$: of(null),
          }
        },
        {
          provide: TimerService,
          useValue: {
            miTiempo: fakeSignal(0),
            tiempoRival: fakeSignal(0),
          }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryHall);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});