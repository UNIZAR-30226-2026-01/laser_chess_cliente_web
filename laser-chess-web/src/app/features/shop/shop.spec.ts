import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shop } from './shop';
import { UserRespository } from '../../repository/user-respository';
import { of } from 'rxjs';

describe('Shop', () => {
  let component: Shop;
  let fixture: ComponentFixture<Shop>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([])
    };
    
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        { provide: UserRespository, useValue: userRepoMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
