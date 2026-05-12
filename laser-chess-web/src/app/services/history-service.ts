import { Injectable } from '@angular/core';
import { signal, inject} from '@angular/core';
import { PiezaData } from '../model/game/PiezaData';
import { TipoPieza } from '../model/game/TipoPieza'
import { GameResume } from '../model/game/GameResume';
import { UserRespository } from '../repository/user-respository';
import { BoardState } from '../utils/board-state'
import { BoardAction } from './board-action';
import { GameUtils } from '../utils/game-utils';
import { computed } from '@angular/core';
import { FriendSummaryExtended } from '../model/social/FriendSummaryExtended';
import { MyProfile } from '../model/user/MyProfile';




@Injectable({
  providedIn: 'root',
})

export class HistoryService {
  private userRepo = inject(UserRespository);

  TipoPieza = TipoPieza; 

  private boardActions = inject(BoardAction);
  
  private gameUtils = inject(GameUtils);
  private boardState = inject(BoardState);

  columnas = 10;
  filas = 8;

  popUpLimites = signal(false);
  popUpMensaje = signal('');  

  
  miNombre = signal<string>('');

  
  miTiempo = signal<number>(0);
  tiempoRival = signal<number>(0);
  
  listaPiezas = signal<PiezaData[]>([]);
  esMiTurno = signal(true);
  soyAzul = signal(true);
  cont = signal(1); // Contador incremental para creación de piezas (id)
  
  laserPath = signal<{x:number,y:number}[]>([]);

  indiceMovimiento = 0;
  movimientos : string[] = [];
  capturas: PiezaData[] = [];

  miAvatar = signal(1);

  turnoVisual = signal(true);

  perfilRival = signal<MyProfile>({
    userId: 0,
    username: "",
    mail: "",
    xp: 0,
    level: 0,
    avatar: 0,
    money: 0,
    board_skin: 0,
    piece_skin: 0,
    win_animation: 0,
    rankedPoints: 0
  });

  perfilRivalSummary = computed<FriendSummaryExtended>(() => {
    const perfil = this.perfilRival();

    return {
      account_id: perfil.userId,
      username: perfil.username,
      level: perfil.level,
      avatar: perfil.avatar,
      xp: perfil.xp,

      blitzElo: perfil.blitzElo,
      rapidElo: perfil.rapidElo,
      classicElo: perfil.classicElo,
      extendedElo: perfil.extendedElo
    };
  });

  historySelectedGame = signal<GameResume> (null as unknown as GameResume);
	



  inicializarTablero(){
    this.listaPiezas.set(this.boardState.iniciarTablero(this.historySelectedGame()?.board))
    this.cont.set(this.listaPiezas().length);
    // Dividir el log por acciones y aplicar a un array + añadir un iterador para saber por donde estamos
    this.indiceMovimiento = 0;
    console.log(this.historySelectedGame()?.movement_history);
    this.movimientos = this.historySelectedGame()?.movement_history.split(';');

    this.iniciarJugadores();
  }

  
  iniciarJugadores(){
    const   id = this.userRepo.getId();
    var oponente = this.historySelectedGame()?.p1_id;
    if(id === this.historySelectedGame()?.p1_id){
      oponente = this.historySelectedGame()?.p2_id;
    }
    if(oponente === 1){
      this.userRepo.getOwnAccount().subscribe(profile => {
        this.boardState.skinUsario.set(profile.piece_skin);
      });

    }else{
      const rivalProfile$ = this.userRepo.getAccount(oponente);
      rivalProfile$.subscribe(profile => {
        this.boardState.skinRival.set(profile.piece_skin);
        this.perfilRival.set(profile); 
      });
    }

    const soyP1 = id === this.historySelectedGame()?.p1_id;
    this.soyAzul.set(!soyP1);
    this.esMiTurno.set(soyP1);

     

    this.miTiempo.set(this.historySelectedGame()?.time_base || 0);
    this.tiempoRival.set(this.historySelectedGame()?.time_base || 0);

    this.userRepo.getOwnAccount().subscribe(profile => {
        this.miNombre.set(profile.username);
        this.miAvatar.set(profile.avatar - 9);
        this.boardState.skinUsario.set(profile.piece_skin);
      });
    
  }

  
  
    
  
  
 

  /*****************************************************************************/
  /*                  Procesamiento mensaje  del backend                       */
  /*****************************************************************************/


  applyAction(action: string, direccion: boolean) {

    const moveRegex = /^(T|R|L)([a-j]\d)(?::([a-j]\d))?(?:x([a-j]\d))?(?:%([^%]+)%)?(?:\{(\d+)\})?$/;
    const match = action.match(moveRegex);

    if (!match) {
      return;
    }

    const tipo = match[1];
    const desde = this.gameUtils.fromChess(match[2], this.soyAzul());
    const hasta = match[3] ? this.gameUtils.fromChess(match[3], this.soyAzul()) : null;
    const captura = match[4] ? this.gameUtils.fromChess(match[4], this.soyAzul()) : null;
    const laser = match[5];
    const tiempo = match[6];

    if(direccion){
      console.log("Avanzo");
    }else{
      console.log("Retrocedo")
    }
    // MOVE
    if (tipo === 'T' && desde && hasta) {
      console.log("Tengo que mover")
      if(direccion){
        this.moverPiezaEnTablero(desde, hasta);
      }else{
        this.moverPiezaEnTablero(hasta, desde);
      }
    }

    // ROTATE
    if (tipo === 'R' || tipo === 'L') {
      console.log("Tengo que rotar")
      if(direccion){
        this.rotarPiezaEnTablero(desde, tipo);
      }else{
        if (tipo === 'L'){
          this.rotarPiezaEnTablero(desde, 'R');
        }else{
          this.rotarPiezaEnTablero(desde, 'L');
       }
      }
    }
    
    const path = laser
        .split(',')
        .filter(c => c.length > 0)
        .map(c => this.gameUtils.fromChess(c,this.soyAzul()));
    this.dispararLaser(path);
    

    // CAPTURA
    if (captura) {
      if(direccion){
            const pieza = this.listaPiezas().find(p => p.x === captura.x && p.y === captura.y);
  
            if (pieza) {
              this.capturas.push(structuredClone(pieza)); // guardar
              this.eliminarPiezaEnTablero(captura);
            }
          }else{
            // En caso de retroceder, hay que volver a colocar la pieza capturada
            const pieza = this.capturas.pop();
            if (pieza) {
              this.listaPiezas.update(p => [...p, pieza]);
            }
          }
    }


    // Comprobar de quien es el primer movimiento
    if(this.esMiTurno()){
      this.miTiempo.set(Number(tiempo));
    }else{
      this.tiempoRival.set(Number(tiempo));
    }
    
    this.esMiTurno.set(!this.esMiTurno());
    
  }

  

    

  /*****************************************************************************/
  /*               Gestión y parseo de log tras reconexión                     */
  /*****************************************************************************/


  reconstruirEstado() {
    // estado inicial limpio
    this.listaPiezas.set(
      this.boardState.iniciarTablero(this.historySelectedGame()?.board)
    );

    this.esMiTurno.set(!this.soyAzul()); 
    this.turnoVisual.set(!this.soyAzul());
    this.capturas = [];
    this.laserPath.set([]);

    for (let i = 0; i < this.indiceMovimiento; i++) {
      if(i !== 0){this.turnoVisual.set(!this.turnoVisual());};
      this.applyAction(this.movimientos[i], true);
    }
  }

  avanzar() {
    this.indiceMovimiento++;
    if (this.indiceMovimiento >= this.movimientos.length) {
      this.popUpLimites.set(true);
      this.popUpMensaje.set('Se ha alcanzado el final de partida');
      this.indiceMovimiento--;
      return;
    }
    
    this.reconstruirEstado();
    
  }

  retroceder() {
    if (this.indiceMovimiento <= 0) {
      this.popUpLimites.set(true);
      this.popUpMensaje.set('Inicio de partida');
      return;
    }

    this.indiceMovimiento--;
    this.reconstruirEstado();
  }

  irAlPrimero(){
    this.indiceMovimiento = 0;
    this.laserPath.set([]);
    this.reconstruirEstado();
  }

  irAlUltimo(){
    this.indiceMovimiento = this.movimientos.length -1;
    this.reconstruirEstado();
  }

  
  
  

  


  moverPiezaEnTablero(desde: {x: number, y: number}, hasta: {x: number, y: number}) {
    this.boardActions.moverPieza(this.listaPiezas, desde, hasta);
  }

  rotarPiezaEnTablero(pos: {x: number, y: number}, direccion: 'L' | 'R') {
    this.boardActions.rotarPieza(this.listaPiezas, pos, direccion);
  }

  eliminarPiezaEnTablero(pos: {x: number, y: number}) {
    this.boardActions.eliminarPieza(this.listaPiezas, pos, false); 
  }

  dispararLaser(path: {x: number, y: number}[]) {
    this.boardState.laserColor.set(this.esMiTurno() ? 'blue' : 'red');
    this.laserPath.set(path);
  }

  
}


