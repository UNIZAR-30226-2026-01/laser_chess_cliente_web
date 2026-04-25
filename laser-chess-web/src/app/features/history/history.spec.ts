import { ComponentFixture, TestBed } from '@angular/core/testing';

import { History } from './history';
import { UserRespository } from '../../repository/user-respository';
import { of } from 'rxjs';

describe('History', () => {
  let component: History;
  let fixture: ComponentFixture<History>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [History],
      providers: [
        { provide: UserRespository, useValue: userRepoMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(History);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
