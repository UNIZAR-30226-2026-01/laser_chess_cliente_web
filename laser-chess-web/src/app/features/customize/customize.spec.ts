import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customize } from './customize';
import { UserRespository } from '../../repository/user-respository';
import { CustomizeRepository, CustomizeItemDisplay } from '../../repository/customize-repository';
import { of } from 'rxjs';


// Datos falsos
const mockItems: CustomizeItemDisplay[] = [
  { id: 1, name: 'Tablero 1', icon: '', type: 'board_skin', isEquipped: true },
  { id: 2, name: 'Pieza 2', icon: '', type: 'piece_skin', isEquipped: true },
  { id: 3, name: 'Animación 3', icon: '', type: 'win_animation', isEquipped: true },
];



describe('Customize', () => {
  let component: Customize;
  let fixture: ComponentFixture<Customize>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({ id: '1', username: 'test' }),
      getXpInfo: () => of({ level: 5, currentXp: 100, neededXp: 200 }),
      getAllRatings: () => of([]),
      getPieceSkin: () => '0'
    };

    const customizeRepoMock = {
      getCustomizeItems: () => of(mockItems),
      equipItem: (itemId: number, itemType: string) => of({} as any)
    };


    await TestBed.configureTestingModule({
      imports: [Customize],
      providers: [
        { provide: UserRespository, useValue: userRepoMock },
        { provide: CustomizeRepository, useValue: customizeRepoMock }
      ]
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
