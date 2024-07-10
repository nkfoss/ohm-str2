import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';import {} from '@angular/common/http';
import { provideComponentStore } from '@ngrx/component-store';
import { ExerciseStore } from './store/exercise.store';
import { TagStore } from './store/tag.store';
import { WorkoutStore } from './store/workout.store';
;

export const appConfig: ApplicationConfig = {
    providers: [
    importProvidersFrom(HttpClientModule),
    provideRouter(routes),
    provideAnimations(),
    provideComponentStore(ExerciseStore),
    provideComponentStore(TagStore),
    provideComponentStore(WorkoutStore)
],
};
