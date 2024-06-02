import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { EditWorkoutComponent } from './components/workout-list/edit-workout/edit-workout.component';
import { AuthComponent } from './auth/auth/auth.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    {
        path: 'workouts',
        component: WorkoutListComponent
    },
    {
        path: 'workouts/edit',
        component: EditWorkoutComponent
    },
    {
        path: 'sign-in',
        component: AuthComponent
    }
];
