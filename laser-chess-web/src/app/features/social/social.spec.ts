import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Social } from './social';
import { FriendRespository } from '../../repository/friend-respository';
import { UserRespository } from '../../repository/user-respository';
import { Remote } from '../../model/remote/remote';
import { IconService } from '../../model/user/icon';

describe('Social', () => {
  let component: Social;
  let fixture: ComponentFixture<Social>;

  beforeEach(async () => {
    const friendRepoMock = {
      getFriends: () => of([]),
      getRequestFriends: () => of([]),
      getSentRequests: () => of([]),
      addFriend: () => of(true),
      deleteFriend: () => of(true),
      acceptRequest: () => of(true),
      getAllRatings: () => of({
        blitz: 1200,
        rapid: 1300,
        classic: 1400,
        extended: 1500
      })
    };

    const userRepoMock = {
      getOwnAccount: () => of({
        account_id: '1',
        username: 'test',
        level: 1,
        avatar: 0
      }),
      getXpInfo: () => of({
        xp: 50,
        required_xp: 100
      }),
      getUsername: () => 'testUser',
      getId: () => '123'
    };

    const remoteMock = {
      getUsername: () => 'testUser',
      getAccountId: () => '123'
    };

    const iconServiceMock = {
      getAvatarColor: () => 'blue'
    };

    await TestBed.configureTestingModule({
      imports: [Social],
      providers: [
        { provide: FriendRespository, useValue: friendRepoMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: Remote, useValue: remoteMock },
        { provide: IconService, useValue: iconServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Social);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});