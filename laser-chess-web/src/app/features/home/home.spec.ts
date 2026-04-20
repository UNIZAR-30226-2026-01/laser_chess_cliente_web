import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({
        account_id: '1',
        username: 'testUser',
        level: 1,
        avatar: 0
      }),
      getXpInfo: () => of({
        xp: 50,
        required_xp: 100
      }),
      getUsername: () => 'testUser'
    };

    const iconServiceMock = {
      getAvatarColor: () => 'blue'
    };
    
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({})
          }
        },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: IconService, useValue: iconServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
