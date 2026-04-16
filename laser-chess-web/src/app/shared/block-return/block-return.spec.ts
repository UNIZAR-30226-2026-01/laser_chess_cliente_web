import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockReturn } from './block-return';

describe('BlockReturn', () => {
  let component: BlockReturn;
  let fixture: ComponentFixture<BlockReturn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockReturn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockReturn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
