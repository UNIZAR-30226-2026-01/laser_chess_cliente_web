import { Component, inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { MyProfile } from '../../model/user/MyProfile';


@Component({
  selector: 'app-history-hall',
  imports: [TopRow],
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
    const myId = this.userRepo.getId();
    var oponente = partida.p1_id;
    if(myId === partida.p1_id){
      oponente = partida.p2_id;
    }
    this.userRepo.getAccount(oponente).subscribe(profile => {
      this.historyService.rivalAvatar.set(profile.avatar || 1);
      this.boardState.skinRival.set(profile.piece_skin || 1);
    });

    this.userRepo.getOwnAccount().subscribe(profile => {
      this.historyService.miAvatar.set(profile.avatar || 1);
    });


    
   
    localStorage.setItem('historyGame', JSON.stringify(partida));
    
    this.router.navigate(['/history']);
  }
}
