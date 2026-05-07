import { Injectable, signal, inject} from '@angular/core';
import { UserRespository } from '../repository/user-respository';
import { Pieza } from '../shared/pieza/pieza';
import { PiezaData } from '../model/game/PiezaData';


@Injectable({
  providedIn: 'root',
})

export class GameState {
  

  startingTime = signal<number>(0);
  increment = signal<number>(0);
  nombreRival = signal<string>('');
  miNombre = signal<string>('');
  miAvatar = signal(1);
  avatarRival = signal(1);
  
  tipoPartida = signal('');

  permitSalida = signal(false);

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



