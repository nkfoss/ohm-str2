import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideComponentStore } from '@ngrx/component-store';
import { ExerciseStore } from './store/exercise.store';
import { TagStore } from './store/tag.store';
import { WorkoutStore } from './store/workout.store';
import { AuthInterceptor } from './interceptors/auth.interceptor';
;

export const appConfig: ApplicationConfig = {
    providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    },
    provideComponentStore(ExerciseStore),
    provideComponentStore(TagStore),
    provideComponentStore(WorkoutStore)
],
};
