import { Component, inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { MyProfile } from '../../model/user/MyProfile';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-history-hall',
  imports: [TopRow, MatIconModule],
  templateUrl: './history-hall.html',
  styleUrl: './history-hall.css',
})

export class HistoryHall {
  gameRepo = inject(GameRepository);
  historyService = inject(HistoryService);
  userRepo = inject(UserRespository)
  router = inject(Router)
  partidas = signal<GameResume[]> ([]);
  infoCargada = signal(false);
  users = signal<Record<number, MyProfile>>({});
  boardState = inject(BoardState);

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
        this.cargarUsernames();
      },
      error: (error:any) => {
        console.error('Error al cargar partidas:', error);
      }
    });

  }

  cargarUsernames() {
    const myId = this.userRepo.getId();
    const idsToLoad = new Set<number>();

    // Recoger todos los IDs únicos
    this.partidas().forEach(game => {
      idsToLoad.add(game.p1_id);
      idsToLoad.add(game.p2_id);
    });

    // Cargar cada uno una sola vez
    idsToLoad.forEach(id => {
      if (this.users()[id]) return;

      this.userRepo.getAccount(id).subscribe(profile => {
        this.users.update(u => ({ ...u, [id]: profile }));
      });
    });
  }

  visualidaPartida(partida: GameResume) {

    this.historyService.historySelectedGame.set(partida);
    

    localStorage.setItem('historyGame', JSON.stringify(partida));
    
    this.router.navigate(['/history']);
  }
}
