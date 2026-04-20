import { Injectable, signal, inject} from '@angular/core';
import { UserRespository } from '../../repository/user-respository';
import { Pieza } from '../../shared/pieza/pieza';
import { PiezaData } from '../game/PiezaData';


@Injectable({
  providedIn: 'root',
})

export class GameState {
  private remote = inject(UserRespository);

  startingTime = signal<number>(0);
  increment = signal<number>(0);
  rivalName = signal<string>(this.remote.getUsername() ?? '');
  myName = signal<string>('');

  

  listaPiezas = signal<PiezaData[]>([]);
  esMiTurno = signal(true);
  soyAzul = signal(true);
  cont = signal(1); // Contador incremental para creación de piezas (id)

  laserPath = signal<{x:number,y:number}[]>([]);
  piezaActiva = signal<Pieza | null>(null);

  estadoDesconexion = signal({ mostrar: false });
  estadoPausa = signal({ mostrar: false });

  finPartida = signal({ mostrar: false, mensaje: '' });

}



