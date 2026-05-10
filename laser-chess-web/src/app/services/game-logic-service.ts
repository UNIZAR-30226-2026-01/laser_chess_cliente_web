import { Injectable } from '@angular/core';
import {  signal, inject} from '@angular/core';
import { PiezaData } from '../model/game/PiezaData';
import { Websocket } from '../model/remote/websocket';
import { TipoPieza } from '../model/game/TipoPieza'
import { MessageGame } from '../model/game/MessageGame'
import { SendAction } from '../model/game/SendAction'
import { Remote } from '../model/remote/remote';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameState } from '../utils/game-state'
import { TimerService } from './timer-service';
import { GameUtils } from '../utils/game-utils';
import { UserRespository } from '../repository/user-respository';
import { BoardState } from '../utils/board-state';
import { ChallengeManager } from './challenge-manager';
import { BoardAction } from './board-action';


const LASER_DURATION_MS = 1000;

@Injectable({
  providedIn: 'root',
})
export class GameLogicService {
  
  private wsService = inject(Websocket);
  private remoteService = inject(Remote);
  private timerService = inject(TimerService);
  private wsSubscription?: Subscription;
  private waitingForConfirmation= signal(false);
  private router = inject(Router);
  private gameUtils = inject(GameUtils);
  private userRepo = inject(UserRespository);
  private boardState = inject(BoardState);
  private challengeManager = inject(ChallengeManager);
  private boardActions = inject(BoardAction);

  
  TipoPieza = TipoPieza; 

  private state = inject(GameState);
  
  columnas = 10;
  filas = 8;
  

  mostrarAvisoSalida = signal(false);


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
  img_final = signal("");


  
   
  
  sendMovement(content:string){
    if (!this.esMiTurno()) return;
    const request: SendAction = { Type: "Move", Content: content}; 
    this.wsService.sendAction(request);
    this.state.esMiTurno.set(false);        
    this.timerService.stopTimer();
    this.waitingForConfirmation.set(true);
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
      console.log("Tu oponenete es " + Number(msg.Content));
      if(Number(msg.Content) != 1){ // Excluimos el caso de la IA
        this.challengeManager.setupOponent(Number(msg.Content), null);
        localStorage.setItem('idOponente', msg.Content);
        this.challengeManager.setUpUser();
      }


    } else if (msg.Type === "InitialState"){
      const idIponente = localStorage.getItem('idOponente');
      console.log(idIponente);
      if (idIponente) {
        console.log("Mi oponentes tras reconexión es " + JSON.parse(idIponente));
        this.challengeManager.setupOponent(Number(JSON.parse(idIponente)), null);
      }
      this.challengeManager.setUpUser();

      console.log("Procesando el estado inicial");
      const piezas = this.gameUtils.importarTablero(msg.Content);
      this.listaPiezas.set(piezas);
      this.state.cont.set(piezas.length);
      const id = this.remoteService.getAccountId();
      
      if (Number(msg.Extra) !== id) {        
        this.soyAzul.set(true);
        console.log("Soy el jugador azul");
        this.state.esMiTurno.set(false); // El jugador azul empieza segundo
      } else {
        this.soyAzul.set(false);
        console.log("Soy el jugador rojo");
        this.state.esMiTurno.set(true); // El jugador rojo empieza primero
      }
      this.timerService.startTimer();


      const pendingState = localStorage.getItem('pendingState');
      if (pendingState) {
        this.wsService.gameMessages$.next(JSON.parse(pendingState));
        localStorage.removeItem('pendingState');
      }

      
    } else if ( msg.Type === "Move"){
      const clean = msg.Content.replace(';', '').replace('{', '').replace('}', '');

      const [movePart, laserRaw, timeRaw] = clean.split('%');
      

      const tiempo = Number(timeRaw);
      const moveRegex = /^(T|R|L)([a-j]\d)(?::([a-j]\d))?(?:x([a-j]\d))?$/;      
      const match = movePart.match(moveRegex);

      if (!match) return;

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
          this.moverPiezaEnTablero(desde, hasta);

        } else if ((tipo === 'L' || tipo === 'R') && desde) {
          // "La1"
          this.rotarPiezaEnTablero(desde, tipo);
        }

        const esMiMovimiento = this.waitingForConfirmation();
        if (esMiMovimiento) {
          this.waitingForConfirmation.set(false);
        }

        this.dispararLaser(path, esMiMovimiento);
        
        
        if (captura) {
          this.eliminarPiezaEnTablero(captura);
        }
        // Limpiar selección
        this.piezaActiva()?.showSpots.set(false);
        this.piezaActiva.set(null);

        

        setTimeout(() => {
          if (esMiMovimiento) {
            this.timerService.miTiempo.set(tiempo);
          } else {
            this.state.esMiTurno.set(true);
            this.timerService.tiempoRival.set(tiempo);
          }
          if (!this.finPartida().mostrar) {
            this.timerService.startTimer();
          }
        }, LASER_DURATION_MS);

    }else if (msg.Type === "Error") {
      console.error("Error del servidor:", msg.Content);
      if (this.waitingForConfirmation()) {
        this.waitingForConfirmation.set(false);
        this.state.esMiTurno.set(true);
        this.timerService.stopTimer(); // paro por tiempo de laser
      }
    
    }else if (msg.Type === "End"){
      console.log("El juego ha terminado. Resultado:", msg.Content);
      
      if ((!this.soyAzul() && msg.Content === "P1_WINS" )|| (this.soyAzul() && msg.Content === "P2_WINS")) {
        console.log("¡Has ganado!");
        this.img_final.set(this.boardState.winAnimationUrl());
        this.finPartida.set({ mostrar: false, mensaje: '¡Has ganado!'});

      }else{
        console.log("Has perdido, mejor suerte la próxima vez.");
        this.img_final.set(this.boardState.looseAnimationUrl());
        this.finPartida.set({ mostrar: false, mensaje: '¡Has perdido!'});
      }
      this.timerService.stopTimer();
      localStorage.removeItem('gameState');
      localStorage.removeItem('idOponente');
      
    }else if(msg.Type === "Rewards"){
      this.finPartida.set({ 
        mostrar: true, 
        mensaje: `${this.finPartida().mensaje}\nHas ganado ${msg.Content} XP y ${msg.Extra} monedas` 
      });

    }else if (msg.Type === "EOC"){
      console.log('Fin de comunicación con el servidor');
      this.state.esMiTurno.set(false);
      this.wsSubscription?.unsubscribe();
      this.wsSubscription = undefined;
      this.timerService.stopTimer();
      if(!this.finPartida().mostrar){
        this.finPartidaHandler();
      }

      
      
    }else if (msg.Type === "Disconnection"){
      // El oponenete se ha desconectado
      // this.stopTimer();
      this.estadoDesconexion.set({ mostrar: true });

      // Pop up de espera a que se reconecte el oponenete con opción de salir (abandonar reto)

    }else if (msg.Type === "Reconnection"){
      // El oponenete se ha reconectado
      this.estadoDesconexion.set({ mostrar: false });
      this.challengeManager.setupOponent(Number(JSON.parse(msg.Content)), null);
      
      const tiempos = msg.Extra.split('%')
      this.timerService.miTiempo.set(Number(tiempos[0]));
      this.timerService.tiempoRival.set(Number(tiempos[1]));
      

      // Se oculta el pop-up de espera a reconexión
    }else if (msg.Type === "PauseRequest"){
      // El oponenete  pide pausar la partida
      // this.stopTimer();
      this.estadoPausa.set({ mostrar: true });
      
      // Pop up que pregunta si queremos pausar también (aceptar request)
      

    }else if (msg.Type === "Paused"){
      console.log("La partida ha sido pausada");
      this.finPartida.set({ mostrar: true, mensaje: 'La partida ha sido pausada' });
      // La partida se ha pausado 
      // Cierre del websocket + retorno a home ??
      this.timerService.stopTimer();
      

    }else if (msg.Type === "State"){

      console.log("Reaplicando log sobre estado existente");

      const log = msg.Content;
      if(!log){ return;}

      const events = this.parseGameLog(log);

      for (const ev of events) {
        this.applyAction(ev.action);
      }

      // limpieza visual por seguridad
      this.laserPath.set([]);
      this.piezaActiva.set(null);

    }else if (msg.Type === "RejectPause"){
      // La petición de pausa ha sido rechazada
      this.estadoPausa.set({ mostrar: false });
    }
    console.log(msg.Type);
    
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
    const request: SendAction = { Type: "PauseReject", Content: "" }; 
    this.wsService.sendAction(request);
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

      
      
      this.state.finPartida.set({ mostrar: false, mensaje: '' });

      this.waitingForConfirmation.set(false);
      this.state.permitSalida.set(true);
      this.router.navigate(['/home']);
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


  moverPiezaEnTablero(desde: {x: number, y: number}, hasta: {x: number, y: number}) {
    this.boardActions.moverPieza(this.listaPiezas, desde, hasta);
  }

  rotarPiezaEnTablero(pos: {x: number, y: number}, direccion: 'L' | 'R') {
    this.boardActions.rotarPieza(this.listaPiezas, pos, direccion);
  }

  eliminarPiezaEnTablero(pos: {x: number, y: number}) {
    this.boardActions.eliminarPieza(this.listaPiezas, pos, true); // true = animada en GameLogic
  }
  

  
 
  
private laserQueue: {path: {x:number,y:number}[], color: Boolean}[] = [];
private laserRunning = false;

dispararLaser(path: {x: number, y: number}[], color: Boolean) {
  this.laserQueue.push({ path, color });
  if (!this.laserRunning) {
    this.processLaserQueue();
  }
}

private processLaserQueue() {
  if (this.laserQueue.length === 0) {
    this.laserRunning = false;
    return;
  }
  this.laserRunning = true;
  const { path, color } = this.laserQueue.shift()!;
  this.laserPath.set(path);
  this.boardState.laserColor.set(color ? "blue" : "red");
  setTimeout(() => {
    this.laserPath.set([]);
    this.processLaserQueue();
  }, LASER_DURATION_MS);
}

  

  ocupado(x: number, y: number): PiezaData | null {
    const pieza = this.listaPiezas().find(p => p.x === x && p.y === y);
    return pieza ?? null;
  }
}


