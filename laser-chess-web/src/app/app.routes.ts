import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Result } from './features/result/result';


export const routes: Routes = [
    { path: '', component: Home },
    { path: 'game', component: Game },
    { path: 'result', component: Result },
];