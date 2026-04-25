import { Component, Inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";


@Component({
  selector: 'app-history-hall',
  imports: [TopRow],
  templateUrl: './history-hall.html',
  styleUrl: './history-hall.css',
})
export class HistoryHall {
  gameRepo = Inject(GameRepository);
  partidas = signal<GameResume[]> ([]);

  ngOnInit() {
    this.cargarPartidas();
  }

  // Método para cargar las partidas desde el repositorio
  cargarPartidas(){
    this.gameRepo.getPausedGame().subscribe({
      next: (data: GameResume[]) => {
        console.log('Partidas cargadas:', data);
        this.partidas.set(data);
      },
      error: (error:any) => {
        console.error('Error al cargar partidas:', error);
      }
    });
  
  }

  visualidaPartida(partida: GameResume) {
    this.gameRepo.historySelectedGame.set(partida);
    this.gameRepo.reproducirHistorial();
  
  }
}
