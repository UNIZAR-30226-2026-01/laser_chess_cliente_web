import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationGame } from './notification-game';

describe('NotificationGame', () => {
  let component: NotificationGame;
  let fixture: ComponentFixture<NotificationGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
