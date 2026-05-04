import { Injectable } from '@angular/core';
import { signal, inject} from '@angular/core';
import { PiezaData } from '../model/game/PiezaData';
import { TipoPieza } from '../model/game/TipoPieza'
import { GameResume } from '../model/game/GameResume';
import { GameLogicService } from './game-logic-service';
import { GameUtils } from '../utils/game-utils';
import { UserRespository } from '../repository/user-respository';
import { BoardState } from '../utils/board-state'




@Injectable({
  providedIn: 'root',
})

export class HistoryService {
  private userRepo = inject(UserRespository);

  TipoPieza = TipoPieza; 

  private gameService = inject(GameLogicService);
  private gameUtils = inject(GameUtils);
  private boardState = inject(BoardState);

  columnas = 10;
  filas = 8;
  id = this.userRepo.getId();

  popUpLimites = signal(false);
  popUpMensaje = signal('');  

  
  nombreRival = signal<string>('');
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
  rivalAvatar = signal(1);
   

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
    if(this.historySelectedGame()?.p1_id == this.id){
      this.soyAzul.set(false);
      this.esMiTurno.set(true);
      const rivalProfile$ = this.userRepo.getAccount(this.historySelectedGame()?.p2_id);
      rivalProfile$.subscribe(profile => {
        this.nombreRival.set(profile.username);
        this.rivalAvatar.set(profile.avatar);
      });
    }else{
      this.soyAzul.set(true);
      this.esMiTurno.set(false);
      const rivalProfile$ = this.userRepo.getAccount(this.historySelectedGame()?.p1_id);
      rivalProfile$.subscribe(profile => {
        this.nombreRival.set(profile.username);
        this.rivalAvatar.set(profile.avatar);
      });
    }

    

    this.miTiempo.set(this.historySelectedGame()?.time_base || 0);
    this.tiempoRival.set(this.historySelectedGame()?.time_base || 0);
    this.miNombre.set(this.userRepo.getUsername() || 'Yo');
    
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
    this.capturas = [];

    for (let i = 0; i < this.indiceMovimiento; i++) {
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
    this.reconstruirEstado();
  }

  irAlUltimo(){
    this.indiceMovimiento = this.movimientos.length -1;
    this.reconstruirEstado();
  }

  
  
  

  


  /*****************************************************************************/
  /*                     Tras confirmación del backend                         */
  /*****************************************************************************/

  // Mueve la pieza al recibir confimariones del backend
  moverPiezaEnTablero(desde: {x: number, y: number}, hasta: {x: number, y: number}) {
    console.log(`Moviendo pieza de ${desde.x},${desde.y} a ${hasta.x},${hasta.y}`);
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
    console.log(`Rotando pieza en ${pos.x},${pos.y} hacia ${direccion}`);
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
    this.boardState.laserColor.set(this.esMiTurno() ? 'blue' : 'red');
    this.laserPath.set(path);
  }

  
}


