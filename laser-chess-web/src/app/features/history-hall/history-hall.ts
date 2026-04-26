import { Component, inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-history-hall',
  imports: [TopRow],
  templateUrl: './history-hall.html',
  styleUrl: './history-hall.css',
})
export class HistoryHall {
  gameRepo = inject(GameRepository);
  historyService = inject(HistoryService);
  router = inject(Router)
  partidas = signal<GameResume[]> ([]);
  infoCargada = signal(false);

  ngOnInit() {
    this.cargarPartidas();
  }

  // Método para cargar las partidas desde el repositorio
  cargarPartidas(){
    this.gameRepo.getFinishedGame().subscribe({
      next: (data: GameResume[]) => {
        console.log('Partidas cargadas:', data);
        this.partidas.set(data);
        this.infoCargada.set(true);
      },
      error: (error:any) => {
        console.error('Error al cargar partidas:', error);
      }
    });
  
  }

  visualidaPartida(partida: GameResume) {
    this.historyService.historySelectedGame.set(partida);
    localStorage.setItem('historyGame', JSON.stringify(partida));
    this.router.navigate(['/history']);
  }
}
