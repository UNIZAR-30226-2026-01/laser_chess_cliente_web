import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi,HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './model/token/interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Registra las rutas definidas en app.routes.ts para que el sistema de navegación funcione
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // Habilitar interceptores (para el refreshtoken)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Permite múltiples interceptores (los @Injectable())
    }
  ]
};
