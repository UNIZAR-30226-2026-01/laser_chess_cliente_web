import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { History } from './history';
import { UserRespository } from '../../repository/user-respository';
import { TimerService } from '../../services/timer-service';
import { GameLogicService } from '../../services/game-logic-service';
import { HistoryService } from '../../services/history-service';
import { GameUtils } from '../../utils/game-utils';
import { Remote } from '../../model/remote/remote';
import { signal } from '@angular/core';

describe('History', () => {
  let component: History;
  let fixture: ComponentFixture<History>;

  beforeEach(async () => {

    const userRepoMock = {
      getOwnAccount: vi.fn().mockReturnValue(of({ id: '1', username: 'test' })),
      getXpInfo: vi.fn().mockReturnValue(of({ level: 5, currentXp: 100, neededXp: 200 })),
      getAllRatings: vi.fn().mockReturnValue(of([]))
    };

    const timerMock = {
      formatTime: vi.fn((t: number) => `${t}`)
    };

    const gameLogicMock = {
      permitSalida: true
    };

    const historyMock = {
      listaPiezas: signal([]),
      laserPath: signal([]),
      miTiempo: signal(0),
      tiempoRival: signal(0),
      nombreRival: signal(''),
      miNombre: signal(''),
      inicializarTablero: vi.fn(),
      avanzar: vi.fn(),
      retroceder: vi.fn(),
      popUpLimites: signal(false),
      popUpMensaje: signal(''),
    };

    const remoteMock = {
      getUsername: vi.fn().mockReturnValue('testUser'),
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      getAccountId: vi.fn(),
      autoLogin: vi.fn()
    };

    const gameUtilsMock = {
      isCasillaRestringida: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [History],
      providers: [
        { provide: UserRespository, useValue: userRepoMock },
        { provide: TimerService, useValue: timerMock },
        { provide: GameLogicService, useValue: gameLogicMock },
        { provide: HistoryService, useValue: historyMock },
        { provide: GameUtils, useValue: gameUtilsMock },
        { provide: Remote, useValue: remoteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(History);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});