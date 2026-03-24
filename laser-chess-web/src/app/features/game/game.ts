import { Component, signal, OnInit, inject } from '@angular/core';
import { Pieza } from '../pieza/pieza';
import { PiezaData } from '../../model/game/PiezaData';
import { PiezaRival } from '../pieza-rival/pieza-rival';
import { Websocket } from '../../model/remote/websocket'; // Ajusta la ruta

const COL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

function toChess(x: number, y: number): string {
  return `${COL_LETTERS[x-1]}${8 - y + 1}`;
}

// Y la inversa para cuando recibas del backend
function fromChess(coord: string): {x: number, y: number} {
  const x = COL_LETTERS.indexOf(coord[0]) + 1;
  const y = 8 - parseInt(coord[1]) + 1;
  return { x, y };
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [Pieza, PiezaRival],
  templateUrl: './game.html',
  styleUrl: './game.css',
})



export class Game implements OnInit {
  // Inyectamos el servicio de Websocket
  private wsService = inject(Websocket);
  esMiTurno = signal(true);
  piezaActiva = signal<Pieza | null>(null);
  columnas = 10;
  filas = 8;

  
  // Habría que tener un listaPiezas para cada tipo de inicio y se asigna dependiendo de lo que revivamos del backend
  listaPiezas = signal<PiezaData[]>([
    { id: 1, x: 2, y: 5, rotation: 0, esMia: true },
    { id: 2, x: 2, y: 1, rotation: 0, esMia: false },
  ]);

  

  ngOnInit() {
    // 1. Conectar al abrir el juego
    this.wsService.connect('ws://localhost:8080'); // No sé que URL se usa
    // Ésto ahora da ERROR

    // 2. Escuchar al rival
    this.wsService.gameUpdates$.subscribe((msg) => {
      this.procesarAccion(msg);
    });
  }



  /*****************************************************************************/
  /*               Procesamiento de piezas de jugador principal                */
  /*****************************************************************************/

  gestionarMovimiento(destino: {x: number, y: number}) {
    if (!this.esMiTurno()) return;

    const pieza = this.piezaActiva();
    if (!pieza) return;

    const origenPos = pieza.position();
    
    // 1. Traducimos a formato backend (invirtiendo la Y)
    const origenAjedrez = toChess(origenPos.x, origenPos.y);
    const destinoAjedrez = toChess(destino.x, destino.y);

    // 2. Formamos el mensaje: "Te8:e7"
    const mensaje = `T${origenAjedrez}:${destinoAjedrez}`;
    
    console.log("Pidiendo permiso para mover:", mensaje);

    // 3. Enviamos y bloqueamos (NO movemos la pieza aún)
    this.wsService.sendAction(mensaje as any);
  }

  seleccionarPieza(pieza: Pieza) {
    if (this.esMiTurno()){
      if (this.piezaActiva()) {
        this.piezaActiva()?.showSpots.set(true);
      }
      if (this.piezaActiva() === pieza) {
        this.piezaActiva.set(null);
        pieza.showSpots.set(false);
      } else {
        this.piezaActiva.set(pieza);
        this.piezaActiva()?.showSpots.set(true);
      }
    }
  }

  

  rotateSelected(angle: number) {
    const pieza = this.piezaActiva();
    if (pieza && this.esMiTurno()) {
      const direction = angle === 90 ? 'R' : 'L';

      // Formato: La1 o Rf8
      const pos = toChess(pieza.position().x, pieza.position().y);
      const mensaje = `${direction}${pos}`;
      console.log("Pidiendo permiso para rotar" + mensaje);

      this.wsService.sendAction(mensaje as any);
      
    }
  }



  /*****************************************************************************/
  /*                  Procesamiento mensaje  del backend                       */
  /*****************************************************************************/

  private procesarAccion(msg: string) {
    const tipoAccion = msg[0];
    if (tipoAccion === 'T') {
      // "Te8:e7" -> de e8 a e7
      const partes = msg.substring(1).split(':');
      const desde = fromChess(partes[0]);
      const hasta = fromChess(partes[1]);
      console.log("desde " + partes[0] + " hasta " + partes[1]);
      this.moverPiezaEnTablero(desde, hasta);

    } else if (tipoAccion === 'L' || tipoAccion === 'R') {
      // "La1"
      const pos = fromChess(msg.substring(1));
      this.rotarPiezaEnTablero(pos, tipoAccion);
    }

    if(this.esMiTurno()){
      this.esMiTurno.set(false); // Bloqueamos turno
      this.piezaActiva()?.showSpots.set(false);
      this.piezaActiva.set(null);
      console.log("Mi turno ha acabado");

    }else{
      this.esMiTurno.set(true); // LLega acción de rival
      console.log("Mi turno ha comenzado");
    }

    // Hay que añadir la actualización del tiempo
    // Captura de piezas + laser

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

  

}