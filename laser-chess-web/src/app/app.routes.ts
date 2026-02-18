import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Juego } from './juego/juego';
import { Perfil } from './perfil/perfil';

// Aquí se deben añadir objetos que conectan una ruta con un componente fijo
export const routes: Routes = [
    { path: 'inicio', component: Inicio },
    { path: 'juego', component: Juego },
    { path: 'perfil', component: Perfil }
];
