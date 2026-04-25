import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRow } from './top-row';
import { UserRespository } from '../../repository/user-respository';
import { of } from 'rxjs';


describe('TopRow', () => {
  let component: TopRow;
  let fixture: ComponentFixture<TopRow>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([])
    };
    
    await TestBed.configureTestingModule({
      imports: [TopRow],
      providers: [
        { provide: UserRespository, useValue: userRepoMock }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(TopRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
