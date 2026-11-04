import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './Services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // נדרש לעיצוב/reactivity של Material — ללא זה הדיאלוגים נפתחים "גולמיים".
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    // מצרף את ה-JWT לכל בקשה HTTP אוטומטית
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
