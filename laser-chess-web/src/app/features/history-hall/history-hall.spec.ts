import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryHall } from './history-hall';

describe('HistoryHall', () => {
  let component: HistoryHall;
  let fixture: ComponentFixture<HistoryHall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryHall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryHall);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
