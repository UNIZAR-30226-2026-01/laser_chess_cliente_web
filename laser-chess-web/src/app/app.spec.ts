import { TestBed } from '@angular/core/testing';
import { App } from './app';

// Pruebas automáticas para verificar que la app funciona correctamente
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  
});
