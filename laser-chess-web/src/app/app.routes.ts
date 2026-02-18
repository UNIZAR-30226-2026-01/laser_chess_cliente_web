import { Routes } from '@angular/router';
<<<<<<< HEAD
import { Inicio } from './inicio/inicio';
import { Juego } from './juego/juego';
import { Perfil } from './perfil/perfil';

// Aquí se deben añadir objetos que conectan una ruta con un componente fijo
export const routes: Routes = [
    { path: 'inicio', component: Inicio },
    { path: 'juego', component: Juego },
    { path: 'perfil', component: Perfil }
];
=======
import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Result } from './features/result/result';


export const routes: Routes = [
    { path: '', component: Home },
    { path: 'game', component: Game },
    { path: 'result', component: Result },
];
>>>>>>> ainhoa
