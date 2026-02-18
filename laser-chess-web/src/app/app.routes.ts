import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Game } from './features/game/game';
import { Result } from './features/result/result';
import { Profile } from './features/profile/profile';
import { Dashboard } from './pages/dashboard/dashboard';

// Define las rutas de la aplicación, cada ruta asocia una URL con un componente específico

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'game', component: Game },
    { path: 'result', component: Result },
    { path: 'profile', component: Profile },
    { path: 'dashboard', component: Dashboard }
];

