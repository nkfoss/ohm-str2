import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { EditWorkoutComponent } from './components/workout-list/edit-workout/edit-workout.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './interceptors/auth.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: AuthComponent },
    {
        path: 'workouts',
        component: WorkoutListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'workouts/edit',
        component: EditWorkoutComponent,
        canActivate: [AuthGuard],
    },
    { path: '**', redirectTo: 'home' }

];
