import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Result } from './features/result/result';
import { Profile } from './features/profile/profile';
import { Shop } from './features/shop/shop';
import { Customize } from './features/customize/customize';
import { Social } from './features/social/social';
import { Ranking } from './features/ranking/ranking';


// Define las rutas de la aplicación, cada ruta asocia una URL con un componente específico

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'game', component: Game },
    { path: 'result', component: Result },
    { path: 'profile', component: Profile },
    { path: 'shop', component: Shop },
    { path: 'customize', component: Customize },
    { path: 'social', component: Social },
    { path: 'ranking', component: Ranking },
];

