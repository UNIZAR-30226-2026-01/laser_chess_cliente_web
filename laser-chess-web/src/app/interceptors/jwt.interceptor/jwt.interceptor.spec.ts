import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let component: JwtInterceptor;
  let fixture: ComponentFixture<JwtInterceptor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JwtInterceptor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JwtInterceptor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
