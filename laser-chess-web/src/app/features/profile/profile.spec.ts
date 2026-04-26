import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { Profile } from './profile';
import { UserRespository } from '../../repository/user-respository';
import { FriendRespository } from '../../repository/friend-respository';
import { Remote } from '../../model/remote/remote';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {

    const activatedRouteMock = {
      paramMap: of({
        get: (key: string) => null // simulamos perfil propio (sin id en URL)
      })
    };

    const userRepoMock = {
      getOwnAccount: vi.fn().mockReturnValue(of({ id: '1', username: 'test', avatar: 'red' })),
      getXpInfo: vi.fn().mockReturnValue(of({ xp: 100, required_xp: 200 })),
      getAllRatings: vi.fn().mockReturnValue(of([])),
      getId: vi.fn().mockReturnValue(1),
      getAccount: vi.fn().mockReturnValue(of({ username: 'test' }))
    };
    
    const friendRepoMock = {
      addFriend: () => of(true)
    };

    const remoteMock = {
      getOwnAccount: () => of({
        username: 'test',
        account_id: 1
      })
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: FriendRespository, useValue: friendRepoMock },
        { provide: Remote, useValue: remoteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});