import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GameRepository } from '../../repository/game-repository';
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';

import { HistoryHall } from './history-hall';

describe('HistoryHall', () => {
  let component: HistoryHall;
  let fixture: ComponentFixture<HistoryHall>;

  const gameRepoMock = {
    getFinishedGame: vi.fn().mockReturnValue(of([]))
  };

  const historyServiceMock = {
    historySelectedGame: {
      set: vi.fn()
    }
  };

  const routerMock = {
    navigate: vi.fn()
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryHall],
      providers: [
        { provide: GameRepository, useValue: gameRepoMock },
        { provide: HistoryService, useValue: historyServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryHall);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
