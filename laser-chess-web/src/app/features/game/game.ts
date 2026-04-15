import { Component, signal, OnInit, inject} from '@angular/core';
import { Pieza } from '../../shared/pieza/pieza';
import { PiezaData } from '../../model/game/PiezaData';
import { PiezaRival } from '../../shared/pieza-rival/pieza-rival';
import { Websocket } from '../../model/remote/websocket'; // Ajusta la ruta
import { Laser } from '../../shared/laser/laser';
import { TipoPieza } from '../../model/game/TipoPieza'
import { MessageGame } from '../../model/game/MessageGame'
import { SendAction } from '../../model/game/SendAction'
import { Remote } from '../../model/remote/remote';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


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
  private wsSubscription?: Subscription;
  private waitingForConfirmation = false;
  private router = inject(Router);
  TipoPieza = TipoPieza; // Hacer visible el template para toda la componente



  esMiTurno = signal(true);
  piezaActiva = signal<Pieza | null>(null);
  laserPath = signal<{x: number, y: number}[]>([]);
  columnas = 10;
  filas = 8;
  soyAzul = signal(true);
  cont = 1; // Contado incremental para creación de piezas (id)
  id = this.remoteService.getAccountId();
  finPartida = signal<{mostrar: boolean, mensaje: string}>({ mostrar: false, mensaje: '' });
  

  
  // Habría que tener un listaPiezas para cada tipo de inicio y se asigna dependiendo de lo que revivamos del backend
  listaPiezas = signal<PiezaData[]> ([]);
  

  ngOnInit(): void {
    console.log('Suscribiéndome a WS en Game...');
    
    // Suscribimos al ReplaySubject que recibe los mensajes
    this.wsSubscription = this.wsService.gameMessages$.subscribe({
      next: (msg: MessageGame) => this.procesarAccion(msg),
      error: (err: any) => console.error('WS ERROR:', err),
      complete: () => console.log('WS COMPLETADO'),
    });
  }

  ngOnDestroy(): void {
    console.log('Destruyendo Game, limpiando suscripción');

    this.wsSubscription?.unsubscribe();
    this.wsSubscription = undefined;

    this.wsService.close();
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

  
  isCasillaRestringida(x: number, y: number): 'azul' | 'rojo' | null {
  
    // Casillas Hélice azul
    if ( x == 1 || ( x == 9 &&  ( y == 1 ||  y == 8 ))) {
      return 'azul';
    }

    // Casillas Hélice rojo
    if ( x == 10 || ( x == 2 && ( y == 1  || y == 8 ))) {
      return 'rojo';
    }

    return null;
    
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
   

    const colLetter = coord[0];
    const rowDigit = parseInt(coord[1]);
    let x: number, y: number;
    if (this.soyAzul()) {
      x = COL_LETTERS_AZUL.indexOf(colLetter) + 1;
      y = 9 - rowDigit;   // porque toChess: y_ajedrez = 9 - y_interna
    } else {
      x = COL_LETTERS_ROJO.indexOf(colLetter) + 1;
      y = rowDigit;       // para rojo, la fila de ajedrez es la misma que la interna
    }
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
    const mensaje = `T${origenAjedrez}:${destinoAjedrez}`; //He quitado la T? la he vuelto a poner?
    
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
    if (!this.esMiTurno()) return;
    const request: SendAction = { Type: "Move", Content: content}; 
    // Enviar y bloquear (NO movemos la pieza aún)
    this.wsService.sendAction(request);
    this.esMiTurno.set(false);        // Bloquear turno local
    this.waitingForConfirmation = true;
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
      if (Number(msg.Extra) !== this.id) {         //Ns q es el extra pero siempre es true esto (al final no siempre es true)
        this.soyAzul.set(true);
        this.esMiTurno.set(true);   // El azul empieza
        console.log("Soy el jugador azul");
        this.esMiTurno.set(false); // El jugador azul empieza segundo
      } else {
        this.soyAzul.set(false);
        this.esMiTurno.set(false);   // El rojo espera
        console.log("Soy el jugador rojo");
        this.esMiTurno.set(true); // El jugador rojo empieza primero
      }
      
    }else if ( msg.Type === "Move"){
      const content = msg.Content.replace(';', '');

      const [movePart, rest] = content.split('%');
      const [laserRaw, timeRaw] = rest.split('%{');

      const tiempo = parseFloat(timeRaw);
      console.log("Justo antes de verificar patrón");
      const moveRegex = /^(T|R|L)([a-j]\d)(?::([a-j]\d))?(?:x([a-j]\d))?$/;      
      const match = movePart.match(moveRegex);

      if (!match) return;
      console.log("Después de verificar patrón");

      const tipo = match[1] || 'T';
      const desde = this.fromChess(match[2]);
      const hasta = match[3] ? this.fromChess(match[3]) : null;
      const captura = match[4] ? this.fromChess(match[4]) : null;

      // 3. láser
      const path = laserRaw
        .split(',')
        .filter(c => c.length > 0)
        .map(c => this.fromChess(c));

        console.log("Tipo:", tipo, "Desde:", desde, "Hasta:", hasta, "Captura:", captura, "Tiempo:", tiempo);
        if (tipo === 'T' && desde && hasta) {
          // "Te8:e7" -> de e8 a e7
          console.log("me toca mover " + msg.Content);
          
          console.log("desde " + desde + " hasta " + hasta);
          this.moverPiezaEnTablero(desde, hasta);

        } else if ((tipo === 'L' || tipo === 'R') && desde) {
          // "La1"
          console.log("me toca girar");
          this.rotarPiezaEnTablero(desde, tipo);
        }

        // Disparo del láser
        this.dispararLaser(path);
        
        if (captura) {
          this.eliminarPiezaEnTablero(captura);
        }
        // Limpiar selección
        this.piezaActiva()?.showSpots.set(false);
        this.piezaActiva.set(null);

        // Cambio de turno
        if (this.waitingForConfirmation) {
          // Esto es confirmación de mi propio movimiento
          this.waitingForConfirmation = false;
          // El turno ya está en false (lo pusimos al enviar), no se cambia
          console.log("Movimiento propio confirmado, turno para el rival");
        } else {
          // Esto es movimiento del rival
          this.esMiTurno.set(true);
          console.log("Movimiento del rival recibido, ahora es mi turno");
        }
      

    }else if (msg.Type === "Error") {
      console.error("Error del servidor:", msg.Content);
      // Si estábamos esperando confirmación, algo salió mal
      if (this.waitingForConfirmation) {
        this.waitingForConfirmation = false;
        // Podrías recuperar el turno (depende de la política del juego)
        this.esMiTurno.set(true);
      }
    
    }else if (msg.Type === "End"){
      console.log("El juego ha terminado. Resultado:", msg.Content);
      
      if ((!this.soyAzul() && msg.Content === "P1_WINS" )|| (this.soyAzul() && msg.Content === "P2_WINS")) {
        console.log("¡Has ganado!");
        this.finPartida.set({ mostrar: true, mensaje: '¡Has ganado!' });

      }else{
        console.log("Has perdido, mejor suerte la próxima vez.");
        this.finPartida.set({ mostrar: true, mensaje: '¡Has perdido!' });
      }

    }else if (msg.Type === "EOC"){
      console.log('Fin de comunicación con el servidor');
      this.esMiTurno.set(false);
      this.wsService.close();
      this.wsSubscription?.unsubscribe();
      this.wsSubscription = undefined;
      
    }
  }

  finPartidaHandler(){
    this.finPartida.set({mostrar:false, mensaje:''})
    this.router.navigate(['/home']);
  }

  solicitarRevancha(){
    // Enviar solicitud de revancha al backend
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

  eliminarPiezaEnTablero(pos: {x: number, y: number}) {
    this.listaPiezas.update(piezas =>
      piezas.filter(p => !(p.x === pos.x && p.y === pos.y))
    );
    console.log(`Pieza eliminada en ${pos.x}, ${pos.y}`);
  }

  dispararLaser(path: {x: number, y: number}[]) {
    this.laserPath.set(path);
    // Limpiar el láser después de 2 segundos 
    setTimeout(() => this.laserPath.set([]), 3000);
  }

  ocupado(x: number, y: number): PiezaData | null {
  const pieza = this.listaPiezas().find(p => p.x === x && p.y === y);
  return pieza ?? null;
}
}

