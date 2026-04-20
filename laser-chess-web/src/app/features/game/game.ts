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
import { GameLogicService } from '../../model/remote/game-logic-service';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NotificationGame, Board],
  templateUrl: './game.html',
  styleUrl: './game.css',
})





export class Game implements OnInit {
  // Inyectamos el servicio de Websocket
  private wsService = inject(Websocket);
  private remoteService = inject(Remote);
  timerService = inject(TimerService);
  gameService = inject(GameLogicService);
  private wsSubscription?: Subscription;
  
  TipoPieza = TipoPieza; // Hacer visible el template para toda la componente

  gameState = inject(GameState);
  listaPiezas = this.gameState.listaPiezas;
  laserPath = this.gameState.laserPath;
  piezaActiva = this.gameState.piezaActiva;
  esMiTurno = this.gameState.esMiTurno;
  soyAzul = this.gameState.soyAzul;

  estadoDesconexion = this.gameState.estadoDesconexion;
  estadoPausa = this.gameState.estadoPausa;
  finPartida = this.gameState.finPartida;

  miTiempo = this.timerService.miTiempo;
  tiempoRival = this.timerService.tiempoRival;

  nombreRival = this.gameState.nombreRival;
  miNombre = this.gameState.miNombre;

  permitSalida = this.gameService.permitSalida;
  



  
  columnas = 10;
  filas = 8;

  cont = 1; // Contado incremental para creación de piezas (id)
  id = this.remoteService.getAccountId();
    

  mostrarAvisoSalida = signal(false);
  aceptoInitial = signal(true);
  

  ngOnInit(): void {
    console.log('Suscribiéndome a WS en Game...');
  


    // Suscribimos al ReplaySubject que recibe los mensajes
    this.wsSubscription = this.wsService.gameMessages$.subscribe({
      next: (msg: MessageGame) => { 
        this.gameService.procesarAccion(msg);
        if (msg.Type === 'EOC') {
          console.log('EOC recibido en Game → cerrando todo');

          this.timerService.stopTimer();

          this.wsSubscription?.unsubscribe();
          this.wsSubscription = undefined;

          this.wsService.close();
        }
      },
      error: (err: any) => console.error('WS ERROR:', err),
      complete: () => console.log('WS COMPLETADO'),
    });


  }

  ngOnDestroy(): void {
    console.log('Destruyendo Game, limpiando suscripción');
    this.timerService.stopTimer();
    this.timerService.stopTimer();
    this.wsSubscription?.unsubscribe();
    this.wsSubscription = undefined;
    this.aceptoInitial.set(true);
    this.wsService.close();
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
    const origenAjedrez = this.gameService.toChess(origenPos.x, origenPos.y);
    const destinoAjedrez = this.gameService.toChess(destino.x, destino.y);

    // 2. Formamos el mensaje: "Te8:e7"
    const mensaje = `T${origenAjedrez}:${destinoAjedrez}`; //He quitado la T? la he vuelto a poner?
    
    console.log("Pidiendo permiso para mover:", mensaje);

    this.gameService.sendMovement(mensaje);
  }

  rotateSelected(angle: number) {
    const pieza = this.piezaActiva();
    if (pieza && this.esMiTurno()) {
      const direction = angle === 90 ? 'R' : 'L';

      // Formato: La1 o Rf8
      const pos = this.gameService.toChess(pieza.position().x, pieza.position().y);
      const mensaje = `${direction}${pos}`;
      console.log("Pidiendo permiso para rotar" + mensaje);

      this.gameService.sendMovement(mensaje);
      
    }
  }
}