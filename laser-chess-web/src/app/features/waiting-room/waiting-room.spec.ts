import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoom } from './waiting-room';

describe('WaitingRoom', () => {
  let component: WaitingRoom;
  let fixture: ComponentFixture<WaitingRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingRoom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingRoom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
