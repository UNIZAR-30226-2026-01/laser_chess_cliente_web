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
import { GameUtils } from '../../utils/game-utils';



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
  private gameUtils = inject(GameUtils);
  
  TipoPieza = TipoPieza; 

  private state = inject(GameState);
  
  columnas = 10;
  filas = 8;
  id = this.remoteService.getAccountId();

  mostrarAvisoSalida = signal(false);
  aceptoInitial = signal(true);


  listaPiezas = this.state.listaPiezas;
  laserPath = this.state.laserPath;
  piezaActiva = this.state.piezaActiva;
  esMiTurno = this.state.esMiTurno;
  soyAzul = this.state.soyAzul;

  estadoDesconexion = this.state.estadoDesconexion;
  estadoPausa = this.state.estadoPausa;
  finPartida = this.state.finPartida;

  miTiempo = this.timerService.miTiempo;
  tiempoRival = this.timerService.tiempoRival;

  nombreRival = this.state.nombreRival;
  miNombre = this.state.miNombre;

  permitSalida = signal(false);


  
   
  
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
      const piezas = this.gameUtils.importarTablero(msg.Content);
      this.listaPiezas.set(piezas);
      this.state.cont.set(piezas.length);
      
      if (Number(msg.Extra) !== this.id) {         //Ns q es el extra pero siempre es true esto (al final no siempre es true)
        this.soyAzul.set(true);
        console.log("Soy el jugador azul");
        this.state.esMiTurno.set(false); // El jugador azul empieza segundo
      } else {
        this.soyAzul.set(false);
        console.log("Soy el jugador rojo");
        this.state.esMiTurno.set(true); // El jugador rojo empieza primero
      }
      this.timerService.startTimer();
      this.aceptoInitial.set(false);

      
    } else if ( msg.Type === "Move"){
      const clean = msg.Content.replace(';', '').replace('{', '').replace('}', '');

      const [movePart, laserRaw, timeRaw] = clean.split('%');
      

      const tiempo = Number(timeRaw);
      console.log("Justo antes de verificar patrón");
      const moveRegex = /^(T|R|L)([a-j]\d)(?::([a-j]\d))?(?:x([a-j]\d))?$/;      
      const match = movePart.match(moveRegex);

      if (!match) return;
      console.log("Después de verificar patrón");

      const tipo = match[1] || 'T';
      const desde = this.gameUtils.fromChess(match[2], this.soyAzul());
      const hasta = match[3] ? this.gameUtils.fromChess(match[3], this.soyAzul()) : null;
      const captura = match[4] ? this.gameUtils.fromChess(match[4], this.soyAzul()) : null;

      // 3. láser
      const path = laserRaw
        .split(',')
        .filter(c => c.length > 0)
        .map(c => this.gameUtils.fromChess(c, this.soyAzul()));

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
          this.timerService.miTiempo.set(tiempo);
          // El turno ya está en false (lo pusimos al enviar), no se cambia
          console.log("Movimiento propio confirmado, turno para el rival");
        } else {
          // Esto es movimiento del rival
          this.state.esMiTurno.set(true);
          this.timerService.tiempoRival.set(tiempo);
          console.log("Movimiento del rival recibido, ahora es mi turno");
        }
      

    }else if (msg.Type === "Error") {
      console.error("Error del servidor:", msg.Content);
      // Si estábamos esperando confirmación, algo salió mal
      if (this.waitingForConfirmation) {
        this.waitingForConfirmation = false;
        // Podrías recuperar el turno (depende de la política del juego)
        this.state.esMiTurno.set(true);
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
      this.state.esMiTurno.set(false);
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
      this.state.listaPiezas.set([]);
      this.state.laserPath.set([]);
      this.state.piezaActiva.set(null);

      this.state.esMiTurno.set(false);
      this.state.soyAzul.set(true);

      this.aceptoInitial.set(true);
      
      
      this.state.finPartida.set({ mostrar: false, mensaje: '' });

      this.waitingForConfirmation = false;
      this.permitSalida.set(true);
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
    const desde = this.gameUtils.fromChess(match[2], this.soyAzul());
    const hasta = match[3] ? this.gameUtils.fromChess(match[3], this.soyAzul()): null;
    const captura = match[4] ? this.gameUtils.fromChess(match[4], this.soyAzul()) : null;

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


