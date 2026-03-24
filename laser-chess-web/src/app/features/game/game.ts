import { Component, signal, OnInit, inject } from '@angular/core';
import { Pieza } from '../pieza/pieza';
import { PiezaData } from '../../model/game/PiezaData';
import { PiezaRival } from '../pieza-rival/pieza-rival';
import { Websocket } from '../../model/remote/websocket'; // Ajusta la ruta

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

  columnas = 10;
  filas = 8;
  
  listaPiezas = signal<PiezaData[]>([
    { id: 1, x: 4, y: 5, rotation: 0, color: 'red', esMia: true },
    { id: 2, x: 2, y: 2, rotation: 0, color: 'blue', esMia: false },
  ]);

  piezaActiva = signal<Pieza | null>(null);

  ngOnInit() {
    // 1. Conectar al abrir el juego
    this.wsService.connect('ws://localhost:8080');

    // 2. Escuchar al rival
    this.wsService.gameUpdates$.subscribe((accion) => {
      this.procesarAccionRival(accion);
    });
  }

  private procesarAccionRival(accion: any) {
    this.listaPiezas.update(piezas => 
      piezas.map(p => p.id === accion.pieceId 
        ? { ...p, x: accion.to.x, y: accion.to.y, rotation: accion.rotation } 
        : p
      )
    );
  }

  seleccionarPieza(pieza: Pieza) {
    if (this.piezaActiva()) {
      this.piezaActiva()?.showSpots.set(false);
    }
    if (this.piezaActiva() === pieza) {
      this.piezaActiva.set(null);
    } else {
      this.piezaActiva.set(pieza);
    }
  }

  deseleccionar(id: number, nuevaPos: {x: number, y: number}) {
    const piezaActual = this.piezaActiva();
    
    // Actualizamos nuestro estado local
    this.listaPiezas.update(piezas => 
      piezas.map(p => p.id === id ? { ...p, x: nuevaPos.x, y: nuevaPos.y } : p)
    );

    // ENVIAR AL BACKEND el movimiento
    this.wsService.sendAction({
      type: 'MOVE_PIECE',
      pieceId: id,
      to: nuevaPos,
      rotation: piezaActual?.rotation() || 0,
      playerId: 'yo'
    });

    this.piezaActiva.set(null);
  }

  rotateSelected(angle: number) {
    const pieza = this.piezaActiva();
    if (pieza) {
      pieza.rotate(angle);
      
      // Buscamos la data de la pieza para saber su ID y posición actual
      const data = this.listaPiezas().find(p => p.esMia); // Simplificado para el ejemplo
      
      if (data) {
        // ENVIAR AL BACKEND la rotación
        this.wsService.sendAction({
          type: 'MOVE_PIECE', // Usamos el mismo tipo o uno de rotación
          pieceId: data.id,
          to: { x: pieza.position().x, y: pieza.position().y },
          rotation: pieza.rotation(),
          playerId: 'yo'
        });
      }
      this.deseleccionarSinEnviar(); 
    }
  }

  private deseleccionarSinEnviar() {
    this.piezaActiva.set(null);
  }
}