import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customize } from './customize';

describe('Customize', () => {
  let component: Customize;
  let fixture: ComponentFixture<Customize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customize]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customize);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
