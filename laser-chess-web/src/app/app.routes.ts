import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Profile } from './features/profile/profile';
import { Shop } from './features/shop/shop';
import { Customize } from './features/customize/customize';
import { Social } from './features/social/social';
import { Ranking } from './features/ranking/ranking';
import { Signin } from './auth/signin/signin';
import { Login } from './auth/login/login';
import { Layout } from './shared/layout/layout';
import { Settings } from './features/settings/settings';
import { History } from './features/history/history';

import { AuthGuard } from './model/token/guard';
import { BlockReturn } from './shared/block-return/block-return'
import { HistoryHall } from './features/history-hall/history-hall';


// Define las rutas de la aplicación, cada ruta asocia una URL con un componente específico

export const routes: Routes = [

  // Pantalla inicial
  { path: '', component: Login },

  // Rutas públicas
  { path: 'signin', component: Signin },
  

  // Rutas privadas (con sidebar)
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard], //el guard para proteger las privadas
    children: [
      { path: 'home', component: Home },
      { path: 'settings', component: Settings },
      { path: 'history', component: History },
      { path: 'profile', component: Profile },
      { path: 'shop', component: Shop },
      { path: 'customize', component: Customize },
      { path: 'social', component: Social },
      { path: 'ranking', component: Ranking },
      { path: 'history-hall', component: HistoryHall },
    ]
  },
  { path: 'game', component: Game ,canDeactivate: [BlockReturn],
},
];

