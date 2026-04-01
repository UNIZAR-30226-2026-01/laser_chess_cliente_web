import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Result } from './features/result/result';
import { Profile } from './features/profile/profile';
import { Shop } from './features/shop/shop';
import { Customize } from './features/customize/customize';
import { Social } from './features/social/social';
import { Ranking } from './features/ranking/ranking';
import { Signin } from './auth/signin/signin';
import { Login } from './auth/login/login';
import { Layout } from './features/layout/layout';
import { Start } from './auth/start/start';
import { Settings } from './features/settings/settings';
import { History } from './features/history/history';
import { Pieza } from './features/pieza/pieza';

import { AuthGuard } from './model/token/guard';

// Define las rutas de la aplicación, cada ruta asocia una URL con un componente específico

export const routes: Routes = [

  // Pantalla inicial
  { path: '', component: Start },
  //{ path: 'home', component: Home },

  // Rutas públicas
  { path: 'signin', component: Signin },
  { path: 'login', component: Login },

  // Rutas privadas (con sidebar)
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard], //el guard para proteger las privadas
    children: [
      { path: 'home', component: Home },
      { path: 'settings', component: Settings },
      { path: 'history', component: History },
      { path: 'result', component: Result },
      { path: 'profile', component: Profile },
      { path: 'shop', component: Shop },
      { path: 'customize', component: Customize },
      { path: 'social', component: Social },
      { path: 'ranking', component: Ranking },
      { path: 'pieza', component: Pieza },
    ]
  },
  { path: 'game', component: Game },
];

