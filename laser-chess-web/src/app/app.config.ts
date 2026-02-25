import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor/jwt.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Registra las rutas definidas en app.routes.ts para que el sistema de navegación funcione
    provideRouter(routes),
    // Configura la detección de cambios para que coaleszca eventos, mejorando el rendimiento en aplicaciones con muchas interacciones
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Configura el cliente HTTP para que incluya el interceptor de JWT en cada solicitud
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
};
