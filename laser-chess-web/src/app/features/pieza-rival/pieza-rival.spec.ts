import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiezaRival } from './pieza-rival';

describe('PiezaRival', () => {
  let component: PiezaRival;
  let fixture: ComponentFixture<PiezaRival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiezaRival]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiezaRival);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
