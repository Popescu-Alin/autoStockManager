import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import Lara from '@primeng/themes/lara';
import { providePrimeNG } from 'primeng/config';

import { ApiClient } from '../api/src/api/api-client';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    ApiClient,
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          colorScheme: 'light',
          darkModeSelector: '.dark-mode',
        },
      },
    }),
  ],
};
