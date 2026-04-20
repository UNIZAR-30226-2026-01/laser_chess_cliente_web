import { Injectable } from '@angular/core';
import { Component, signal, OnInit, inject, Input} from '@angular/core';
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
import { GameState } from '../../model/remote/game-state'
import { NotificationGame } from '../../shared/notification-game/notification-game'
import { Board } from '../../shared/board/board';
import { TimerService } from '../../model/remote/timer-service';



const COL_LETTERS_AZUL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const COL_LETTERS_ROJO = ['j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

@Injectable({
  providedIn: 'root',
})
export class GameLogicService {
  private wsService = inject(Websocket);
  private remoteService = inject(Remote);
  private timerService = inject(TimerService);
  private wsSubscription?: Subscription;
  private waitingForConfirmation = false;
  private router = inject(Router);
  TipoPieza = TipoPieza; // Hacer visible el template para toda la componente

  private state = inject(GameState);
  
  



  esMiTurno = signal(true);
  piezaActiva = signal<Pieza | null>(null);
  laserPath = signal<{x: number, y: number}[]>([]);
  columnas = 10;
  filas = 8;
  soyAzul = signal(true);
  id = this.remoteService.getAccountId();
  finPartida = signal<{mostrar: boolean, mensaje: string}>({ mostrar: false, mensaje: '' });

  miTiempo = this.timerService.miTiempo;
  tiempoRival = this.timerService.tiempoRival;

  miNombre = signal<string>('Yo');
  nombreRival = signal<string>('Rival');

  //private timerInterval: any = null;
  

  
  // Habría que tener un listaPiezas para cada tipo de inicio y se asigna dependiendo de lo que revivamos del backend
  listaPiezas = signal<PiezaData[]> ([]);

  // Estados para controlar las notificaciones
  estadoDesconexion = signal<{ mostrar: boolean }>({ mostrar: false });
  estadoPausa = signal<{ mostrar: boolean }>({ mostrar: false });

  mostrarAvisoSalida = signal(false);
  aceptoInitial = signal(true);
  

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
        id: this.state.cont(),
        x: x,
        y: y,
        tipoPieza: tipos[tipoLetra],
        rotation: rotaciones[direccionLetra],
  
        // Comparamos el color del código con nuestro color actual
        esMia: colorLetra === 'A',
      };
  
      this.state.cont.set(this.state.cont() + 1); // Incrementamos el valor de los id de pieza
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
      this.state.cont.set(1);

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
  
  
  sendMovement(content:string){
    if (!this.esMiTurno()) return;
    const request: SendAction = { Type: "Move", Content: content}; 
    // Enviar y bloqueaconst timer = timerMatch ? +timerMatch[1] : null;r (NO movemos la pieza aún)
    this.wsService.sendAction(request);
    this.esMiTurno.set(false);        // Bloquear turno local
    this.waitingForConfirmation = true;
  }

  solicitarPausa(){
    const request: SendAction = { Type: "Pause", Content: ""}; 
    this.wsService.sendAction(request);
  }

  /*****************************************************************************/
  /*                  Procesamiento mensaje  del backend                       */
  /*****************************************************************************/

  procesarAccion(msg: MessageGame) {
    console.log("Tipo:", msg.Type);
    console.log("Contenido:", msg.Content);

    if (msg.Type === "MatchStart"){
      console.log("Tu oponenete es " + msg.Content);

    } else if (msg.Type === "InitialState" && this.aceptoInitial()){
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
      this.timerService.startTimer();
      this.aceptoInitial.set(false);

      
    } else if ( msg.Type === "Move"){
      const clean = msg.Content.replace(';', '').replace('{', '').replace('}', '');

      const [movePart, laserRaw, timeRaw] = clean.split('%');
      

      const tiempo = Number(timeRaw);
      console.log(timeRaw);
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
          this.miTiempo.set(tiempo);
          // El turno ya está en false (lo pusimos al enviar), no se cambia
          console.log("Movimiento propio confirmado, turno para el rival");
        } else {
          // Esto es movimiento del rival
          this.esMiTurno.set(true);
          this.tiempoRival.set(tiempo);
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
      this.timerService.stopTimer();

    }else if (msg.Type === "EOC"){
      console.log('Fin de comunicación con el servidor');
      this.esMiTurno.set(false);
      this.wsService.close();
      this.wsSubscription?.unsubscribe();
      this.wsSubscription = undefined;
      this.timerService.stopTimer();
      
    }else if (msg.Type === "Disconnection"){
      // El oponenete se ha desconectado
      // this.stopTimer();
      this.estadoDesconexion.set({ mostrar: true });

      // Pop up de espera a que se reconecte el oponenete con opción de salir (abandonar reto)

    }else if (msg.Type === "Reconnection"){
      // El oponenete se ha reconectado
      // this.startTimer()
      this.estadoDesconexion.set({ mostrar: false });

      // Se oculta el pop-up de espera a reconexión
    }else if (msg.Type === "PauseRequest"){
      // El oponenete  pide pausar la partida
      // this.stopTimer();
      this.estadoPausa.set({ mostrar: true });
      
      // Pop up que pregunta si queremos pausar también (aceptar request)
      

    }else if (msg.Type === "Pause"){
      
      // La partida se ha pausado 
      // Cierre del websocket + retorno a home ??
      this.timerService.stopTimer();

    }else if (msg.Type === "State"){

      console.log("Reaplicando log sobre estado existente");

      const log = msg.Content;

      const events = this.parseGameLog(log);

      for (const ev of events) {
        this.applyAction(ev.action);
      }

      // limpieza visual por seguridad
      this.laserPath.set([]);
      this.piezaActiva.set(null);
    }
    
  }

  /*****************************************************************************/
  /*                     Popups de reconexión y pausa                          */
  /*****************************************************************************/
  // Handlers para el Toast de Desconexión
  cerrarToast() {
    this.estadoDesconexion.set({ mostrar: false });
  }

  // Handlers para el Toast de Pausa
  logicAceptarPausa() {
    console.log("Aceptando pausa...");
    const request: SendAction = { Type: "Pause", Content: "" }; 
    this.wsService.sendAction(request);
    this.estadoPausa.set({ mostrar: false });
  }

  logicRechazarPausa() {
    console.log("Rechazando pausa...");
    // const request: SendAction = { Type: "Pause", Content: "REJECT" }; 
    // this.wsService.sendAction(request);
    this.estadoPausa.set({ mostrar: false });
    // this.startTimer(); 
  }

  cerrarToastPausa() {
    this.estadoPausa.set({ mostrar: false });
  }

    finPartidaHandler(){
      this.finPartida.set({mostrar:true, mensaje:''})
      this.router.navigate(['/home']);
    }

    solicitarRevancha(){
      // Enviar solicitud de revancha al backend
    }

  /*****************************************************************************/
  /*               Gestión y parseo de log tras reconexión                     */
  /*****************************************************************************/

  parseGameLog(log: string) {
    console.log("Estoy procesando el log");
    return log
      .split(';')
      .filter(e => e.trim().length > 0)
      .map(ev => this.parseEvent(ev));
  }

  parseEvent(ev: string) {
    console.log("Muevo cositas");
    const [actionPart, , timerPart] = ev.split('%');

    const timerMatch = timerPart?.match(/\{(\d+)\}/);
    const timer = Number(timerMatch?.[1]);
    
    if (this.esMiTurno()){
      this.esMiTurno.set(false);
      this.miTiempo.set(timer);
      
    }else{
      this.esMiTurno.set(true);
      this.tiempoRival.set(timer);
    }
    return {
      action: actionPart.trim(),
      timer
    };
  }

  

  applyAction(action: string) {

    const moveRegex = /^(T|R|L)([a-j]\d)(?::([a-j]\d))?(?:x([a-j]\d))?$/;
    const match = action.match(moveRegex);

    if (!match) return;

    const tipo = match[1];
    const desde = this.fromChess(match[2]);
    const hasta = match[3] ? this.fromChess(match[3]) : null;
    const captura = match[4] ? this.fromChess(match[4]) : null;

    // MOVE
    if (tipo === 'T' && desde && hasta) {
      this.moverPiezaEnTablero(desde, hasta);
    }

    // ROTATE
    if (tipo === 'R' || tipo === 'L') {
      this.rotarPiezaEnTablero(desde, tipo as 'R' | 'L');
    }

    // CAPTURA
    if (captura) {
      this.eliminarPiezaEnTablero(captura);
    }
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


