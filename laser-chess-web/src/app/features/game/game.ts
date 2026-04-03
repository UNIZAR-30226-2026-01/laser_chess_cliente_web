import { Component, signal, OnInit, inject} from '@angular/core';
import { Pieza } from '../pieza/pieza';
import { PiezaData } from '../../model/game/PiezaData';
import { PiezaRival } from '../pieza-rival/pieza-rival';
import { Websocket } from '../../model/remote/websocket'; // Ajusta la ruta
import { Laser } from '../laser/laser';
import { TipoPieza } from '../../model/game/TipoPieza'
import { MessageGame } from '../../model/game/MessageGame'
import { SendAction } from '../../model/game/SendAction'
import { Remote } from '../../model/remote/remote';
import { GameMessageType } from "../../model/game/GameMessageType";


const COL_LETTERS_AZUL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const COL_LETTERS_ROJO = ['j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [Pieza, PiezaRival, Laser],
  templateUrl: './game.html',
  styleUrl: './game.css',
})





export class Game implements OnInit {
  // Inyectamos el servicio de Websocket
  private wsService = inject(Websocket);
  private remoteService = inject(Remote);

  esMiTurno = signal(true);
  piezaActiva = signal<Pieza | null>(null);
  laserPath = signal<{x: number, y: number}[]>([]);
  columnas = 10;
  filas = 8;
  soyAzul = signal(true);
  cont = 1; // Contado incremental para creación de piezas (id)
  id = this.remoteService.getAccountId();
  

  
  // Habría que tener un listaPiezas para cada tipo de inicio y se asigna dependiendo de lo que revivamos del backend
  listaPiezas = signal<PiezaData[]> ([]);
  /*([
    { id: 1, x: 1, y: 1, rotation: 0, esMia: true, tipoPieza: TipoPieza.LASER },
    { id: 2, x: 6, y: 1, rotation: 0, esMia: true, tipoPieza: TipoPieza.REY },
    { id: 3, x: 1, y: 4, rotation: 0, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 4, x: 1, y: 5, rotation: 90, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 5, x: 3, y: 2, rotation: -180, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 6, x: 8, y: 1, rotation: 90, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 7, x: 8, y: 4, rotation: 90, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 8, x: 8, y: 5, rotation: 0, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 9, x: 7, y: 6, rotation: 90, esMia: true, tipoPieza: TipoPieza.DEFLECTOR },
    { id: 10, x: 5, y: 4, rotation: 0, esMia: true, tipoPieza: TipoPieza.SWITCH },
    { id: 11, x: 6, y: 4, rotation: 90, esMia: true, tipoPieza: TipoPieza.SWITCH },
    { id: 12, x: 5, y: 1, rotation: 0, esMia: true, tipoPieza: TipoPieza.ESCUDO },
    { id: 13, x: 7, y: 1, rotation: 0, esMia: true, tipoPieza: TipoPieza.ESCUDO },

    { id: 14, x: 10, y: 8, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.LASER },
    { id: 25, x: 5, y: 8, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.REY },
    { id: 16, x: 10, y: 4, rotation: -90, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 17, x: 10, y: 5, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 18, x: 8, y: 7, rotation: 0, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 19, x: 3, y: 8, rotation: -90, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 20, x: 3, y: 4, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 21, x: 3, y: 5, rotation: -90, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 22, x: 4, y: 3, rotation: -90, esMia: !this.soyAzul(), tipoPieza: TipoPieza.DEFLECTOR },
    { id: 23, x: 5, y: 5, rotation: -90, esMia: !this.soyAzul(), tipoPieza: TipoPieza.SWITCH },
    { id: 24, x: 6, y: 5, rotation: 0, esMia: !this.soyAzul(), tipoPieza: TipoPieza.SWITCH },
    { id: 25, x: 4, y: 8, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.ESCUDO },
    { id: 26, x: 6, y: 8, rotation: 180, esMia: !this.soyAzul(), tipoPieza: TipoPieza.ESCUDO },
  ]);
  */

  

  ngOnInit(): void {
  console.log('Suscribiéndome a WS en Game...');
  this.wsService.gameMessages$.subscribe({
    next: (msg) => {
      console.log('Mensaje recibido en Game:', msg);
      this.procesarAccion(msg);
    },
    error: (err) => console.error('Error WS en Game:', err)
  });
}

  /*
   Actualiza el tablero de juego añadiendo la pieza (parseo de pieza)
    @param codigo: string -> contenido de la pieza
    @param x: number -> coordenada x de la pieza
    @param y: number -> coordenada y de la pieza
   */
  parsearPiezaCompacta(codigo: string, x: number, y: number) {
    if (codigo === '') return; // Si la celda está vacía pasamos a la siguiente
    const [tipoLetra, colorLetra, direccionLetra] = codigo.split('');
    // codigo[0] , codigo[1], codigo[2]

    // 1. Mapeo de Tipo
    const tipos: Record<string, TipoPieza> = {
      'L': TipoPieza.LASER,
      'K': TipoPieza.REY,
      'D': TipoPieza.DEFLECTOR,
      'S': TipoPieza.SWITCH,
      'E': TipoPieza.ESCUDO
    };

    // 2. Mapeo de rotación -> revisar fichero de notación
    const rotaciones: Record<string, number> = {
      'U': 0,    // Up
      'R': 90,   // Right
      'D': 180,  // Down
      'L': 270   // Left
    };

    const nuevaPieza: PiezaData = {
      id: this.cont,
      x: x,
      y: y,
      tipoPieza: tipos[tipoLetra],
      rotation: rotaciones[direccionLetra],

      // Comparamos el color del código con nuestro color actual
      esMia: colorLetra === 'A',
    };

    this.cont ++; // Incrementamos el valor de los id de pieza
    // Añadir al signal
    this.listaPiezas.update(actuales => [...actuales, nuevaPieza]);
  }


/*
  @param board: representación del tablero inicial
*/
importarTablero(board: string) { 
  this.listaPiezas.set([]); // Limpiamos antes de empezar
  this.cont = 1;

  // 1. Separar por filas (el \n del servidor)
  const filasTablero = board.split('\n');
    
  for (let j = 0; j < filasTablero.length; j++) {
    // 2. Separar cada fila por comas
    const piezas = filasTablero[j].split(',');
      
    for (let i = 0; i < piezas.length; i++) {
      const codigoPieza = piezas[i].trim();
        
      if (codigoPieza !== '') {
          // IMPORTANTE: 
          // i + 1 es la columna (X)
          // j + 1 es la fila (Y)
        console.log("Añadiendo pieza " + codigoPieza + " en posición " + i + " " + j);

        this.parsearPiezaCompacta(codigoPieza, i + 1, j + 1);
      }
    }
  }
}
  
  // Hay que revisarlo
toChess(x: number, y: number): string {
  if (this.soyAzul()){
      return `${COL_LETTERS_AZUL[x-1]}${8 - y + 1}`;
  }else{
      return `${COL_LETTERS_ROJO[x-1]}${y}`;
  }
  
}

// Y la inversa para cuando recibas del backend -> hay que revisarlo
fromChess(coord: string): {x: number, y: number} {
  console.log("estoy traduciendo");
  let x : number;
  let y : number;
  if (this.soyAzul()){
    x = COL_LETTERS_AZUL.indexOf(coord[0]) + 1;
    y = 8 - parseInt(coord[1]) + 1;
  }else{
    x = COL_LETTERS_ROJO.indexOf(coord[0]) + 1;
    y = parseInt(coord[1]);
  }
  console.log("he traducido a esto" + y + x);
  return { x, y };
}



  /*****************************************************************************/
  /*               Procesamiento de piezas de jugador principal                */
  /*****************************************************************************/
  
  seleccionarPieza(pieza: Pieza) {
  if (!this.esMiTurno()) return;
    const anterior = this.piezaActiva();

    // Si seleccionas la misma pieza, la deseleccionamos
    if (anterior === pieza) {
      pieza.showSpots.set(false);
      this.piezaActiva.set(null);
      return;
    }

    // Si había otra pieza activa, apagar sus spots
    if (anterior) {
      anterior.showSpots.set(false);
    }

    // Activamos la nueva pieza y mostramos sus spots
    this.piezaActiva.set(pieza);
    pieza.showSpots.set(true);
  }

  gestionarMovimiento(destino: {x: number, y: number}) {
    if (!this.esMiTurno()) return;

    const pieza = this.piezaActiva();
    if (!pieza) return;

    const origenPos = pieza.position();
    
    // 1. Traducimos a formato backend (invirtiendo la Y)
    const origenAjedrez = this.toChess(origenPos.x, origenPos.y);
    const destinoAjedrez = this.toChess(destino.x, destino.y);

    // 2. Formamos el mensaje: "Te8:e7"
    const mensaje = `T${origenAjedrez}:${destinoAjedrez}`;
    
    console.log("Pidiendo permiso para mover:", mensaje);

    this.sendMovement(mensaje);
  }

  rotateSelected(angle: number) {
    const pieza = this.piezaActiva();
    if (pieza && this.esMiTurno()) {
      const direction = angle === 90 ? 'R' : 'L';

      // Formato: La1 o Rf8
      const pos = this.toChess(pieza.position().x, pieza.position().y);
      const mensaje = `${direction}${pos}`;
      console.log("Pidiendo permiso para rotar" + mensaje);

      this.sendMovement(mensaje);
      
    }
  }

  sendMovement(content:string){
    const request: SendAction = {
          Type: "Move",
          Content: content
    };

    // 3. Enviamos y bloqueamos (NO movemos la pieza aún)
    this.wsService.sendAction(request as any);
  }

  /*****************************************************************************/
  /*                  Procesamiento mensaje  del backend                       */
  /*****************************************************************************/

  private procesarAccion(msg: MessageGame) {
    console.log("Tipo:", msg.Type);
    console.log("Contenido:", msg.Content);

    if (msg.Type === "InitialState"){
      console.log("Procesando el estado inicial");
      this.importarTablero(msg.Content);
      if (Number(msg.Extra) !== this.id) {
        this.soyAzul.set(true);
        console.log("Soy el jugador azul");
      } else {
        this.soyAzul.set(false);
        console.log("Soy el jugador rojo");
      }
      
    }else if ( msg.Type === "Move"){
      console.log("me dicen que me mueva");
      const tipoAccion= msg.Content[0];
      if (tipoAccion === 'T') {
        // "Te8:e7" -> de e8 a e7
        console.log("me toca mover " + msg.Content);
        const partes = msg.Content.substring(1).split(':');
        const desde = this.fromChess(partes[0]);
        const hasta = this.fromChess(partes[1]);
        console.log("desde " + desde + " hasta " + hasta);
        this.moverPiezaEnTablero(desde, hasta);

      } else if (tipoAccion === 'L' || tipoAccion === 'R') {
        // "La1"
        console.log("me toca girar");
        const pos = this.fromChess(msg.Content.substring(1));
        this.rotarPiezaEnTablero(pos, tipoAccion);
      }

      // Disparo del láser
      const coordsRaw = msg.Extra.substring(0).split(',');
      const path = coordsRaw.map(c => this.fromChess(c));
      this.dispararLaser(path);
      
      // Cambio de turno
      if(this.esMiTurno()) {
        this.esMiTurno.set(false); // Bloqueamos turno
        this.piezaActiva()?.showSpots.set(false);
        this.piezaActiva.set(null);
        console.log("Mi turno ha acabado");

      } else {
        this.esMiTurno.set(true); // LLega acción de rival
        console.log("Mi turno ha comenzado");
      }

    }

    

    // Hay que añadir la actualización del tiempo + captura
    console.log("No entiendo que mensaje me pasan: " + msg.Type);

  }


  /*****************************************************************************/
  /*                     Tras confirmación del backend                         */
  /*****************************************************************************/

  // Mueve la pieza al recibir confimariones del backend
  moverPiezaEnTablero(desde: {x: number, y: number}, hasta: {x: number, y: number}) {
    
    this.listaPiezas.update(piezas => 
      piezas.map(p => {
        // Buscamos la pieza que coincide con la coordenada 'desde'
        console.log("intentando mover desde "+ p.x + " " + p.y + " partiendo de " + desde.x + " " + desde.y );
        if (p.x === desde.x && p.y === desde.y) {
          console.log("Moviendo pieza");
          return { ...p, x: hasta.x, y: hasta.y };
        }

        // Caso de permutaciones de piezas
        if (p.x === hasta.x && p.y === hasta.y) {
        console.log("Intercambiando pieza de destino a origen");
        return { ...p, x: desde.x, y: desde.y };
        }
        return p;
      })
    );
  }

  // Rotar piezas al recibir confirmaciones del backend
  rotarPiezaEnTablero(pos: {x: number, y: number}, direccion: 'L' | 'R') {
    this.listaPiezas.update(piezas => 
      piezas.map(p => {
        if (p.x === pos.x && p.y === pos.y) {
          const angulo = (direccion === 'R') ? 90 : -90; 
          return { ...p, rotation: (p.rotation + angulo) };
        }
        return p;
      })
    );
  }

  dispararLaser(path: {x: number, y: number}[]) {
    this.laserPath.set(path);
    // Limpiar el láser después de 2 segundos 
    setTimeout(() => this.laserPath.set([]), 3000);
  }

  

}

