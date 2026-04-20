import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customize } from './customize';
import { UserRespository } from '../../repository/user-respository';
import { of } from 'rxjs';

describe('Customize', () => {
  let component: Customize;
  let fixture: ComponentFixture<Customize>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([])
    };
    
    await TestBed.configureTestingModule({
      imports: [Customize],
      providers: [
        { provide: UserRespository, useValue: userRepoMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customize);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
