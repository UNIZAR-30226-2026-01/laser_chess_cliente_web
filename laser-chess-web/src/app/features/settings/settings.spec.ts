import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from './settings';
import { UserRespository } from '../../repository/user-respository';
import { of } from 'rxjs';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([])
    };
    
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        { provide: UserRespository, useValue: userRepoMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
