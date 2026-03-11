import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRow } from './top-row';

describe('TopRow', () => {
  let component: TopRow;
  let fixture: ComponentFixture<TopRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
